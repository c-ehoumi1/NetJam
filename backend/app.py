from flask import Flask, request, jsonify, render_template, redirect
import sqlite3, os, re
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)

template_dir = os.path.abspath('../web_app/templates')
app = Flask(__name__, template_folder=template_dir)
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
jwt = JWTManager(app)
DATABASE = 'netjam.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def validate_tags(tag_string):
    if not tag_string:
        return []
    
    tags = [t.strip().lower() for t in tag_string.split(',') if t.strip()]
    valid_tags = []
    errors = []
    
    for tag in tags:
        if not re.match(r'^[a-z0-9-_]{2,30}$', tag):
            errors.append(f"Invalid tag: '{tag}'")
            continue
        
        if tag in valid_tags:
            continue  # Skip duplicates
            
        valid_tags.append(tag)
    
    return {
        'valid_tags': valid_tags,
        'errors': errors,
        'is_valid': not errors
    }

# --- API Endpoint: User Registration ---
@app.route('/register', methods = ['GET', 'POST'])
def register_user():
    if request.method == 'GET':
        return render_template('register.html')
    
    #get users data from web app
    user_name = request.form.get('username')
    user_email = request.form.get('email')
    user_password = request.form.get('password')
    
    if not user_name or not user_password or not user_email:
        return jsonify({"message": "Username, mail and password are required"}), 400
    print("Registering:", user_name, user_email)  # Debug print
    user_password = generate_password_hash(user_password)

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                       (user_name, user_email, user_password))
        db.commit()
        db.close()
        return redirect('/login')
    except sqlite3.IntegrityError as e:
        db.close()
        print("IntegrityError:", e)  # Debug print
        return jsonify({"message": "Username already exists"}), 409 # Conflict
    except Exception as e:
        db.close()
        print("Exception:", e)  # Debug print
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# --- Implement user login API endpoint --- 
@app.route('/login', methods = ['GET', 'POST'])
def user_login():
    if request.method == 'GET':
        return render_template('login.html')
    
    # get user entries(username or mail and password)
    usernameentered = request.form.get('usernameentry')
    pass_entered = request.form.get('passentry')
    if not usernameentered or not pass_entered:
        return jsonify({"message": "Username and password are required"}), 400

    # compare user password entered with password saved in db for that username
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (usernameentered,) )
    user = cursor.fetchone()
    db.close()
    #return message depending on credentials crorrectness
    if user and check_password_hash(user['password_hash'], pass_entered) :
        #If successful, generating a token (e.g., JWT) for session management and sending it back to the client. This token will then be used for subsequent authenticated requests
        access_token = create_access_token(identity=str(user['user_id']))
        #redirect user to profile page
        return jsonify(access_token=access_token, message="Login successful"), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

#--- API Endpoint to receive webclips from the user
@app.route('/save_resource', methods=["POST"])
@jwt_required()
def save_resource():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No data provided"}), 400

    url = data.get('url')
    description = data.get('description')
    tags_string = data.get('tags')
    page_capture = data.get('pagecapture')
    privacy_setting = data.get('privacy_setting')
    
    tags_validation = validate_tags(tags_string)
    
    if not tags_validation['is_valid']:
        return jsonify({
            'success': False,
            'errors': tags_validation['errors']
        }), 400
    
    tags_validated = tags_validation['valid_tags']
    db = get_db()
    cursor = db.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO resources (user_id, url, description, preview, privacy_setting) VALUES (?, ?, ?, ?, ?)",
            (current_user_id, url, description, page_capture, privacy_setting)
        )
        resource_id = cursor.lastrowid
        
        for tag_name in tags_validated:
            cursor.execute("SELECT tag_id FROM tags WHERE tag_name = ?", (tag_name,))
            tag_result = cursor.fetchone()
            
            if tag_result:
                tag_id = tag_result[0]
            else:
                cursor.execute("INSERT INTO tags (tag_name) VALUES (?)", (tag_name,))
                tag_id = cursor.lastrowid
            
            # Link the tag to the resource in a new joining table (e.g., resource_tags)
            cursor.execute("INSERT INTO resource_tags (resource_id, tag_id) VALUES (?, ?)",
                           (resource_id, tag_id))

        db.commit()
        db.close()
        
    except sqlite3.IntegrityError as e:
        db.close()
        print("IntegrityError:", e)
        return jsonify({"message": "Error saving in the db"}), 409
    except Exception as e:
        db.close()
        print("Exception:", e)
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500
        
    return jsonify({"message": "Resource saved successfully"}), 200

# Route to serve the profile page HTML
@app.route("/profile", methods=["GET"])
def serve_profile_page():
    return render_template('profile.html')

# API endpoint to retrieve user profile data (`/api/profile`)
@app.route("/api/profile", methods=["GET"])
@jwt_required()
def get_profile_data():
    current_user_id = get_jwt_identity()
    current_user_id = int(current_user_id)
    db = get_db()
    cursor = db.cursor()

    try:
        # Get user details
        cursor.execute("SELECT user_id, username, email, profile_picture_url FROM users WHERE user_id = ?", (current_user_id,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"message": "User not found"}), 404
        user_data = dict(user)

        # Get saved resources with their tags
        cursor.execute("""
            SELECT
                r.resource_id, r.url, r.title, r.description, r.privacy_setting,
                GROUP_CONCAT(t.tag_name) AS tags
            FROM
                resources AS r
            LEFT JOIN
                resource_tags AS rt ON r.resource_id = rt.resource_id
            LEFT JOIN
                tags AS t ON rt.tag_id = t.tag_id
            WHERE
                r.user_id = ?
            GROUP BY
                r.resource_id
        """, (current_user_id,))
        resources = [dict(row) for row in cursor.fetchall()]

        # Get collections
        cursor.execute("SELECT collection_id, collection_name FROM collections WHERE user_id = ?", (current_user_id,))
        collections = [dict(row) for row in cursor.fetchall()]
        
        # Get follower and following counts
        cursor.execute("SELECT COUNT(*) FROM followers WHERE followed_id = ?", (current_user_id,))
        followers_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM followers WHERE follower_id = ?", (current_user_id,))
        following_count = cursor.fetchone()[0]

        return jsonify({
            "user": user_data,
            "resources": resources,
            "collections": collections,
            "social_stats": {
                "followers": followers_count,
                "following": following_count
            }
        }), 200

    except sqlite3.Error as e:
        print(f"Database error fetching profile: {e}")
        return jsonify({"message": "A database error occurred"}), 500
    except Exception as e:
        print(f"Unexpected error fetching profile: {e}")
        return jsonify({"message": "An unexpected error occurred"}), 500
    finally:
        if db:
            db.close()

@app.route('/')
def index():
    return "NetJam Backend is running!"

if __name__ == '__main__':
    app.run(debug=True)