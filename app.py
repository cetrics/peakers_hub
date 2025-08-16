import os
from flask import Flask, request, jsonify, render_template,Blueprint
import jwt
import datetime
from functools import wraps
import mysql.connector
from mysql.connector import Error
from mysql.connector import pooling
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from flask_cors import CORS

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)
app.config['SECRET_KEY'] = 'your-secret-key-here'
# Correct path for upload folder: static/uploads
UPLOAD_FOLDER = os.path.join(app.static_folder, "uploads")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Ensure the folder exists at startup
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# File size limit (5MB)
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024

# Allowed file extensions
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


# ✅ MySQL Configuration
mysql_settings = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "peakers_hub",
}

try:
    # ✅ Create a connection pool
    pool = pooling.MySQLConnectionPool(
        pool_name="mypool",
        pool_size=5,  # Adjust size (min: 1, max: 32)
        **mysql_settings
    )
    print("✅ Connection pool created successfully")
except mysql.connector.Error as err:
    print(f"❌ Failed to create connection pool: {err}")
    pool = None  # Set pool to None if creation fails

def get_db_connection():
    global pool
    if pool is None:
        print("❌ Connection pool is not available")
        return None
    try:
        conn = pool.get_connection()
        if conn is None:
            print("❌ Failed to get a valid connection from pool (None returned)")
            return None
        if conn.is_connected():
            print("✅ Successfully acquired connection from pool")
            return conn
        else:
            print("❌ Connection acquired, but not connected")
            conn.close()
            return None
    except mysql.connector.errors.PoolError as pool_err:
        print(f"❌ Connection pool exhausted: {pool_err}")
        return None
    except mysql.connector.Error as err:
        print(f"❌ Database connection failed: {err}")
        return None

