import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
class Weather:
    def __init__(self, temp, feelsLike, pressure, humidity, clouds, visibility, wind, rain, snow, conditionId, main, description, icon):
        self.temp = temp
        self.feelsLike = feelsLike
        self.pressure = pressure
        self.humidity = humidity
        self.clouds = clouds
        self.visibility = visibility
        self.wind = wind
        self.rain = rain
        self.snow = snow
        self.conditionId = conditionId
        self.main = main
        self.description = description
        self.icon = icon

    def to_dict(self):
        return {
            'temp': self.temp,
            'feelsLike': self.feelsLike,
            'pressure': self.pressure,
            'humidity': self.humidity,
            'clouds': self.clouds,
            'visibility': self.visibility,
            'wind_deg': self.wind['deg'],
            'wind_gust': self.wind['gust'],
            'wind_speed': self.wind['speed'],
            'rain': self.rain,
            'snow': self.snow,
            'conditionId': self.conditionId,
            'main': self.main,
            'description': self.description
        }

class Disaster:
    def __init__(self, disasterType, weather):
        self.disasterType = disasterType
        self.weather = weather

def load_json(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

def create_weather_from_dict(data):
    return Weather(
        temp=data['temp']['cur'],
        feelsLike=data['feelsLike']['cur'],
        pressure=data['pressure'],
        humidity=data['humidity'],
        clouds=data['clouds'],
        visibility=data['visibility'],
        wind=data['wind'],
        rain=data['rain'],
        snow=data['snow'],
        conditionId=data['conditionId'],
        main=data['main'],
        description=data['description'],
        icon=data['icon']
    )

def create_disaster_from_dict(data):
    weather = create_weather_from_dict(data['weather'])
    return Disaster(disasterType=data['disasterType'], weather=weather)

def prepare_data(disaster_data):
    features = []
    labels = []
    for d in disaster_data:
        weather_dict = d['weather']
        weather_flattened = create_weather_from_dict(weather_dict).to_dict()
        features.append(weather_flattened)
        labels.append(d['disasterType'])
    return pd.DataFrame(features), labels

# Load JSON files
current_weather_data = load_json('current_weather.json')
disaster_data = load_json('natural_disasters.json')

# Prepare data for training
df, labels = prepare_data(disaster_data)

# Encode labels
label_encoder = LabelEncoder()
encoded_labels = label_encoder.fit_transform(labels)

# Define numerical and categorical features
numerical_features = ['temp', 'feelsLike', 'pressure', 'humidity', 'clouds', 'visibility', 'wind_deg', 'wind_gust', 'wind_speed', 'rain', 'snow', 'conditionId']
categorical_features = ['main', 'description']

# Define preprocessing for numerical and categorical features
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_features),
        ('cat', OneHotEncoder(), categorical_features)
    ])

# Create the pipeline with preprocessing and model
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(random_state=42))
])

# Split data
X = df
y = encoded_labels
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a model with hyperparameter tuning
param_grid = {
    'classifier__n_estimators': [50, 100, 200],
    'classifier__max_depth': [None, 10, 20, 30]
}
grid_search = GridSearchCV(pipeline, param_grid, cv=5, n_jobs=-1, verbose=2)
grid_search.fit(X_train, y_train)

# Best model
best_model = grid_search.best_estimator_

# Evaluate the model
y_pred = best_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy * 100:.2f}%")
print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

# Confusion matrix
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt='d', xticklabels=label_encoder.classes_, yticklabels=label_encoder.classes_, cmap='Blues')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix')
plt.show()

# Predict the current weather
current_weather = create_weather_from_dict(current_weather_data)
current_weather_df = pd.DataFrame([current_weather.to_dict()])

# Predict disaster type for current weather
current_weather_encoded = best_model.predict(current_weather_df)
predicted_disaster_type = label_encoder.inverse_transform(current_weather_encoded)[0]

# Predict probabilities for current weather
probabilities = best_model.predict_proba(current_weather_df)[0]

# Print probabilities for each disaster type
disaster_probabilities = {label_encoder.inverse_transform([i])[0]: prob for i, prob in enumerate(probabilities)}

# Filter probabilities above 12%
filtered_probabilities = {disaster: prob for disaster, prob in disaster_probabilities.items() if prob >= 0.12}

# Plot probabilities as a pie chart
labels = filtered_probabilities.keys()
sizes = [prob * 100 for prob in filtered_probabilities.values()]
colors = plt.cm.tab20.colors[:len(labels)]

plt.figure(figsize=(8, 8))
plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=140)
plt.title('Predicted Disaster Probabilities for Current Weather (>= 12%)')
plt.show()

# Plot bar chart for each disaster type
plt.figure(figsize=(12, 6))
plt.barh(list(disaster_probabilities.keys()), [prob * 100 for prob in disaster_probabilities.values()], color='skyblue')
plt.xlabel('Probability (%)')
plt.ylabel('Disaster Type')
plt.title('Predicted Probabilities for Each Disaster Type')
plt.show()
print(f"Predicted disaster type: {predicted_disaster_type}")