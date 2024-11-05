import os
import random
import requests
from datetime import datetime
from flask import Flask, request, render_template, send_from_directory

import config

bot = config.bot
app = Flask(__name__)

available_indexes = [
    'index_0.html',
    'index_1.html',
]
last_index = 'index_1.html'


@app.route('/', methods=['GET'])
def index():
    global last_index
    try:
        # Find the position of the last used index and get the next one in sequence
        current_pos = available_indexes.index(last_index)
        next_pos = (current_pos + 1) % len(available_indexes)  # Use modulo for wrap-around
        new_index = available_indexes[next_pos]
    except ValueError:
        # Fallback if last_index isn't found
        new_index = available_indexes[0]

    # Update the last used index
    last_index = new_index
    return render_template(new_index)

@app.route('/api/sendBot/', methods=['POST'])
def sendBot():
    global bot
    
    try:
        # Extract the number and sticker from the JSON request body
        value = request.json['number']
        
        if not isinstance(value, int) or value < 0 or value > 10:
            print('number key is not an integer')
            return '400 - number key is not an integer', 400
    except KeyError:
        print('number key not found in request')
        return '400 - number key not found in request', 400
    
    # Attempt to get the real IP address of the user
    user_ip = request.headers.get('X-Forwarded-For', request.remote_addr)

    # Emoji to represent mood intensity (darker to lighter moods)
    mood_emoji = ["😢", "😟", "🙁", "😐", "🙂", "😊", "😀", "😄", "😁", "😆"][(value-1)]

    # Create the message text
    date_time = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    text = (
        f"🌟 *What's Your Mood* 🌟\n\n"
        f"📅 Date & Time: {date_time}\n"
        f"🔢 Number Submitted: {value} {mood_emoji}\n"
        f"🌐 IP Address: {user_ip}\n"
    )

    # Send the message to the Telegram bot
    send_message_url = f"https://api.telegram.org/bot{bot['TOKEN']}/sendMessage"
    payload = {
        'chat_id': bot['CHATID'],
        'text': text,
        'parse_mode': 'Markdown'
    }
    message_response = requests.post(send_message_url, json=payload)
    # Check response status
    try:
        if message_response.json().get('ok'):
            return 'ok', 200
        else:
            return 'error while updating the bot', 400
    except Exception as e:
        print(f'Error while fetching bot result: {e}')
        return 'error while fetching bot result', 500

@app.route('/static/<path:path>', methods=['GET'])
def send_report(path:str):
    return send_from_directory('static', path)

@app.route('/favicon.ico', methods=['GET'])
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/x-icon')

if __name__ == "__main__":
    app.run(host='0.0.0.0')
