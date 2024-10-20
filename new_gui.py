import pickle
import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
import time
import pyautogui
import pyttsx3
import tkinter as tk
from tkinter import ttk, Label, Button, Text, END, StringVar
from PIL import Image, ImageTk

model_dict = pickle.load(open('./model.p', 'rb'))
model = model_dict['model']

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
cap.set(cv2.CAP_PROP_FPS, 60)

if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

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

prev_time = time.time()
suggestion_expiry_time = None
last_detection_time = None

# Initialize text-to-speech engine
tts_engine = pyttsx3.init()

root = tk.Tk()
root.title("Indian Sign Language into Text Conversion")
root.geometry("900x600")  # Adjusted width to fit the dropdown
root.configure(bg='white')

# Create the layout using frames
main_frame = tk.Frame(root, bg='white')
main_frame.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)

# Create a frame for the text/speech input on the left side
left_frame = tk.Frame(main_frame, bg='white')
left_frame.pack(side=tk.LEFT, padx=10, pady=10, fill=tk.Y)

# Title and subtitle labels
title_label = Label(left_frame, text="ISL to Text/Speech using Generative AI", font=('Helvetica', 24, 'bold'), bg='white', fg='black')
title_label.pack(pady=10)

subtitle_label = Label(left_frame, text="", font=('Helvetica', 14), bg='white', fg='black')
subtitle_label.pack(pady=5)

# Predicted text label (speech output)
predicted_text_label = Label(left_frame, text="", font=('Helvetica', 18, 'bold'), bg='white', fg='black')
predicted_text_label.pack(pady=20)

# Add boxes for suggested words
suggestion_label = Label(left_frame, text="Suggestions:", font=('Helvetica', 14), bg='white', fg='black')
suggestion_label.pack(pady=5)

suggestion_frame = tk.Frame(left_frame, bg='white')
suggestion_frame.pack(pady=10)

# Function to update transcript when a suggestion is selected
def update_transcript(suggestion):
    transcript_box.insert(END, suggestion + " ")

# Function to reset suggestion boxes to empty
def reset_suggestions():
    suggestion_box_1.config(text="--")
    suggestion_box_2.config(text="--")
    suggestion_box_3.config(text="--")

# Clickable suggestion boxes
suggestion_box_1 = Button(suggestion_frame, text="--", font=('Helvetica', 16), bg='lightgray', fg='black', width=15, command=lambda: update_transcript(suggestion_box_1['text']))
suggestion_box_1.grid(row=0, column=0, padx=5)

suggestion_box_2 = Button(suggestion_frame, text="--", font=('Helvetica', 16), bg='lightgray', fg='black', width=15, command=lambda: update_transcript(suggestion_box_2['text']))
suggestion_box_2.grid(row=0, column=1, padx=5)

suggestion_box_3 = Button(suggestion_frame, text="--", font=('Helvetica', 16), bg='lightgray', fg='black', width=15, command=lambda: update_transcript(suggestion_box_3['text']))
suggestion_box_3.grid(row=0, column=2, padx=5)

# Transcript label and text box
transcript_label = Label(left_frame, text="Transcript:", font=('Helvetica', 14), bg='white', fg='black')
transcript_label.pack(pady=10)

transcript_box = Text(left_frame, height=4, width=50, font=('Helvetica', 16))
transcript_box.pack(pady=5)

# Function to convert transcript text to speech
def speak_transcript():
    transcript_text = transcript_box.get(1.0, END).strip()
    if transcript_text:
        # Get selected language
        selected_language = language_var.get()
        # Set language (if supported by the TTS engine)
        voices = tts_engine.getProperty('voices')
        for voice in voices:
            if selected_language in voice.name:
                tts_engine.setProperty('voice', voice.id)
                break
        tts_engine.say(transcript_text)
        tts_engine.runAndWait()

# Create a dropdown list for language selection
languages = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Gujarati", "Marathi", "Punjabi", "Bengali"]
language_var = StringVar(value=languages[0])

language_menu = ttk.OptionMenu(left_frame, language_var, *languages)
language_menu.pack(pady=10, side=tk.LEFT, padx=5)

# Clear button below the speech output
clear_button = Button(left_frame, text="Clear", font=('Helvetica', 16, 'bold'), bg='white', fg='black', command=lambda: [predicted_text_label.config(text=""), transcript_box.delete(1.0, END), reset_suggestions()])
clear_button.pack(pady=10, side=tk.LEFT, padx=5)

# Speech button below the speech output
speech_button = Button(left_frame, text="Speak", font=('Helvetica', 16, 'bold'), bg='white', fg='black', command=speak_transcript)
speech_button.pack(pady=10, side=tk.LEFT, padx=5)

# Create a frame for the camera feed on the right side
right_frame = tk.Frame(main_frame, bg='white')
right_frame.pack(side=tk.RIGHT, padx=10, pady=10, fill=tk.BOTH, expand=True)

# Frame for the video feed
frame_camera = ttk.Frame(right_frame, padding="10")
frame_camera.pack(pady=6)

label = ttk.Label(frame_camera)
label.pack()

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

def update_frame():
    global prev_time, suggestion_expiry_time, last_detection_time
    ret, frame = cap.read()

    if frame is None:
        print("Error: Could not read frame from the camera.")
        return

    data_aux = []
    x_ = []
    y_ = []

    H, W, _ = frame.shape

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = hands.process(frame_rgb)

    if results.multi_hand_landmarks:
        # Process hand landmarks
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

        if len(data_aux) > 84:
            data_aux = data_aux[:84]
        elif len(data_aux) < 84:
            data_aux.extend([0] * (84 - len(data_aux)))

        prediction = model.predict([np.asarray(data_aux)])
        predicted_character = labels_dict[int(prediction[0])]

        # Update the predicted text label
        predicted_text_label.config(text=f"Predicted text: {predicted_character}")

        # Get suggestions from the generative AI model
        suggestions = get_suggestions(predicted_character)

        # Update the suggestion boxes
        suggestion_box_1.config(text=suggestions[0])
        suggestion_box_2.config(text=suggestions[1])
        suggestion_box_3.config(text=suggestions[2])

        # Update last detection time
        last_detection_time = time.time()

        x1 = int(min(x_) * W) - 10
        y1 = int(min(y_) * H) - 10
        x2 = int(max(x_) * W) - 10
        y2 = int(max(y_) * H) - 10
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 0), 5)

        text_size = cv2.getTextSize(predicted_character, cv2.FONT_HERSHEY_SIMPLEX, 1.3, 2)[0]
        text_x = int((frame.shape[1] - text_size[0]) / 2)
        text_y = frame.shape[0] - 30
        cv2.rectangle(frame, (text_x - 5, text_y - text_size[1] - 5), (text_x + text_size[0] + 5, text_y + 5), (255, 255, 255), -1)
        cv2.putText(frame, predicted_character, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 0, 0), 2)

        current_time = time.time()
        if current_time - prev_time > 4:
            pyautogui.typewrite(predicted_character)
            prev_time = current_time

    else:
        predicted_text_label.config(text="")  # Clear predicted text if no hands detected
        # Show "--" in suggestion boxes
        reset_suggestions()

    # Keep suggestions valid for 20 seconds after last detection
    if last_detection_time and time.time() > last_detection_time + 20:
        reset_suggestions()

    img = Image.fromarray(frame)
    imgtk = ImageTk.PhotoImage(image=img)
    label.imgtk = imgtk
    label.configure(image=imgtk)

    label.after(10, update_frame)

update_frame()

root.mainloop()

cap.release()
cv2.destroyAllWindows()