# Mock admin data
ADMIN_CREDENTIALS = {
    "admin@peakershub.com": {
        "password": "securepassword123",
        "name": "Admin User"
    }
}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['username', 'email', 'password', 'phone', 'id_number']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400
    
    # Hash the password
    hashed_password = generate_password_hash(data['password'])
    
    # Get database connection
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = conn.cursor(dictionary=True)
        
        # Check if username or email already exists
        cursor.execute("""
            SELECT id FROM users 
            WHERE username = %s OR email = %s
        """, (data['username'], data['email']))
        existing_user = cursor.fetchone()
        
        if existing_user:
            return jsonify({'error': 'Username or email already exists'}), 400
        
        # Insert new user
        cursor.execute("""
            INSERT INTO users (
                username, email, password_hash, 
                first_name, last_name, phone, 
                id_number, date_of_birth, gender,
                user_type, is_verified, created_at, updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data['username'],
            data['email'],
            hashed_password,
            data.get('first_name'),
            data.get('last_name'),
            data['phone'],
            data['id_number'],
            data.get('date_of_birth'),
            data.get('gender'),
            'customer',  # Default user type
            False,       # Not verified by default
            datetime.datetime.now(),
            datetime.datetime.now()
        ))
        
        conn.commit()
        return jsonify({'message': 'Registration successful'}), 201
        
    except mysql.connector.Error as err:
        return jsonify({'error': f'Database error: {err}'}), 500
    finally:
        if conn and conn.is_connected():
            conn.close()

# Main React entry routes
@app.route("/")
def index():
    current_path = request.path
    return render_template("index.html", path=current_path)

@app.route('/<path:path>')
def catch_all(path):
    return render_template('index.html', path='/' + path)


# Token-check decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    redirect_to = data.get('redirect_to', '/')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password required'}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

        if not check_password_hash(user['password_hash'], password):
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

        # Normalize role
        role = (user['user_type'] or "").lower()

        if role not in ['admin', 'customer']:
            return jsonify({'success': False, 'message': 'Access denied'}), 403

        # Create token
        eat_time_now = datetime.datetime.utcnow() + datetime.timedelta(hours=3)
        exp_time = eat_time_now + datetime.timedelta(hours=8)

        token = jwt.encode({
            'id': user['id'],
            'email': user['email'],
            'role': role,
            'exp': exp_time
        }, app.config['SECRET_KEY'])

        # Update last login
        cursor.execute("UPDATE users SET last_login = %s WHERE id = %s", (eat_time_now, user['id']))
        conn.commit()

        # Decide redirect
        if role == "admin":
            next_page = "/dashboard"
        else:  # customer
            next_page = redirect_to or "/"

        return jsonify({
            'success': True,
            'token': token,
            'role': role,
            'redirect': next_page,
            'name': f"{user['first_name']} {user['last_name']}"
        })

    except mysql.connector.Error as err:
        print(f"❌ Database query failed: {err}")
        return jsonify({'success': False, 'message': 'Internal server error'}), 500
    finally:
        cursor.close()
        conn.close()


# Protected route
@app.route('/api/admin/dashboard')
@token_required
def admin_dashboard():
    return jsonify({'message': 'Welcome to the admin dashboard'})


@app.route("/api/products", methods=["GET"])
def get_products():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)

        # Fetch products and their category names
        cursor.execute("""
            SELECT p.*, c.name AS category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
        """)
        products = cursor.fetchall()

        # Enrich each product with colors, sizes, and images
        for product in products:
            product_id = product["id"]

            # Fetch colors
            cursor.execute("""
                SELECT cl.color_id, cl.name 
                FROM product_colors pc
                JOIN colors cl ON pc.color_id = cl.color_id
                WHERE pc.product_id = %s
            """, (product_id,))
            product["colors"] = cursor.fetchall()

            # Fetch sizes
            cursor.execute("""
                SELECT s.size_id, s.size_name 
                FROM product_sizes ps
                JOIN sizes s ON ps.size_id = s.size_id
                WHERE ps.product_id = %s
            """, (product_id,))
            product["sizes"] = cursor.fetchall()

            # Fetch images
            cursor.execute("""
                SELECT image_filename 
                FROM product_images 
                WHERE product_id = %s
            """, (product_id,))
            product["images"] = [row["image_filename"] for row in cursor.fetchall()]

        return jsonify(products), 200

    except Exception as e:
        print("❌ Error fetching products:", e)
        return jsonify({"error": "An error occurred while retrieving products"}), 500

    finally:
        cursor.close()
        conn.close()



@app.route("/api/products", methods=["POST"])
def add_product():
    images = request.files.getlist("images")

    if not images or all(img.filename == '' for img in images):
        return jsonify({"error": "No images uploaded"}), 400

    saved_filenames = []

    # Process and save each image
    for image in images:
        if image and allowed_file(image.filename):
            filename = secure_filename(image.filename)
            unique_filename = f"{uuid.uuid4().hex}_{filename}"
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

            try:
                image.save(image_path)
                saved_filenames.append(unique_filename)
            except Exception as e:
                return jsonify({"error": f"Failed to save image: {str(e)}"}), 500

    # Extract form data
    form_data = request.form
    name = form_data.get("name")
    description = form_data.get("description")
    price = form_data.get("price")
    category_id = form_data.get("category_id")
    brand = form_data.get("brand")
    material = form_data.get("material")
    stock_quantity = form_data.get("stock_quantity", 0)
    colors = form_data.getlist("colors")
    sizes = form_data.getlist("sizes")
    discount = form_data.get("discount")

    # Validate required fields
    if not all([name, description, price, category_id, brand, material]):
        # Cleanup saved images
        for filename in saved_filenames:
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.exists(image_path):
                os.remove(image_path)
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "DB connection failed"}), 500

    try:
        cursor = conn.cursor()

        discount = float(discount) if discount else None

        # Insert product (without image_url field)
        cursor.execute("""
            INSERT INTO products (
                name, description, price, category_id, brand, 
                material, stock_quantity,discount, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s,%s, NOW())
        """, (name, description, price, category_id, brand,
              material, stock_quantity, discount))
        
        product_id = cursor.lastrowid

        # Insert product_images
        for filename in saved_filenames:
            cursor.execute("""
                INSERT INTO product_images (product_id, image_filename)
                VALUES (%s, %s)
            """, (product_id, filename))

        # Insert product_colors
        for color_id in colors:
            cursor.execute("""
                INSERT INTO product_colors (product_id, color_id) 
                VALUES (%s, %s)
            """, (product_id, int(color_id)))

        # Insert product_sizes
        for size in sizes:
            cursor.execute("""
                INSERT INTO product_sizes (product_id, size_id) 
                VALUES (%s, %s)
            """, (product_id, size))

        conn.commit()
        return jsonify({
            "message": "Product added successfully",
            "product_id": product_id,
            "image_filenames": saved_filenames
        }), 201

    except Exception as e:
        conn.rollback()
        print("❌ Error adding product:", e)
        # Cleanup saved images on failure
        for filename in saved_filenames:
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.exists(image_path):
                os.remove(image_path)
        return jsonify({"error": "Server error: " + str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/api/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "DB connection failed"}), 500

    cursor = conn.cursor()
    cursor.execute("SELECT image_url FROM products WHERE id = %s", (product_id,))
    existing_product = cursor.fetchone()

    if not existing_product:
        cursor.close()
        conn.close()
        return jsonify({"error": "Product not found"}), 404

    old_image = existing_product[0]
    image = request.files.get('image')
    form_data = request.form

    name = form_data.get("name")
    description = form_data.get("description")
    price = form_data.get("price")
    category_id = form_data.get("category_id")
    brand = form_data.get("brand")
    material = form_data.get("material")
    stock_quantity = form_data.get("stock_quantity", 0)
    discount = form_data.get("discount")
    colors = form_data.getlist("colors")
    sizes = form_data.getlist("sizes")

    if not all([name, description, price, category_id, brand, material]):
        cursor.close()
        conn.close()
        return jsonify({"error": "Missing required fields"}), 400

    # Convert discount safely
    discount = float(discount) if discount else None

    image_filename = old_image

    # Handle new image upload
    if image and allowed_file(image.filename):
        filename = secure_filename(image.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        try:
            image.save(image_path)
            image_filename = unique_filename
            # Delete old image file
            old_image_path = os.path.join(app.config['UPLOAD_FOLDER'], old_image)
            if os.path.exists(old_image_path):
                os.remove(old_image_path)
        except Exception as e:
            cursor.close()
            conn.close()
            return jsonify({"error": f"Image upload failed: {str(e)}"}), 500
    elif image:
        cursor.close()
        conn.close()
        return jsonify({"error": "Invalid image file type"}), 400

    try:
        # ✅ Update product including discount
        cursor.execute("""
            UPDATE products SET
                name=%s, description=%s, price=%s, category_id=%s, brand=%s,
                material=%s, stock_quantity=%s, discount=%s, image_url=%s
            WHERE id=%s
        """, (
            name, description, price, category_id, brand,
            material, stock_quantity, discount, image_filename, product_id
        ))

        # Clear and re-insert product colors
        cursor.execute("DELETE FROM product_colors WHERE product_id = %s", (product_id,))
        for color_id in colors:
            cursor.execute("""
                INSERT INTO product_colors (product_id, color_id)
                VALUES (%s, %s)
            """, (product_id, int(color_id)))

        # Clear and re-insert product sizes
        cursor.execute("DELETE FROM product_sizes WHERE product_id = %s", (product_id,))
        for size_id in sizes:
            cursor.execute("""
                INSERT INTO product_sizes (product_id, size_id)
                VALUES (%s, %s)
            """, (product_id, int(size_id)))

        conn.commit()
        return jsonify({"message": "Product updated successfully"}), 200

    except Exception as e:
        conn.rollback()
        print("❌ Error updating product:", e)
        return jsonify({"error": "Server error"}), 500

    finally:
        cursor.close()
        conn.close()




@app.route("/api/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "DB connection failed"}), 500

    try:
        cursor = conn.cursor()
        
        # First delete colors and sizes
        cursor.execute("DELETE FROM product_colors WHERE product_id = %s", (product_id,))
        cursor.execute("DELETE FROM product_sizes WHERE product_id = %s", (product_id,))
        
        # Then delete the product
        cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Product not found"}), 404
            
        conn.commit()
        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception as e:
        print("❌", e)
        conn.rollback()
        return jsonify({"error": "Server error"}), 500
    finally:
        cursor.close()
        conn.close()

# ---------------------- Colors Endpoints ----------------------

@app.route("/api/colors", methods=["GET"])
def get_colors():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "DB connection failed"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT color_id, name FROM colors ORDER BY name ASC")
        return jsonify(cursor.fetchall()), 200
    finally:
        cursor.close()
        conn.close()





@app.route("/api/colors", methods=["POST"])
def add_color():
    data = request.get_json()
    color = data.get("color")

    if not color:
        return jsonify({"error": "Color is required"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "DB connection failed"}), 500

    try:
        cursor = conn.cursor()

        # Check if color already exists in the 'colors' table
        cursor.execute("SELECT * FROM colors WHERE name = %s", (color,))
        if cursor.fetchone():
            return jsonify({"error": "Color already exists"}), 409

        # Insert into the 'colors' table
        cursor.execute("INSERT INTO colors (name) VALUES (%s)", (color,))
        conn.commit()

        return jsonify({"message": "Color added", "id": cursor.lastrowid}), 201

    except Exception as e:
        print("❌", e)
        return jsonify({"error": "Server error"}), 500

    finally:
        cursor.close()
        conn.close()



# ---------------------- Sizes Endpoints ----------------------

@app.route("/api/sizes", methods=["GET"])
def get_sizes():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "DB connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT size_id, size_name FROM sizes ORDER BY size_name ASC")
        sizes = cursor.fetchall()
        return jsonify(sizes), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()



@app.route("/api/sizes", methods=["POST"])
def add_size():
    size = request.json.get("size")
    if not size:
        return jsonify({"error": "Size is required"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "DB connection failed"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO sizes (size_name) VALUES (%s)", (size,))
        conn.commit()
        return jsonify({"message": "Size added successfully"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/api/categories", methods=["GET"])
def get_categories():
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name FROM categories ORDER BY name ASC")
        return jsonify(cursor.fetchall()), 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": "Server error"}), 500
    finally:
        cursor.close()
        conn.close()


@app.route("/api/categories", methods=["POST"])
def add_category():
    data = request.get_json()
    name = data.get("name")

    if not name:
        return jsonify({"error": "Category name is required"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "DB connection failed"}), 500

    try:
        cursor = conn.cursor()

        # Check if category already exists
        cursor.execute("SELECT * FROM categories WHERE name = %s", (name,))
        if cursor.fetchone():
            return jsonify({"error": "Category already exists"}), 409

        # Insert new category
        cursor.execute("INSERT INTO categories (name, created_at) VALUES (%s, NOW())", (name,))
        conn.commit()

        return jsonify({"message": "Category added", "id": cursor.lastrowid}), 201

    except Exception as e:
        print("❌", e)
        return jsonify({"error": "Server error"}), 500

    finally:
        cursor.close()
        conn.close()

app.register_blueprint(auth_bp, url_prefix='/api/auth')        


if __name__ == '__main__':
    app.run(debug=True)