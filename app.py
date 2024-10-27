from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import cv2
import mediapipe as mp
import base64
import logging

app = Flask(__name__)
# Allow requests from any origin
CORS(app)

# Setup logging
logging.basicConfig(level=logging.DEBUG)

# Load the trained model from the pickle file
try:
    model_dict = pickle.load(open('/home/nitesh/Sih/sih/Isl_gui/model.p', 'rb'))
    model = model_dict['model']
except Exception as e:
    logging.error(f"Error loading model: {e}")

# Mediapipe setup for hand landmarks
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    min_detection_confidence=0.3,
    min_tracking_confidence=0.5,
    max_num_hands=2
)

# Character labels for model predictions
labels_dict = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E',
    5: 'F',
    6: 'G',
}

# Dummy function for suggestions based on character
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

@app.route('/Landmarks', methods=['POST'])
def predict():
    try:
        data = request.json
        all_predictions = []

        if 'frame' in data:
            frame_data = base64.b64decode(data['frame'])
            frame = np.frombuffer(frame_data, np.uint8)
            frame = cv2.imdecode(frame, cv2.IMREAD_COLOR)
            if frame is None:
                return jsonify({'error': 'Could not read frame.'}), 400

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(frame_rgb)

            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    data_aux = []
                    x_, y_ = [], []

                    for landmark in hand_landmarks.landmark:
                        x_.append(landmark.x)
                        y_.append(landmark.y)

                    min_x, min_y = min(x_), min(y_)
                    for landmark in hand_landmarks.landmark:
                        data_aux.append(landmark.x - min_x)
                        data_aux.append(landmark.y - min_y)

                    if len(data_aux) > 84:
                        data_aux = data_aux[:84]
                    elif len(data_aux) < 84:
                        data_aux.extend([0] * (84 - len(data_aux)))

                    prediction = model.predict([np.asarray(data_aux)])
                    predicted_character = labels_dict[int(prediction[0])]

                    suggestions = get_suggestions(predicted_character)

                    all_predictions.append({
                        'predicted_character': predicted_character,
                        'suggestions': suggestions
                    })
            else:
                return jsonify({'error': 'No hand landmarks detected.'}), 400

        elif 'landmarks' in data:
            data_aux = []

            for point in data['landmarks']:
                data_aux.append(point['x'])
                data_aux.append(point['y'])

            if len(data_aux) > 84:
                data_aux = data_aux[:84]
            elif len(data_aux) < 84:
                data_aux.extend([0] * (84 - len(data_aux)))

            prediction = model.predict([np.asarray(data_aux)])
            predicted_character = labels_dict[int(prediction[0])]
            suggestions = get_suggestions(predicted_character)

            all_predictions.append({
                'predicted_character': predicted_character,
                'suggestions': suggestions
            })

        else:
            return jsonify({'error': 'No frame or landmarks provided.'}), 400

        return jsonify(all_predictions)

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
