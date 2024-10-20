import pickle
import sys
import json
import numpy as np

# Assume the model is already loaded in memory
model = ...  # Load your model here

# Input data
input_data = json.loads(sys.argv[1])
input_array = np.array([input_data])

# Make a prediction
prediction = model.predict(input_array)
print(json.dumps(prediction.tolist()))
