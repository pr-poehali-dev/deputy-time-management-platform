"""
Business: Аутентификация пользователей и управление сессиями
Args: event - dict с httpMethod, body, headers
      context - объект с request_id и другими атрибутами
Returns: HTTP response с токеном или ошибкой
"""

import json
import os
import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Dict, Any

def get_db_connection():
    import psycopg2
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'login':
            return handle_login(body_data)
        elif action == 'verify':
            return handle_verify(event.get('headers', {}))
        elif action == 'register':
            return handle_register(body_data)
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid action'})
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }

def handle_login(data: Dict[str, Any]) -> Dict[str, Any]:
    login = data.get('login')
    password = data.get('password')
    
    print(f"DEBUG: Login attempt - login={login}, has_password={bool(password)}")
    
    if not login or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Логин и пароль обязательны'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    login_escaped = login.replace("'", "''")
    query = f"SELECT id, email, password_hash, full_name, position, role FROM users WHERE login = '{login_escaped}'"
    print(f"DEBUG: Executing query: {query}")
    cur.execute(query)
    user = cur.fetchone()
    print(f"DEBUG: User found: {bool(user)}")
    
    cur.close()
    conn.close()
    
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный логин или пароль'})
        }
    
    user_id, user_email, password_hash, full_name, position, role = user
    
    print(f"DEBUG: Checking password for user_id={user_id}")
    print(f"DEBUG: Password hash from DB: {password_hash[:20]}...")
    
    try:
        password_match = bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
        print(f"DEBUG: Password match: {password_match}")
        
        if not password_match:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный логин или пароль'})
            }
    except Exception as e:
        print(f"DEBUG: Exception during password check: {str(e)}")
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный логин или пароль'})
        }
    
    jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    token = jwt.encode(
        {
            'user_id': user_id,
            'email': user_email,
            'role': role,
            'exp': datetime.utcnow() + timedelta(days=7)
        },
        jwt_secret,
        algorithm='HS256'
    )
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'token': token,
            'user': {
                'id': user_id,
                'email': user_email,
                'full_name': full_name,
                'position': position,
                'role': role
            }
        })
    }

def handle_verify(headers: Dict[str, str]) -> Dict[str, Any]:
    token = headers.get('x-auth-token') or headers.get('X-Auth-Token')
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No token provided'})
        }
    
    jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        user_id = int(payload['user_id'])
        cur.execute(
            f"SELECT id, email, full_name, position, role FROM users WHERE id = {user_id}"
        )
        user = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if not user:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found'})
            }
        
        user_id, email, full_name, position, role = user
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'user': {
                    'id': user_id,
                    'email': email,
                    'full_name': full_name,
                    'position': position,
                    'role': role
                }
            })
        }
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Token expired'})
        }
    except jwt.InvalidTokenError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'})
        }

def handle_register(data: Dict[str, Any]) -> Dict[str, Any]:
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    position = data.get('position', '')
    role = data.get('role', 'user')
    
    if not email or not password or not full_name:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email, password and full_name required'})
        }
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        email_escaped = email.replace("'", "''")
        password_hash_escaped = password_hash.replace("'", "''")
        full_name_escaped = full_name.replace("'", "''")
        position_escaped = position.replace("'", "''")
        role_escaped = role.replace("'", "''")
        
        cur.execute(
            f"INSERT INTO users (email, password_hash, full_name, position, role) VALUES ('{email_escaped}', '{password_hash_escaped}', '{full_name_escaped}', '{position_escaped}', '{role_escaped}') RETURNING id"
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'User created successfully',
                'user_id': user_id
            })
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Registration failed: {str(e)}'})
        }