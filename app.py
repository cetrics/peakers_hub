import os
from flask import Flask, request, jsonify, render_template,Blueprint,current_app,redirect, url_for
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
from pyngrok import ngrok
from mpesa import lipa_na_mpesa_online, transaction_status
import random
from collections import defaultdict



app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)
public_url = ngrok.connect(5000).public_url
app.config["CALLBACK_URL"] = f"{public_url}/callback"
print(f"Ngrok URL: {public_url}")
print(f"Callback URL: {app.config['CALLBACK_URL']}")

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

address_bp = Blueprint("address_bp", __name__)


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
            'phone': user['phone'],
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
            'name': f"{user['first_name']} {user['last_name']}",
            'phone': user['phone']
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



# ✅ Fetch all addresses for a user
@address_bp.route("/<int:user_id>", methods=["GET"])
def get_addresses(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM delivery_addresses WHERE user_id = %s", (user_id,))
    addresses = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(addresses)

@address_bp.route("/", methods=["POST"])
def add_address():
    # 🔹 Get token from request header
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.split("Bearer ")[-1] if auth_header.startswith("Bearer ") else None

    if not token:
        return jsonify({"error": "Token is missing"}), 401

    try:
        # 🔹 Decode token and extract user_id
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        user_id = payload["id"]
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    # 🔹 Get request body
    data = request.json

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO delivery_addresses
        (user_id, address_type, contact_name, contact_phone, address_line1, 
         address_line2, town, county, postal_code, country, is_default, created_at, updated_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        user_id,  # ✅ taken from token
        data.get("address_type", "Home"),
        data["contact_name"],
        data["contact_phone"],
        data["address_line1"],
        data.get("address_line2", ""),
        data["town"],
        data["county"],
        data["postal_code"],
        data["country"],
        data.get("is_default", False),
        datetime.datetime.now(),
        datetime.datetime.now(),
    ))

    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return jsonify({"message": "Address added successfully", "address_id": new_id}), 201


# --- STK Push Endpoint ---
@app.route('/test-stkpush', methods=['POST'])
def test_stkpush():
    data = request.get_json()  # Accept JSON
    phone = data.get("phone")
    amount = data.get("amount")

    if not phone or not amount:
        return jsonify({"error": "Missing phone or amount"}), 400

    result = lipa_na_mpesa_online(phone, int(amount), app.config["CALLBACK_URL"])
    checkout_id = result.get("CheckoutRequestID")
    if checkout_id:
        transaction_status[checkout_id] = "Pending"
    return jsonify({"checkout_id": checkout_id})


# --- Callback Endpoint ---
@app.route('/callback', methods=['POST'])
def mpesa_callback():
    data = request.get_json()
    try:
        stk_callback = data['Body']['stkCallback']
        checkout_id = stk_callback['CheckoutRequestID']
        result_code = stk_callback['ResultCode']

        if result_code == 0:
            status = "Success"
        elif result_code == 1032:
            status = "Cancelled"
        else:
            status = "Failed"

        transaction_status[checkout_id] = status
        return jsonify({"result": "Callback handled"}), 200

    except Exception as e:
        print(f"❌ Error handling callback: {e}")
        return jsonify({"error": "Bad callback format"}), 400

# --- Check Status API ---
@app.route('/check-status/<checkout_id>')
def check_status(checkout_id):
    status = transaction_status.get(checkout_id, "Pending")
    return jsonify({"status": status})

