from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import pickle
import numpy as np
import cv2
import mediapipe as mp
import time

app = Flask(__name__)
CORS(app)  # Enable CORS

# Load the trained model
model_dict = pickle.load(open('./model.p', 'rb'))
model = model_dict['model']

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, min_detection_confidence=0.3, min_tracking_confidence=0.5, max_num_hands=2)

labels_dict = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E',
    5: 'F',
    6: 'G',
}

# Dummy generative AI model function to return 3 words based on predicted character
def get_suggestions(predicted_char):
    suggestions_map = {
        'A': ['Apple', 'Account', 'Annual'],
        'B': ['Book', 'Business', 'Budget'],
        'C': ['Cat', 'Cash', 'Company'],
        'D': ['Dog', 'Data', 'Deal'],
        'E': ['Egg', 'Employee', 'Expense'],
        'F': ['Fish', 'Finance', 'Future'],
        'G': ['Goat', 'Goal', 'Growth']
    }
    return suggestions_map.get(predicted_char, ["--", "--", "--"])

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        data_aux = []

        # Case 1: If the request contains a 'frame', process the image
        if 'frame' in data:
            frame_data = np.frombuffer(data['frame'], np.uint8)
            frame = cv2.imdecode(frame_data, cv2.IMREAD_COLOR)

            if frame is None:
                return jsonify({'error': 'Could not read frame from the camera.'})

            x_ = []
            y_ = []

            H, W, _ = frame.shape
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(frame_rgb)

            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    for j in range(len(hand_landmarks.landmark)):
                        x = hand_landmarks.landmark[j].x
                        y = hand_landmarks.landmark[j].y

                        x_.append(x)
                        y_.append(y)

                    min_x = min(x_)
                    min_y = min(y_)
                    for j in range(len(hand_landmarks.landmark)):
                        x = hand_landmarks.landmark[j].x
                        y = hand_landmarks.landmark[j].y
                        data_aux.append(x - min_x)
                        data_aux.append(y - min_y)

        # Case 2: If the request contains 'landmarks', use them directly
        elif 'landmarks' in data:
            for point in data['landmarks']:
                data_aux.append(point['x'])
                data_aux.append(point['y'])

        else:
            return jsonify({'error': 'No frame or landmarks provided.'})

        # Ensure the data is of the correct size
        if len(data_aux) > 84:
            data_aux = data_aux[:84]
        elif len(data_aux) < 84:
            data_aux.extend([0] * (84 - len(data_aux)))

        # Make the prediction
        prediction = model.predict([np.asarray(data_aux)])
        predicted_character = labels_dict[int(prediction[0])]

        # Get suggestions from the generative AI model
        suggestions = get_suggestions(predicted_character)

        return jsonify({
            'predicted_character': predicted_character,
            'suggestions': suggestions
        })

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
