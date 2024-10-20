import pickle
import sys

# Load the model from the specified path
model_path = sys.argv[1]
model = pickle.load(open('/home/nitesh/Sih/sih/Isl_gui/Server/utils/model.p', 'rb'))

print("Model loaded successfully")
