from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Model එක Load කිරීම
model = joblib.load('novel_canine_model.pkl')
FEEDBACK_FILE = 'feedback_data.csv'

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    
    breed_str = data['Breed_Size']
    ambient_temp = float(data['Ambient_Temp'])
    dog_temp = float(data['Dog_Temp'])
    heart_rate = int(data['Heart_Rate'])
    activity_str = data['Activity_Level']
    
    breed_map = {"Small": 0, "Medium": 1, "Large": 2}
    activity_map = {"Resting": 0, "Walking": 1, "Running": 2}
    
    breed_val = breed_map.get(breed_str, 1) 
    activity_val = activity_map.get(activity_str, 0) 
    
    # AI Prediction
    prediction = model.predict([[breed_val, ambient_temp, dog_temp, heart_rate, activity_val]])[0]
    
    # Explainable AI Logic (හේතුව සෙවීම)
    reason = ""
    if prediction == "Anomaly":
        if dog_temp >= 39.5:
            reason = "High Temperature Detected: Maybe Fever or Heat Stroke 🌡️"
        elif dog_temp < 37.5:
            reason = "Low Temperature Detected: Possible Hypothermia ❄️"
        elif heart_rate > 120 and activity_str == "Resting":
            reason = "High Heart Rate at Rest: Possible Tachycardia, Pain or Stress 🫀"
        elif heart_rate < 60:
            reason = "Low Heart Rate Detected: Lethargy or underlying issue 📉"
        else:
            reason = "Abnormal Vitals Detected: Please observe your dog carefully ⚠️"
            
    return jsonify({'status': prediction, 'reason': reason})

@app.route('/feedback', methods=['POST'])
def save_feedback():
    data = request.json
    new_data = pd.DataFrame([{
        'Breed_Encoded': data['Breed_Encoded'],
        'Ambient_Temp': data['Ambient_Temp'],
        'Dog_Temp': data['Dog_Temp'],
        'Heart_Rate': data['Heart_Rate'],
        'Activity_Encoded': data['Activity_Encoded'],
        'Status': data['Actual_Status']
    }])
    
    if not os.path.isfile(FEEDBACK_FILE):
        new_data.to_csv(FEEDBACK_FILE, index=False)
    else:
        new_data.to_csv(FEEDBACK_FILE, mode='a', header=False, index=False)
        
    return jsonify({"message": "Feedback successfully saved! AI is learning."})

# ================================================================
#  Care Center AI — Predict urgency & recommended clinic type
# ================================================================

# Load the trained model for care center prediction
saved_care_data = joblib.load('care_center_ai_model.pkl')
care_ai_model = saved_care_data['model']
care_mappings = saved_care_data['mappings']

def get_code_from_mapping(mapping_dict, value):
    for code, label in mapping_dict.items():
        if label == value:
            return code
    return 0

@app.route('/predict-care', methods=['POST'])
def predict_care_center():
    try:
        data = request.json
        dog_age = int(data.get('Dog_Age', 1))
        condition_str = data.get('Condition', 'Healthy')
        severity_str = data.get('Severity', 'None')
        
        condition_code = get_code_from_mapping(care_mappings['Condition'], condition_str)
        severity_code = get_code_from_mapping(care_mappings['Severity'], severity_str)
        
        prediction = care_ai_model.predict([[dog_age, condition_code, severity_code]])[0]
        urgency_result = care_mappings['Urgency_Level'].get(prediction[0], "Routine Checkup")
        clinic_type_result = care_mappings['Recommended_Clinic_Type'].get(prediction[1], "General Vet Clinic")
        
        return jsonify({
            "status": "success",
            "urgency_level": urgency_result, 
            "recommended_clinic_type": clinic_type_result, 
            "ai_message": f"Based on analysis, a {urgency_result} is required. Please visit a {clinic_type_result}."
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    print("✅ Flask Server is running on port 5000...")
    app.run(port=5000, debug=True)