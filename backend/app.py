from flask import Flask, request, jsonify
import sqlite3, os
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
jwt = JWTManager(app)
DATABASE = 'netjam.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# --- API Endpoint: User Registration ---
@app.route('/register', methods = ['POST'])
def register_user():
    #get users data from web app
    user_data = request.get_json()
    #return error message if no data
    if not user_data:
        return jsonify({"message": "Invalid JSON data"}), 400
    
    user_name = user_data.get('username')
    user_email = user_data.get('email')
    user_password = user_data.get('password')
    
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
        return jsonify({"message": "User registered successfully"}), 201
    except sqlite3.IntegrityError as e:
        db.close()
        print("IntegrityError:", e)  # Debug print
        return jsonify({"message": "Username already exists"}), 409 # Conflict
    except Exception as e:
        db.close()
        print("Exception:", e)  # Debug print
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# --- Implement user login API endpoint --- 
@app.route('/login', methods = ['POST'])
def user_login():
    user_entries = request.get_json()

    # return an error message if entries empty or truncated
    if not user_entries :
        return jsonify({"message" : "Invalid json data"}) , 400
    
    # get user entries(username or mail and password)
    usernameentered = user_entries.get('usernameentry')
    pass_entered = user_entries.get('passentry')
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

# --- Basic Route (for testing if the server is running) ---
# Protected route
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@app.route('/')
def index():
    return "NetJam Backend is running!"

if __name__ == '__main__':
    app.run(debug=True)