@app.route("/api/orders/<int:user_id>")
def get_user_orders(user_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "DB connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)

        # 1) Get orders with a summary string (like your original GROUP_CONCAT)
        cursor.execute(
            """
            SELECT 
                o.id,
                o.order_number,
                o.total_amount,
                o.payment_method,
                o.status,
                o.created_at,
                (
                    SELECT GROUP_CONCAT(CONCAT(p.name, ' x', oi.quantity) SEPARATOR ', ')
                    FROM order_items oi
                    JOIN products p ON p.id = oi.product_id
                    WHERE oi.order_id = o.id
                ) AS items_summary
            FROM orders o
            WHERE o.user_id = %s
            ORDER BY o.created_at DESC
            """,
            (user_id,),
        )
        orders = cursor.fetchall()
        if not orders:
            return jsonify([])

        # 2) Fetch order items with the first image per product
        order_ids = [o["id"] for o in orders]
        placeholders = ",".join(["%s"] * len(order_ids))
        cursor.execute(
            f"""
            SELECT 
                oi.order_id,
                p.id AS product_id,
                p.name AS title,
                oi.quantity,
                (
                    SELECT pi.image_filename
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                    ORDER BY pi.id ASC
                    LIMIT 1
                ) AS image_filename
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id IN ({placeholders})
            ORDER BY oi.order_id, oi.id
            """,
            order_ids,
        )
        rows = cursor.fetchall()

        # 3) Build items array per order and attach to orders
        by_order = defaultdict(list)
        for r in rows:
            img_file = r.get("image_filename")
            image_url = url_for("static", filename=f"uploads/{img_file}") if img_file else None
            by_order[r["order_id"]].append({
                "product_id": r["product_id"],
                "title": r["title"],
                "quantity": r["quantity"],
                "image": image_url,
            })

        for o in orders:
            o["items"] = by_order.get(o["id"], [])
            o.pop("id", None)  # hide internal DB id

        return jsonify(orders)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()



@app.route("/api/orders/details/<string:order_number>")
def get_order_details(order_number):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "DB connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)

        # 1) Get the order
        cursor.execute(
            """
            SELECT 
                o.id,
                o.order_number,
                o.total_amount,
                o.payment_method,
                o.status,
                o.created_at
            FROM orders o
            WHERE o.order_number = %s
            """,
            (order_number,),
        )
        order = cursor.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        # 2) Get the order items
        cursor.execute(
            """
            SELECT 
                p.id AS product_id,
                p.name AS title,
                oi.quantity,
                (
                    SELECT pi.image_filename
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                    ORDER BY pi.id ASC
                    LIMIT 1
                ) AS image_filename
            FROM order_items oi
            JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = %s
            """,
            (order["id"],),
        )
        items = cursor.fetchall()

        # 3) Attach image URLs
        for item in items:
            if item["image_filename"]:
                item["image"] = url_for(
                    "static", filename=f"uploads/{item['image_filename']}"
                )
            else:
                item["image"] = None
            item.pop("image_filename", None)

        order["items"] = items
        order.pop("id", None)  # don’t leak DB id

        return jsonify(order)

    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/orders/<order_number>/tracking", methods=["GET"])
def get_order_tracking(order_number):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "DB connection failed"}), 500

    try:
        cursor = conn.cursor(dictionary=True)

        # get order_id from orders table
        cursor.execute("SELECT id FROM orders WHERE order_number = %s", (order_number,))
        order = cursor.fetchone()
        if not order:
            return jsonify({"error": "Order not found"}), 404

        # fetch tracking history
        cursor.execute(
            """
            SELECT status, description, update_time
            FROM order_tracking
            WHERE order_id = %s
            ORDER BY update_time ASC
            """,
            (order["id"],),
        )
        tracking = cursor.fetchall()

        # current_status is the latest entry if any
        current_status = tracking[-1]["status"] if tracking else "Ordered"

        response = {
            "current_status": current_status,
            "expected_delivery": None,  # or calculate from created_at if needed
            "updates": tracking,
        }

        return jsonify(response)
    except Error as e:
        print("Backend error:", str(e))  # log in terminal
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/orders/<int:order_id>/cancel", methods=["PUT"])
def cancel_order(order_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "DB connection failed"}), 500
    try:
        cursor = conn.cursor()

        # update status to cancelled
        cursor.execute(
            "UPDATE orders SET status = %s WHERE id = %s",
            ("cancelled", order_id),
        )
        conn.commit()

        return jsonify({"success": True, "order_id": order_id, "status": "cancelled"})
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/orders/<string:order_number>/archive", methods=["PUT"])
def archive_order(order_number):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "DB connection failed"}), 500
    try:
        cursor = conn.cursor()
        cursor.execute("UPDATE orders SET status = %s WHERE order_number = %s", ("archived", order_number))
        conn.commit()
        return jsonify({"success": True, "order_number": order_number, "status": "archived"})
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

def generate_order_number():
    return str(random.randint(100000, 999999))  # 6-digit random number


@app.route("/api/orders", methods=["POST"])
def create_order():
    data = request.json
    user_id = data.get("user_id")
    address_id = data.get("address_id")
    payment_method = data.get("payment_method")
    total_amount = data.get("total_amount")
    cart_items = data.get("cart_items", [])

    if not user_id or not address_id or not payment_method or not total_amount:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "DB connection failed"}), 500

    try:
        cursor = conn.cursor()
        
        # ✅ Generate a unique order_number with retry
        max_attempts = 5
        for attempt in range(max_attempts):
            order_number = generate_order_number()
            cursor.execute("SELECT id FROM orders WHERE order_number = %s", (order_number,))
            if not cursor.fetchone():
                break
        else:
            return jsonify({"error": "Failed to generate unique order number"}), 500

        # Insert into orders table
        cursor.execute(
            """
            INSERT INTO orders (user_id, address_id, payment_method, total_amount, status, created_at, order_number)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (user_id, address_id, payment_method, total_amount, "Pending", datetime.datetime.now(), order_number)
        )
        order_id = cursor.lastrowid

        # ✅ Insert default tracking step (Ordered)
        cursor.execute(
            """
            INSERT INTO order_tracking (order_id, status, update_time, description)
            VALUES (%s, %s, %s, %s)
            """,
            (order_id, "Ordered", datetime.datetime.now(), "Order placed successfully")
        )

        # Insert each cart item into order_items and update stock
        for item in cart_items:
            cursor.execute(
                """
                INSERT INTO order_items (order_id, product_id, quantity, price)
                VALUES (%s, %s, %s, %s)
                """,
                (order_id, item["id"], item["quantity"], item["price"])
            )

            # ✅ Deduct stock from products table
            cursor.execute(
                """
                UPDATE products
                SET stock_quantity = stock_quantity - %s
                WHERE id = %s
                """,
                (item["quantity"], item["id"])
            )

        conn.commit()
        return jsonify({"success": True, "order_id": order_id, "order_number": order_number}), 201

    except Exception as e:
        conn.rollback()
        print("Error creating order:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


app.register_blueprint(auth_bp, url_prefix='/api/auth')  
app.register_blueprint(address_bp, url_prefix="/api/addresses")

if __name__ == '__main__':
    app.run(debug=True)
    