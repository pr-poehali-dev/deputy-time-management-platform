"""
Business: Управление пользователями (только для администраторов)
Args: event - dict с httpMethod, body, headers
      context - объект с request_id и другими атрибутами  
Returns: HTTP response со списком пользователей или результатом операции
"""

import json
import os
import jwt
import bcrypt
from typing import Dict, Any, Optional

def get_db_connection():
    import psycopg2
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def verify_token(headers: Dict[str, str]) -> Optional[Dict[str, Any]]:
    token = headers.get('x-auth-token') or headers.get('X-Auth-Token')
    if not token:
        return None
    
    jwt_secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        return payload
    except:
        return None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    user = verify_token(event.get('headers', {}))
    if not user:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    if method == 'GET':
        return handle_get_users(user)
    elif method == 'POST':
        if user.get('role') != 'admin':
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Admin access required'})
            }
        return handle_create_user(event)
    elif method == 'PUT':
        if user.get('role') != 'admin':
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Admin access required'})
            }
        return handle_update_user(event)
    elif method == 'DELETE':
        if user.get('role') != 'admin':
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Admin access required'})
            }
        return handle_delete_user(event)
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }

def handle_get_users(user: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT id, email, full_name, position, role, created_at
        FROM users
        ORDER BY role DESC, full_name
    """)
    
    users_list = []
    for row in cur.fetchall():
        users_list.append({
            'id': row[0],
            'email': row[1],
            'full_name': row[2],
            'position': row[3],
            'role': row[4],
            'created_at': row[5].isoformat()
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'users': users_list})
    }

def handle_create_user(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    
    email = body_data.get('email')
    password = body_data.get('password')
    full_name = body_data.get('full_name')
    position = body_data.get('position', '')
    role = body_data.get('role', 'user')
    
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
        cur.execute("""
            INSERT INTO users (email, password_hash, full_name, position, role)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (email, password_hash, full_name, position, role))
        
        user_id = cur.fetchone()[0]
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'id': user_id, 'message': 'User created'})
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def handle_update_user(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    user_id = body_data.get('id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User ID required'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        updates = []
        params = []
        
        if 'full_name' in body_data:
            updates.append('full_name = %s')
            params.append(body_data['full_name'])
        
        if 'position' in body_data:
            updates.append('position = %s')
            params.append(body_data['position'])
        
        if 'role' in body_data:
            updates.append('role = %s')
            params.append(body_data['role'])
        
        if 'password' in body_data:
            password_hash = bcrypt.hashpw(body_data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            updates.append('password_hash = %s')
            params.append(password_hash)
        
        updates.append('updated_at = CURRENT_TIMESTAMP')
        params.append(user_id)
        
        query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
        cur.execute(query, params)
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'User updated'})
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def handle_delete_user(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    user_id = params.get('id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User ID required'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'User deleted'})
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
