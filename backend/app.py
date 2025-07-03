from flask import Flask, request, jsonify
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
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
    
    user_password = generate_password_hash(user_password)

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                       (user_name, user_email, user_password))
        db.commit()
        db.close()
        return jsonify({"message": "User registered successfully"}), 201
    except sqlite3.IntegrityError:
        db.close()
        return jsonify({"message": "Username already exists"}), 409 # Conflict
    except Exception as e:
        db.close()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500
    
# --- Basic Route (for testing if the server is running) ---
@app.route('/')
def index():
    return "NetJam Backend is running!"

if __name__ == '__main__':
    app.run(debug=True)