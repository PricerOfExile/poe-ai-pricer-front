from flask import Flask, request, jsonify
from enum import Enum

app = Flask(__name__)

class Rating(Enum):
    VERY_GOOD = 1
    GOOD = 2
    NOT_WORTH_IT = 3

@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.get_json()
    rating_value = data.get('rating')

    rating_enum = Rating(rating_value)
    return jsonify({"message": rating_enum.name})

if __name__ == '__main__':
    app.run(debug=True)
