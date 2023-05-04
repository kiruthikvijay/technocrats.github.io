# import the Flask class from the flask module
from flask import Flask, render_template, request, jsonify
import emoDetectv1

# create the application object
app = Flask(__name__,static_url_path="",static_folder="static")

# use decorators to link the function to a url
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/emotion', methods = ['POST'])
def upload_file():
   if request.method == 'POST':
      f = request.files['image']
      f.save("faceimage.jpg")
      return jsonify(emotion=emoDetectv1.emotion())

if __name__ == '__main__':
    app.run(debug=True)