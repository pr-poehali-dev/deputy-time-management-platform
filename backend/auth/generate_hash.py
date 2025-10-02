import bcrypt

password = "admin123"
password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
print(f"Password hash: {password_hash}")
