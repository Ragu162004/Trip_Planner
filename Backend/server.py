from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:ragu 16-10-2004@localhost/travel_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)

# Define Trip model
class Trip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(100), db.ForeignKey('user.email'), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    no_of_days = db.Column(db.Integer, nullable=False)
    budget = db.Column(db.String(50), nullable=False)
    people = db.Column(db.Integer, nullable=False)

# Endpoint to save trip details
@app.route('/api/trips', methods=['POST'])
def save_trip():
    data = request.json
    try:
        user = User.query.filter_by(email=data['user_email']).first()
        if not user:
            user = User(email=data['user_email'], name=data.get('user_name', 'Unknown'))
            db.session.add(user)
            db.session.commit()

        # Save trip details
        trip = Trip(
            user_email=data['user_email'],
            location=data['location'],
            no_of_days=data['no_of_days'],
            budget=data['budget'],
            people=data['people']
        )
        db.session.add(trip)
        db.session.commit()
        return jsonify({"message": "Trip saved successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users', methods=['GET'])
def get_users_and_trips():
    users = User.query.all()
    users_with_trips = []

    for user in users:
        trips = Trip.query.filter_by(user_email=user.email).all()
        trip_details = [
            {
                'location': trip.location,
                'no_of_days': trip.no_of_days,
                'budget': trip.budget,
                'people': trip.people
            }
            for trip in trips
        ]
        users_with_trips.append({
            'user_name': user.name,
            'user_email': user.email,
            'trips': trip_details
        })

    return jsonify(users_with_trips)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  
    app.run(debug=True)
