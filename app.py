import os
import base64
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        data = request.json
        image_data = data.get('image')
        if not image_data:
            return jsonify({"status": "error", "message": "No image data"}), 400

        # Remove the header from base64 string
        header, encoded = image_data.split(",", 1)
        image_bytes = base64.b64decode(encoded)

        file_name = f"sketch-{int(os.path.getmtime(UPLOAD_FOLDER) * 1000)}.png" # Simple unique name
        # Better unique name using timestamp
        import time
        file_name = f"sketch-{int(time.time())}.png"
        
        file_path = os.path.join(UPLOAD_FOLDER, file_name)
        
        with open(file_path, "wb") as f:
            f.write(image_bytes)

        print(f"File saved: {file_path}")
        return jsonify({"status": "success", "message": f"Saved as {file_name}", "path": file_path})
    except Exception as e:
        print(f"Error saving image: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/status')
def status():
    return jsonify({
        "status": "online",
        "message": "Premium Dashboard is running smoothly."
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
