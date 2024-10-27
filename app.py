from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import logging

app = Flask(__name__)
CORS(app)  # Allow requests from any origin

# Setup logging
logging.basicConfig(level=logging.DEBUG)

# Load the trained model from the pickle file
try:
    model_dict = pickle.load(open('./model.p', 'rb'))
    model = model_dict['model']
except Exception as e:
    logging.error(f"Error loading model: {e}")

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

        if 'landmarks' in data:
            data_aux = []

            # Log the received landmarks
            # logging.debug(f"Received landmarks: {data['landmarks']}")

            # Process the received landmarks
            for point in data['landmarks']:
                data_aux.append(point['x'])
                data_aux.append(point['y'])

            # Ensure data has 84 elements
            if len(data_aux) > 84:
                data_aux = data_aux[:84]
            elif len(data_aux) < 84:
                data_aux.extend([0] * (84 - len(data_aux)))

            # Predict using the model
            prediction = model.predict([np.asarray(data_aux)])
            logging.debug(f"Raw prediction result: {prediction}")
            predicted_character = labels_dict[int(prediction[0])]
            suggestions = get_suggestions(predicted_character)

            all_predictions.append({
                'predicted_character': predicted_character,
                'suggestions': suggestions
            })
        else:
            return jsonify({'error': 'No landmarks provided.'}), 400

        return jsonify(all_predictions)

    except Exception as e:
        logging.error(f"An error occurred: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
