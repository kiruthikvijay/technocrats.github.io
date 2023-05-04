import cv2

import tensorflow as tf

import numpy as np

emo_model = tf.keras.models.load_model("SuccessModel1")

face_haar_cascade = cv2.CascadeClassifier('haarcascade_frontalface_alt.xml')


def emotion():

    #read image
    image = cv2.imread("faceimage.jpg")

    #Gray scales image 
    converted_image= cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    #Detects face
    faces_detected = face_haar_cascade.detectMultiScale(converted_image)
    
    #If no face found, return "nil"
    if not len(faces_detected):
        return "nil"
    
    #for the last face found
    
    for (x,y,w,h) in faces_detected:
        roi_gray=converted_image[y:y+w,x:x+h]
        roi_gray=cv2.resize(roi_gray,(48,48))
        image_pixels = tf.keras.preprocessing.image.img_to_array(roi_gray)
        image_pixels = np.expand_dims(image_pixels, axis = 0)
        image_pixels /= 255

    #prediction
    predictions = emo_model.predict(image_pixels)
    max_index = np.argmax(predictions[0])

    #labelling
    emotion_detection = ('angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral')
    emotion_prediction = emotion_detection[max_index]

    return emotion_prediction
