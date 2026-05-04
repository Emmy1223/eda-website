# app.py - Backend for EDA Website
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime
import hashlib

app = Flask(__name__)
CORS(app)  # Allow your frontend to communicate

# Database setup
def init_db():
    conn = sqlite3.connect('eda_academy.db')
    cursor = conn.cursor()
    
    # Students table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            course TEXT NOT NULL,
            enrollment_date TEXT NOT NULL,
            status TEXT DEFAULT 'active'
        )
    ''')
    
    # Messages table (for your chat widget)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            message TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            replied BOOLEAN DEFAULT 0
        )
    ''')
    
    # Courses table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            price REAL NOT NULL,
            duration TEXT NOT NULL,
            description TEXT,
            category TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# API Endpoints
@app.route('/api/enroll', methods=['POST'])
def enroll_student():
    """Handle enrollment from your frontend"""
    data = request.json
    
    conn = sqlite3.connect('eda_academy.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO students (name, email, course, enrollment_date)
            VALUES (?, ?, ?, ?)
        ''', (data['name'], data['email'], data['course'], datetime.now().isoformat()))
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Enrollment successful!'}), 201
    
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'message': 'Email already enrolled'}), 409
    
    finally:
        conn.close()

@app.route('/api/messages', methods=['POST'])
def submit_message():
    """Handle your chat widget messages"""
    data = request.json
    
    conn = sqlite3.connect('eda_academy.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO messages (email, message, timestamp)
        VALUES (?, ?, ?)
    ''', (data.get('email', ''), data['message'], datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Message received!'})

@app.route('/api/courses', methods=['GET'])
def get_courses():
    """Return course catalog for dynamic rendering"""
    conn = sqlite3.connect('eda_academy.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM courses')
    courses = cursor.fetchall()
    conn.close()
    
    # Convert to list of dictionaries
    course_list = []
    for course in courses:
        course_list.append({
            'id': course[0],
            'title': course[1],
            'price': course[2],
            'duration': course[3],
            'description': course[4],
            'category': course[5]
        })
    
    return jsonify(course_list)

@app.route('/api/admin/stats', methods=['GET'])
def get_stats():
    """Admin dashboard statistics (add authentication!)"""
    conn = sqlite3.connect('eda_academy.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM students')
    total_students = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM messages WHERE replied=0')
    unread_messages = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'total_students': total_students,
        'unread_messages': unread_messages,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)