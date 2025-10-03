"""
Business: CRUD операции с событиями и управление ответственными
Args: event - dict с httpMethod, body, headers, queryStringParameters
      context - объект с request_id и другими атрибутами
Returns: HTTP response с данными событий или ошибкой
"""

import json
import os
import jwt
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
        return handle_get_events(event, user)
    elif method == 'POST':
        return handle_create_event(event, user)
    elif method == 'PUT':
        return handle_update_event(event, user)
    elif method == 'DELETE':
        return handle_delete_event(event, user)
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }

def handle_get_events(event: Dict[str, Any], user: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cur = conn.cursor()
    
    params = event.get('queryStringParameters') or {}
    event_id = params.get('id')
    
    if event_id:
        cur.execute("""
            SELECT e.id, e.title, e.type, e.date, e.time, e.end_time, e.end_date,
                   e.location, e.vks_link, e.description, e.status, e.region_name,
                   e.is_multi_day, e.created_at, e.updated_at
            FROM events e
            WHERE e.id = %s
        """, (event_id,))
        
        event_data = cur.fetchone()
        
        if not event_data:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Event not found'})
            }
        
        cur.execute("""
            SELECT u.id, u.full_name, u.position
            FROM users u
            JOIN event_responsible er ON u.id = er.user_id
            WHERE er.event_id = %s
        """, (event_id,))
        
        responsible = [{'id': r[0], 'name': r[1], 'position': r[2]} for r in cur.fetchall()]
        
        cur.execute("""
            SELECT reminder_text
            FROM event_reminders
            WHERE event_id = %s
        """, (event_id,))
        
        reminders = [r[0] for r in cur.fetchall()]
        
        result = {
            'id': str(event_data[0]),
            'title': event_data[1],
            'type': event_data[2],
            'date': event_data[3].isoformat(),
            'time': str(event_data[4]) if event_data[4] else None,
            'endTime': str(event_data[5]) if event_data[5] else None,
            'endDate': event_data[6].isoformat() if event_data[6] else None,
            'location': event_data[7],
            'vksLink': event_data[8],
            'description': event_data[9],
            'status': event_data[10],
            'regionName': event_data[11],
            'isMultiDay': event_data[12],
            'responsible': responsible,
            'reminders': reminders,
            'createdAt': event_data[13].isoformat()
        }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }
    
    cur.execute("""
        SELECT e.id, e.title, e.type, e.date, e.time, e.end_time, e.end_date,
               e.location, e.vks_link, e.description, e.status, e.region_name,
               e.is_multi_day, e.created_at, e.updated_at
        FROM events e
        ORDER BY e.date DESC, e.time DESC
    """)
    
    events_list = []
    for row in cur.fetchall():
        event_id = row[0]
        
        cur.execute("""
            SELECT u.id, u.full_name, u.position
            FROM users u
            JOIN event_responsible er ON u.id = er.user_id
            WHERE er.event_id = %s
        """, (event_id,))
        
        responsible = [{'id': r[0], 'name': r[1], 'position': r[2]} for r in cur.fetchall()]
        
        cur.execute("""
            SELECT reminder_text
            FROM event_reminders
            WHERE event_id = %s
        """, (event_id,))
        
        reminders = [r[0] for r in cur.fetchall()]
        
        events_list.append({
            'id': str(row[0]),
            'title': row[1],
            'type': row[2],
            'date': row[3].isoformat(),
            'time': str(row[4]) if row[4] else None,
            'endTime': str(row[5]) if row[5] else None,
            'endDate': row[6].isoformat() if row[6] else None,
            'location': row[7],
            'vksLink': row[8],
            'description': row[9],
            'status': row[10],
            'regionName': row[11],
            'isMultiDay': row[12],
            'responsible': responsible,
            'reminders': reminders,
            'createdAt': row[13].isoformat()
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'events': events_list})
    }

def handle_create_event(event: Dict[str, Any], user: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        time_value = body_data.get('time') or '00:00'
        end_time_value = body_data.get('endTime') or None
        
        cur.execute("""
            INSERT INTO events (title, type, date, time, end_time, end_date, location, vks_link, 
                              description, status, region_name, is_multi_day, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            body_data.get('title'),
            body_data.get('type'),
            body_data.get('date'),
            time_value,
            end_time_value,
            body_data.get('endDate') or None,
            body_data.get('location') or None,
            body_data.get('vksLink') or None,
            body_data.get('description') or None,
            body_data.get('status', 'scheduled'),
            body_data.get('regionName') or None,
            body_data.get('isMultiDay', False),
            user['user_id']
        ))
        
        event_id = cur.fetchone()[0]
        
        for resp in body_data.get('responsible', []):
            cur.execute("""
                INSERT INTO event_responsible (event_id, user_id)
                VALUES (%s, %s)
            """, (event_id, resp['id']))
        
        for reminder in body_data.get('reminders', []):
            cur.execute("""
                INSERT INTO event_reminders (event_id, reminder_text)
                VALUES (%s, %s)
            """, (event_id, reminder))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'id': event_id, 'message': 'Event created'})
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

def handle_update_event(event: Dict[str, Any], user: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    event_id = body_data.get('id')
    
    if not event_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Event ID required'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        time_value = body_data.get('time') or '00:00'
        end_time_value = body_data.get('endTime') or None
        
        cur.execute("""
            UPDATE events
            SET title = %s, type = %s, date = %s, time = %s, end_time = %s, end_date = %s,
                location = %s, vks_link = %s, description = %s, status = %s,
                region_name = %s, is_multi_day = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (
            body_data.get('title'),
            body_data.get('type'),
            body_data.get('date'),
            time_value,
            end_time_value,
            body_data.get('endDate') or None,
            body_data.get('location') or None,
            body_data.get('vksLink') or None,
            body_data.get('description') or None,
            body_data.get('status'),
            body_data.get('regionName') or None,
            body_data.get('isMultiDay', False),
            event_id
        ))
        
        if user.get('role') == 'admin':
            cur.execute("DELETE FROM event_responsible WHERE event_id = %s", (event_id,))
            
            for resp in body_data.get('responsible', []):
                cur.execute("""
                    INSERT INTO event_responsible (event_id, user_id)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING
                """, (event_id, resp['id']))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Event updated'})
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

def handle_delete_event(event: Dict[str, Any], user: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    event_id = params.get('id')
    
    if not event_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Event ID required'})
        }
    
    if user.get('role') != 'admin':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Only admin can delete events'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("DELETE FROM events WHERE id = %s", (event_id,))
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Event deleted'})
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