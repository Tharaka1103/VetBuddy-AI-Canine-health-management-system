from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os
import numpy as np

from apscheduler.schedulers.background import BackgroundScheduler
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import threading
import skfuzzy as fuzz
from skfuzzy import control as ctrl

app = Flask(__name__)
CORS(app)

model = joblib.load('novel_canine_model.pkl')
FEEDBACK_FILE = 'feedback_data.csv'

# Load Neuro-Fuzzy Ensemble Models
try:
    neuro_fuzzy_data = joblib.load('neuro_fuzzy_ensemble.pkl')
    neuro_breed_models = neuro_fuzzy_data['breed_models']
    neuro_breed_scalers = neuro_fuzzy_data['breed_scalers']
    neuro_global_rf = neuro_fuzzy_data['global_rf']
    neuro_breed_encoder = neuro_fuzzy_data['breed_encoder']
    neuro_activity_encoder = neuro_fuzzy_data['activity_encoder']
    print("✅ Neuro-Fuzzy Ensemble models loaded successfully!")
except Exception as e:
    print(f"⚠️ Error loading Neuro-Fuzzy models: {e}")
    neuro_breed_models = None
    neuro_breed_scalers = None
    neuro_global_rf = None
    neuro_breed_encoder = None
    neuro_activity_encoder = None

# Define Fuzzy Inference System (must be recreated at runtime)
def create_fuzzy_system():
    # Fuzzy Input Variables
    temp_deviation = ctrl.Antecedent(np.arange(0, 5.1, 0.1), 'temp_deviation')
    temp_deviation['normal'] = fuzz.trimf(temp_deviation.universe, [0, 0, 0.5])
    temp_deviation['slightly_high'] = fuzz.trimf(temp_deviation.universe, [0.3, 0.8, 1.5])
    temp_deviation['high'] = fuzz.trimf(temp_deviation.universe, [1.0, 2.0, 3.5])
    temp_deviation['very_high'] = fuzz.trimf(temp_deviation.universe, [2.5, 4.0, 5.0])

    hr_deviation = ctrl.Antecedent(np.arange(0, 80.1, 1), 'hr_deviation')
    hr_deviation['normal'] = fuzz.trimf(hr_deviation.universe, [0, 0, 15])
    hr_deviation['elevated'] = fuzz.trimf(hr_deviation.universe, [10, 25, 45])
    hr_deviation['high'] = fuzz.trimf(hr_deviation.universe, [35, 55, 70])
    hr_deviation['very_high'] = fuzz.trimf(hr_deviation.universe, [55, 70, 80])

    rf_prob = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'rf_prob')
    rf_prob['low'] = fuzz.trimf(rf_prob.universe, [0, 0, 0.4])
    rf_prob['medium'] = fuzz.trimf(rf_prob.universe, [0.3, 0.6, 0.8])
    rf_prob['high'] = fuzz.trimf(rf_prob.universe, [0.7, 0.9, 1.0])

    novelty_score = ctrl.Antecedent(np.arange(0, 1.01, 0.01), 'novelty_score')
    novelty_score['low'] = fuzz.trimf(novelty_score.universe, [0, 0, 0.4])
    novelty_score['medium'] = fuzz.trimf(novelty_score.universe, [0.3, 0.6, 0.8])
    novelty_score['high'] = fuzz.trimf(novelty_score.universe, [0.7, 0.9, 1.0])

    # Fuzzy Output Variable: Severity Score (0-100)
    severity = ctrl.Consequent(np.arange(0, 101, 1), 'severity')
    severity['normal'] = fuzz.trimf(severity.universe, [0, 0, 25])
    severity['mild'] = fuzz.trimf(severity.universe, [15, 35, 55])
    severity['moderate'] = fuzz.trimf(severity.universe, [40, 60, 75])
    severity['severe'] = fuzz.trimf(severity.universe, [65, 85, 100])
    severity['critical'] = fuzz.trimf(severity.universe, [80, 100, 100])

    # Define Fuzzy Rules
    rules = [
        ctrl.Rule(temp_deviation['normal'] & hr_deviation['normal'] & 
                  (rf_prob['low'] | rf_prob['medium']) & novelty_score['low'], severity['normal']),
        ctrl.Rule(temp_deviation['slightly_high'] & hr_deviation['normal'] & 
                  rf_prob['low'], severity['normal']),
        ctrl.Rule(temp_deviation['normal'] & hr_deviation['elevated'] & 
                  rf_prob['low'], severity['normal']),
        ctrl.Rule(temp_deviation['slightly_high'] & hr_deviation['elevated'] & 
                  rf_prob['medium'], severity['mild']),
        ctrl.Rule(temp_deviation['high'] & hr_deviation['high'] & 
                  rf_prob['high'], severity['moderate']),
        ctrl.Rule(temp_deviation['very_high'] & hr_deviation['very_high'] & 
                  rf_prob['high'], severity['severe']),
        ctrl.Rule(temp_deviation['very_high'] & hr_deviation['very_high'] & 
                  rf_prob['high'], severity['critical']),
        ctrl.Rule(novelty_score['high'] & rf_prob['high'], severity['severe']),
        ctrl.Rule(novelty_score['high'] & rf_prob['low'], severity['mild']),
        ctrl.Rule(hr_deviation['high'] & rf_prob['high'], severity['moderate']),
    ]

    fis = ctrl.ControlSystem(rules)
    return ctrl.ControlSystemSimulation(fis)

# Create FIS instance
fis_simulation = create_fuzzy_system()

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

# ================================================================
# Neuro-Fuzzy Hybrid Ensemble - Advanced Vitals Monitoring
# ================================================================

def calculate_neuro_fuzzy_severity(features, breed):
    """
    Calculate severity score using the Neuro-Fuzzy Hybrid Ensemble.
    
    Args:
        features: numpy array of [breed_encoded, ambient_temp, dog_temp, heart_rate, activity_encoded]
        breed: string ('Small', 'Medium', 'Large')
    
    Returns:
        dict with severity_score, is_novel_anomaly, status_label
    """
    if neuro_breed_models is None:
        return {'error': 'Neuro-Fuzzy models not loaded'}
    
    breed_encoded, ambient_temp, dog_temp, heart_rate, activity_encoded = features
    
    # Get breed-specific models
    if breed in neuro_breed_models:
        models = neuro_breed_models[breed]
        scaler = neuro_breed_scalers[breed]
    else:
        # Fallback to global model
        rf_model = neuro_global_rf
        scaler = None
        models = None
    
    # Calculate deviations from normal based on breed-specific physiology
    normal_temps = {'Small': 38.8, 'Medium': 38.5, 'Large': 38.2}
    normal_hrs_rest = {'Small': 105, 'Medium': 85, 'Large': 65}
    normal_hrs_walk = {'Small': 135, 'Medium': 115, 'Large': 95}
    normal_hrs_run = {'Small': 175, 'Medium': 155, 'Large': 135}
    
    # Determine expected HR based on activity
    activity_idx = int(activity_encoded)
    if activity_idx == 0:  # Resting
        expected_hr = normal_hrs_rest.get(breed, 85)
    elif activity_idx == 1:  # Walking
        expected_hr = normal_hrs_walk.get(breed, 115)
    else:  # Running
        expected_hr = normal_hrs_run.get(breed, 155)
    
    temp_dev = abs(dog_temp - normal_temps.get(breed, 38.5))
    hr_dev = abs(heart_rate - expected_hr)
    
    # Get RF prediction probability
    if models:
        rf_model = models['random_forest']
        rf_proba = rf_model.predict_proba([features])[0, 1]
    else:
        rf_proba = neuro_global_rf.predict_proba([features])[0, 1]
    
    # Get novelty scores from Isolation Forest and One-Class SVM
    if models and scaler:
        features_scaled = scaler.transform([features])
        iso_score = models['isolation_forest'].decision_function(features_scaled)[0]
        svm_score = models['one_class_svm'].decision_function(features_scaled)[0]
        
        # Normalize novelty scores to 0-1 (tuned for contamination=0.05)
        iso_novelty = max(0, min(1, -iso_score / 0.3))
        svm_novelty = max(0, min(1, -svm_score / 1.5))
        
        # Combine novelty scores (weighted average)
        novelty = (iso_novelty * 0.6 + svm_novelty * 0.4)
    else:
        novelty = 0.1  # Low novelty for unknown breeds
    
    # Set fuzzy inputs
    fis_simulation.input['temp_deviation'] = min(temp_dev, 5.0)
    fis_simulation.input['hr_deviation'] = min(hr_dev, 80)
    fis_simulation.input['rf_prob'] = rf_proba
    fis_simulation.input['novelty_score'] = novelty
    
    # Compute fuzzy output
    try:
        fis_simulation.compute()
        severity_score = fis_simulation.output['severity']
    except:
        # Fallback if FIS fails
        severity_score = (rf_proba * 60) + (novelty * 40)
    
    # Clamp to 0-100
    severity_score = max(0, min(100, severity_score))
    
    # Determine if novel anomaly
    is_novel = novelty > 0.6 and rf_proba < 0.7
    
    # Determine status label (raised thresholds to reduce false positives)
    if severity_score < 35:
        status_label = "Normal"
    elif severity_score < 55:
        status_label = "Mild"
    elif severity_score < 70:
        status_label = "Moderate"
    elif severity_score < 85:
        status_label = "Severe"
    else:
        status_label = "Critical"
    
    return {
        'severity_score': round(severity_score, 2),
        'is_novel_anomaly': is_novel,
        'status_label': status_label,
        'rf_probability': round(rf_proba, 3),
        'novelty_score': round(novelty, 3)
    }

@app.route('/predict-neuro-fuzzy', methods=['POST'])
def predict_neuro_fuzzy():
    """
    Neuro-Fuzzy Hybrid Ensemble endpoint for advanced vitals monitoring.
    
    Returns:
        - severity_score: Continuous score 0-100
        - is_novel_anomaly: Boolean flag for novel anomalies
        - status_label: Categorical status (Normal, Mild, Moderate, Severe, Critical)
    """
    if neuro_breed_models is None:
        return jsonify({'error': 'Neuro-Fuzzy models not loaded'}), 503
    
    try:
        data = request.json
        
        breed_str = data['Breed_Size']
        ambient_temp = float(data['Ambient_Temp'])
        dog_temp = float(data['Dog_Temp'])
        heart_rate = int(data['Heart_Rate'])
        activity_str = data['Activity_Level']
        
        # Encode categorical variables
        breed_encoded = neuro_breed_encoder.transform([breed_str])[0]
        activity_encoded = neuro_activity_encoder.transform([activity_str])[0]
        
        # Prepare features
        features = np.array([breed_encoded, ambient_temp, dog_temp, heart_rate, activity_encoded])
        
        # Calculate severity using Neuro-Fuzzy Ensemble
        result = calculate_neuro_fuzzy_severity(features, breed_str)
        
        if 'error' in result:
            return jsonify(result), 500
        
        return jsonify({
            'severity_score': result['severity_score'],
            'is_novel_anomaly': result['is_novel_anomaly'],
            'status_label': result['status_label']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
# 🌟 MLOps: Automated Continuous Retraining Pipeline 
# ================================================================
def automated_retraining_pipeline():
    print("\n⚙️ [MLOps] Triggering Automated Retraining Pipeline...")
    global model  
    
    if not os.path.exists(FEEDBACK_FILE):
        print("⚠️ No feedback data found. Skipping retraining.")
        return

    try:
        df = pd.read_csv(FEEDBACK_FILE)
        
        if len(df) < 50:
            print(f"⚠️ Not enough data for robust retraining. Found {len(df)} rows, need 50.")
            return

        print(f"📊 Found {len(df)} validated records. Starting training...")
        
        X = df[['Breed_Encoded', 'Ambient_Temp', 'Dog_Temp', 'Heart_Rate', 'Activity_Encoded']]
        y = df['Status']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        new_model = RandomForestClassifier(n_estimators=100, random_state=42)
        new_model.fit(X_train, y_train)
        
        preds = new_model.predict(X_test)
        new_accuracy = accuracy_score(y_test, preds)
        print(f"🎯 New Model Accuracy: {new_accuracy * 100:.2f}%")

        if new_accuracy >= 0.85:
            joblib.dump(new_model, 'novel_canine_model.pkl') 
            model = new_model 
            print("✅ [SUCCESS] New model deployed successfully with Zero-Downtime!")
        else:
            print("⚠️ [REJECTED] New model accuracy is too low. Keeping the old model to ensure safety.")

    except Exception as e:
        print(f"❌ Retraining Pipeline Failed: {e}")

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

# ================================================================
#  Skin Disease AI — Advanced Two-Step Pipeline with Unknown Disease Handler
# ================================================================

import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mobilenet_preprocess, decode_predictions
from tensorflow.keras.applications.densenet import preprocess_input as densenet_preprocess
import os

SKIN_CLASSES = ['Demodicosis', 'Dermatitis', 'Fungal_Infections', 'Healthy', 'Ringworm', 'Hypersensitivity']
skin_disease_model = None
dog_validator = None

try:
    dog_validator = MobileNetV2(weights='imagenet')
    print("✅ MobileNetV2 Image Context Validator loaded")
except Exception as e:
    print(f"⚠️ Error loading MobileNetV2: {e}")

try:
    from tensorflow.keras.applications import DenseNet121
    from tensorflow.keras import layers, models
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    weights_path = os.path.join(BASE_DIR, 'canine_skin_disease_model.keras') 
    
    base_model = DenseNet121(weights=None, include_top=False, input_shape=(224, 224, 3))
    
    skin_disease_model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.BatchNormalization(),
        layers.Dropout(0.4),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(6, activation='softmax') 
    ])
    
    skin_disease_model.load_weights(weights_path)
    print("✅ Skin disease DenseNet121 model loaded successfully!")

except Exception as e:
    print(f"⚠️ Error loading skin disease model: {e}")


def validate_image_context(img_array_224):

    x = np.expand_dims(img_array_224.copy(), axis=0)
    x = mobilenet_preprocess(x)
    preds = dog_validator.predict(x, verbose=0)
    
    decoded = decode_predictions(preds, top=5)[0]
    
    top_prob = decoded[0][2]
    top_label = decoded[0][1].lower()
    
    safe_keywords = [
        'dog', 'puppy', 'hound', 'terrier', 'spaniel', 'retriever', 
        'canine', 'fur', 'hair', 'coat', 'skin', 'animal'
    ]

    is_safe = False
    for i in range(3):
        if any(kw in decoded[i][1].lower() for kw in safe_keywords):
            is_safe = True
            break
            
    if is_safe:
        return True, None

    blacklist = [
    "volcano", "alp", "cliff", "coral_reef", "lakeside", "seashore", "sandbar", "promontory", "valley", "geyser", "mushroom", "daisy", "rapeseed", "corn", "acorn", "hip", "buckeye", "ear", "fountain", "cliff_dwelling", "tree_frog", "leaf_beetle", "hay", "straw", "thatch", "rock", "stone_wall", "mountain", "sky", "ocean", "river", "lake", "forest", "jungle", "desert", "glacier", "waterfall", "beach", "reef", "swamp", "meadow", "prairie", "tundra", "rainforest", "canyon", "cave", "island", "peninsula", "sunset", "sunrise", "cloud", "rainbow", "thunderstorm", "snowflake", "icicle", "tornado", "hurricane", "fog", "mist", "hail",
    "ambulance", "beach_wagon", "cab", "convertible", "jeep", "limousine", "minivan", "model_t", "racer", "sports_car", "garbage_truck", "pickup", "tow_truck", "trailer_truck", "moving_van", "fire_engine", "police_van", "recreational_vehicle", "streetcar", "snowplow", "go-kart", "golfcart", "moped", "mountain_bike", "bicycle-built-for-two", "unicycle", "tricycle", "motor_scooter", "freight_car", "passenger_car", "bullet_train", "electric_locomotive", "steam_locomotive", "trolleybus", "school_bus", "minibus", "aircraft_carrier", "warplane", "airliner", "airship", "balloon", "bobsled", "canoe", "catamaran", "container_ship", "dock", "drilling_platform", "ferry", "fireboat", "gondola", "houseboat", "kayak", "lifeboat", "liner", "motorboat", "oxcart", "paddle", "paddlewheel", "pirate", "pontoon", "sailboat", "schooner", "speedboat", "submarine", "trimaran", "wreck", "yawl", "car_wheel", "car_mirror", "grille", "seat_belt", "landing_gear", "rocket", "space_shuttle", "tank", "half_track", "snowmobile", "forklift", "harvester", "lawn_mower", "tractor", "thresher",
    "person", "man", "woman", "child", "face", "hand", "head", "jean", "jersey", "kimono", "lab_coat", "miniskirt", "overskirt", "pajama", "sarong", "suit", "swimming_trunks", "bikini", "brassiere", "bonnet", "cowboy_hat", "sombrero", "bathing_cap", "shower_cap", "football_helmet", "crash_helmet", "mortarboard", "wig", "cloak", "abaya", "academic_gown", "military_uniform", "bow_tie", "neck_brace", "stole", "feather_boa", "sandal", "clog", "running_shoe", "loafer", "sock", "boot", "cowboy_boot", "mitten", "glove", "trench_coat", "poncho", "cardigan", "sweatshirt", "hoopskirt", "diaper", "lipstick", "perfume", "sunglasses", "sunglass", "hair_spray", "hand_blower", "mask", "ski_mask", "gas_mask", "oxygen_mask", "bib", "apron", "vestment", "stethoscope", "neck_brace", "rubber_eraser", "sunscreen", "hair_slide", "buckle", "wallet", "purse", "backpack", "mailbag", "sleeping_bag", "plastic_bag", "packet",
    "desk", "bookcase", "bookshop", "library", "china_cabinet", "medicine_chest", "chiffonier", "table_lamp", "file", "filing_cabinet", "folding_chair", "rocking_chair", "barber_chair", "throne", "studio_couch", "four-poster", "cradle", "crib", "bassinet", "bathtub", "shower_curtain", "toilet_seat", "washbasin", "medicine_cabinet", "window_shade", "window_screen", "venetian_blind", "curtain", "doormat", "prayer_rug", "quilt", "pillow", "lampshade", "dining_table", "entertainment_center", "wardrobe", "chest", "bannister", "stairway", "fireplace", "radiator", "refrigerator", "washer", "iron", "espresso_maker", "microwave", "dishwasher", "dutch_oven", "toaster", "waffle_iron", "vacuum", "electric_fan", "wall_clock", "grandfather_clock", "cuckoo_clock", "sundial", "altar", "triumphal_arch", "patio", "steel_arch_bridge", "suspension_bridge", "viaduct", "barn", "greenhouse", "palace", "monastery", "church", "mosque", "stupa", "planetarium", "cinema", "home_theater", "lumbermill", "dam", "castle", "beacon", "lighthouse", "bell_cote", "dome", "obelisk", "fountain", "pier", "boathouse", "yurt", "mobile_home", "tile_roof", "thatch", "prison", "grocery_store", "tobacco_shop", "toyshop", "shoe_shop", "confectionery", "bakery", "butcher_shop", "barbershop", "parking_meter", "traffic_light", "street_sign", "chain_link_fence", "picket_fence", "worm_fence",
    "desktop_computer", "laptop", "notebook", "hand-held_computer", "keyboard", "mouse", "monitor", "screen", "television", "iPod", "cd_player", "cassette_player", "tape_player", "radio", "loudspeaker", "microphone", "headphone", "earphone", "cellular_telephone", "dial_telephone", "pay-phone", "modem", "printer", "photocopier", "scanner", "fax", "projector", "remote_control", "joystick", "switch", "power_drill", "chain_saw", "hammer", "hatchet", "screwdriver", "wrench", "plunger", "nail", "screw", "safety_pin", "syringe", "magnetic_compass", "binoculars", "telescope", "microscope", "reflex_camera", "polaroid_camera", "digital_clock", "analog_clock", "hourglass", "stopwatch", "barometer", "odometer", "speedometer", "stethoscope", "solar_dish", "rule", "scale", "typewriter_keyboard", "combination_lock", "padlock", "lighter", "matchstick", "candle", "flashlight", "torch", "spotlight", "jack-o-lantern", "abacus", "calculator", "cash_machine", "slot", "vending_machine", "pencil_box", "pencil_sharpener", "ballpoint", "fountain_pen", "paintbrush", "hand_blower", "paper_towel", "toilet_tissue", "soap_dispenser", "mousetrap", "corkscrew", "can_opener", "bottle_cap", "wine_bottle", "beer_bottle", "water_bottle", "beer_glass", "goblet", "cocktail_shaker", "coffeepot", "teapot", "cup", "mug", "measuring_cup", "mixing_bowl", "soup_bowl", "pot", "frying_pan", "wok", "caldron", "pitcher", "ladle", "spatula", "crock_pot", "strainer", "plate", "tray", "platter", "pan", "umbrella", "ping-pong_ball", "soccer_ball", "basketball", "baseball", "tennis_ball", "volleyball", "football", "rugby_ball", "golf_ball", "puck", "racket", "ski", "pole", "snowboard", "barbell", "dumbbell", "balance_beam", "horizontal_bar", "parallel_bars", "punching_bag", "parachute", "envelope", "binder", "notebook", "comic_book", "crossword_puzzle", "jigsaw_puzzle", "menu", "newspaper", "letter_opener", "magnetic_compass", "whistle", "drum", "drumstick", "maraca", "marimba", "steel_drum", "banjo", "cello", "violin", "harp", "acoustic_guitar", "electric_guitar", "bass", "grand_piano", "upright", "organ", "harmonica", "accordion", "ocarina", "panpipe", "flute", "oboe", "sax", "cornet", "french_horn", "trombone", "church_organ",
    "pizza", "cheeseburger", "hotdog", "pretzel", "bagel", "french_loaf", "mashed_potato", "French_fries", "guacamole", "carbonara", "chocolate_sauce", "dough", "meat_loaf", "burrito", "consomme", "trifle", "ice_cream", "ice_lolly", "espresso", "eggnog", "cup", "red_wine", "banana", "pineapple", "custard_apple", "pomegranate", "fig", "strawberry", "orange", "lemon", "jackfruit", "granny_smith", "broccoli", "cauliflower", "zucchini", "spaghetti_squash", "acorn_squash", "butternut_squash", "cucumber", "artichoke", "bell_pepper", "cardoon", "head_cabbage", "mushroom", "grocery_store", "bakery", "confectionery", "plate", "dining_table", "restaurant", "menu", "apple", "grape", "peach", "pear", "plum", "cherry", "watermelon", "bread", "toast", "waffle", "pancake", "donut", "cake", "pie", "cookie", "cracker", "chip", "popcorn", "candy", "chocolate", "sushi", "dumpling", "noodle", "rice", "pasta", "cereal", "soup", "salad", "sandwich", "taco", "steak",
    "tabby", "tiger_cat", "persian_cat", "siamese_cat", "egyptian_cat", "cougar", "lynx", "leopard", "snow_leopard", "jaguar", "lion", "tiger", "cheetah",
    "cock", "hen", "ostrich", "brambling", "goldfinch", "house_finch", "junco", "indigo_bunting", "robin", "bulbul", "jay", "magpie", "chickadee", "water_ouzel", "kite", "bald_eagle", "vulture", "great_grey_owl", "black_grouse", "ptarmigan", "ruffed_grouse", "prairie_chicken", "peacock", "quail", "partridge", "african_grey", "macaw", "sulphur-crested_cockatoo", "lorikeet", "coucal", "bee_eater", "hornbill", "hummingbird", "jacamar", "toucan", "drake", "red-breasted_merganser", "goose", "black_swan", "white_stork", "black_stork", "spoonbill", "flamingo", "little_blue_heron", "american_egret", "bittern", "crane", "limpkin", "american_coot", "bustard", "ruddy_turnstone", "red-backed_sandpiper", "redshank", "dowitcher", "oystercatcher", "pelican", "king_penguin", "albatross", "whale",
    "great_white_shark", "tiger_shark", "hammerhead", "electric_ray", "stingray", "barracouta", "coho", "goldfish", "tench", "eel", "rock_beauty", "anemone_fish", "sturgeon", "gar", "puffer", "lionfish", "starfish", "sea_urchin", "sea_cucumber", "sea_slug", "sea_anemone", "jellyfish", "coral_fungus", "brain_coral", "flatworm", "conch", "snail", "slug", "chiton", "chambered_nautilus", "dungeness_crab", "rock_crab", "fiddler_crab", "king_crab", "american_lobster", "spiny_lobster", "crayfish", "hermit_crab", "isopod", "trilobite",
    "loggerhead", "leatherback_turtle", "mud_turtle", "terrapin", "box_turtle", "banded_gecko", "common_iguana", "american_chameleon", "whiptail", "agama", "frilled_lizard", "alligator_lizard", "gila_monster", "green_lizard", "african_chameleon", "komodo_dragon", "nile_crocodile", "american_alligator", "triceratops", "thunder_snake", "ringneck_snake", "hognose_snake", "green_snake", "king_snake", "garter_snake", "water_snake", "vine_snake", "night_snake", "boa_constrictor", "rock_python", "indian_cobra", "green_mamba", "sea_snake", "horned_viper", "diamondback", "sidewinder", "european_fire_salamander", "common_newt", "spotted_salamander", "axolotl", "bullfrog", "tree_frog", "tailed_frog",
    "ant", "bee", "wasp", "fly", "mosquito", "dragonfly", "damselfly", "admiral", "ringlet", "monarch", "cabbage_butterfly", "sulphur_butterfly", "lycaenid", "cricket", "grasshopper", "cockroach", "mantis", "cicada", "leafhopper", "lacewing", "walking_stick", "stick_insect", "leaf_beetle", "long-horned_beetle", "ground_beetle", "weevil", "ladybug", "dung_beetle", "rhinoceros_beetle", "stinkbug", "black_widow", "tarantula", "wolf_spider", "garden_spider", "barn_spider", "black_and_gold_garden_spider", "tick", "centipede", "scorpion",
    "titi", "spider_monkey", "howler_monkey", "squirrel_monkey", "marmoset", "capuchin", "baboon", "macaque", "langur", "colobus", "proboscis_monkey", "gibbon", "siamang", "gorilla", "chimpanzee", "orangutan", "indri", "lemur",
    "sorrel", "zebra", "hog", "wild_boar", "warthog", "hippopotamus", "ox", "water_buffalo", "bison", "ram", "bighorn", "ibex", "hartebeest", "impala", "gazelle", "arabian_camel", "llama", "weasel", "mink", "polecat", "black-footed_ferret", "otter", "skunk", "badger", "armadillo", "three-toed_sloth", "orangutan", "gorilla", "chimpanzee", "gibbon", "siamang", "indian_elephant", "african_elephant", "red_panda", "giant_panda", "lesser_panda", "mongoose", "meerkat", "brown_bear", "american_black_bear", "ice_bear", "polar_bear", "sloth_bear", "koala", "wombat", "platypus", "echidna", "wallaby", "wood_rabbit", "hare", "angora_rabbit", "hamster", "porcupine", "guinea_pig", "beaver", "fox_squirrel", "marmot", "chipmunk", "mouse", "rat", "horse", "donkey", "mule", "cow", "bull", "pig", "sheep", "goat", "deer", "elk", "moose", "caribou", "antelope", "giraffe", "rhinoceros", "cat", "kitten", "rabbit", "ferret", "raccoon", "opossum", "bat", "hedgehog", "shrew", "mole", "dugong", "sea_lion", "whale", "dolphin", "seal",
    "earthworm", "nematode", "flatworm", "leech",
    "space_shuttle", "missile", "projectile", "shield", "cannon", "guillotine", "galleon", "coffin", "megalith", "totem_pole", "pedestal", "throne", "altar", "triumphal_arch", "steel_arch_bridge", "suspension_bridge", "viaduct", "pier", "crane", "maypole", "flagpole", "manhole_cover", "gasmask", "oxygen_mask", "snorkel", "parachute", "sleeping_bag", "stretcher", "ambulance", "fire_screen", "steel_drum", "maraca", "marimba", "gong", "chime", "bell", "whistle", "jinrikisha", "rickshaw", "oxcart", "horse_cart", "shopping_cart", "wheelbarrow", "barrel", "crate", "basket", "hamper", "tub", "bucket", "pail", "shovel", "hoe", "rake", "axe", "pickaxe", "saw", "pliers", "nippers", "bolt", "nut", "washer", "hook", "nail", "screw", "safety_pin", "knot", "chain", "wire", "cable", "rope", "string", "ribbon", "band", "belt", "strap", "clip", "clamp", "vise", "broom", "mop", "sponge", "dustpan", "trash_can", "dumpster", "mailbox", "pole", "post", "sign", "billboard", "banner", "flag", "pennant", "kite", "pinwheel", "windmill", "solar_dish", "satellite_dish", "antenna", "radar", "water_tower", "oil_filter", "gasoline_pump", "pipeline", "manhole_cover", "grate", "grille", "vent", "chimney", "smokestack", "silo", "tank", "reservoir", "dam", "dike", "levee", "maze", "labyrinth", "web_site", "comic_book", "crossword_puzzle", "jigsaw_puzzle", "slot_machine", "pinball_machine", "dartboard", "chessboard", "checkerboard", "puzzle", "dice", "domino", "card", "abacus", "sundial", "kaleidoscope", "gyroscope",
    ]
    
    is_blacklisted = any(kw in top_label for kw in blacklist)
    
    if is_blacklisted and top_prob > 0.15:
        friendly_name = top_label.replace('_', ' ').title()
        return False, friendly_name
        
    if top_prob > 0.35:
        friendly_name = top_label.replace('_', ' ').title()
        return False, friendly_name
        
    return True, None

def calculate_severity(img_array):
    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    img_resized = cv2.resize(img_bgr, (300, 300))
    hsv = cv2.cvtColor(img_resized, cv2.COLOR_BGR2HSV)
    
    mask1 = cv2.inRange(hsv, np.array([0, 50, 50]), np.array([10, 255, 255]))
    mask2 = cv2.inRange(hsv, np.array([170, 50, 50]), np.array([180, 255, 255]))
    full_mask = mask1 + mask2
    
    percentage = (cv2.countNonZero(full_mask) / (300 * 300)) * 100
    level = "Mild" if percentage < 5.0 else "Moderate" if percentage < 15.0 else "Severe"
    return level, round(percentage, 2)


@app.route('/predict-skin-disease', methods=['POST'])
def predict_skin():
    if dog_validator is None or skin_disease_model is None:
        return jsonify({"status": "error", "message": "AI models are not loaded. Check server logs."}), 503

    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400
    
    file = request.files['file']
    file_bytes = np.fromfile(file, np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_224 = cv2.resize(img_rgb, (224, 224))

    passed, rejected_label = validate_image_context(img_224)
    if not passed:
        return jsonify({
            "status": "error",
            "message": "⚠️ Oops! This doesn't look like a photo of a dog's skin condition. Please upload a clear, close-up image of the affected area."        })

    img_preprocessed = densenet_preprocess(np.expand_dims(img_224.copy(), axis=0))
    preds = skin_disease_model.predict(img_preprocessed)[0]
    max_idx = np.argmax(preds)
    confidence = float(preds[max_idx])
    disease_name = SKIN_CLASSES[max_idx]
    
    if confidence < 0.55:
        return jsonify({
            "status": "unknown",
            "message": "⚠️ Unknown Skin Condition: We detected a skin anomaly, but it does not match our database of 5 known diseases (Ringworm, Dermatitis, etc.). It might be a different condition. Please consult a Vet.",
            "confidence": round(confidence * 100, 2)
        })

    if confidence < 0.75:
        return jsonify({
            "status": "warning",
            "message": f"⚠️ Low Confidence Match: It looks somewhat like {disease_name.replace('_', ' ').title()}, but we are not highly confident. It could be an unrelated condition.",
            "confidence": round(confidence * 100, 2),
            "disease": disease_name.replace('_', ' ').title()
        })

    # Healthy Condition
    if disease_name.lower() == 'healthy':
        return jsonify({
            "status": "success",
            "disease": "Healthy",
            "confidence": round(confidence * 100, 2),
            "message": "✅ No skin diseases detected. The skin appears healthy."
        })
    
    # Confident Disease Detected (> 75%)
    severity_level, affected_area = calculate_severity(img_rgb)
    
    return jsonify({
        "status": "success",
        "disease": disease_name.replace('_', ' ').title(),
        "confidence": round(confidence * 100, 2),
        "severity": severity_level,
        "affected_area_percentage": affected_area
    })

# ================================================================
#  Behavior AI — Predict posture from accelerometer values
# ================================================================
import librosa

# Load Training & Bark Models
behavior_model = None
behavior_encoders = None
bark_model = None
bark_encoders = None

try:
    behavior_data = joblib.load('dog_behavior_model_97plus.pkl')
    behavior_model = behavior_data['model']
    behavior_encoders = behavior_data['encoders']

    bark_data = joblib.load('bark_emotion_model_new.pkl')
    bark_model = bark_data['model']
    bark_encoders = bark_data['encoders']
    print("✅ Training & Bark AI Models loaded successfully!")
except Exception as e:
    print(f"⚠️ Error loading training models: {e}")

@app.route('/predict-behavior', methods=['POST'])
def predict_behavior():
    try:
        data = request.json
        features = np.array([[data['neck_x'], data['neck_y'], data['neck_z'],
                              data['back_x'], data['back_y'], data['back_z']]])

        preds = behavior_model.predict(features)[0]

        head = behavior_encoders['head'].inverse_transform([preds[0]])[0]
        body = behavior_encoders['body'].inverse_transform([preds[1]])[0]
        atomic = behavior_encoders['atomic'].inverse_transform([preds[2]])[0]

        return jsonify({"status": "success", "head_posture": head, "body_posture": body, "atomic_behavior": atomic})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/predict-bark', methods=['POST'])
def predict_bark():
    if bark_model is None or bark_encoders is None:
        return jsonify({"status": "error", "message": "Bark AI model is not loaded. Check server logs."}), 503

    try:
        if 'audio' not in request.files:
            return jsonify({"status": "error", "message": "No audio file uploaded"}), 400

        audio_file = request.files['audio']
        age = int(request.form.get('age'))
        weight = float(request.form.get('weight'))
        sex = request.form.get('sex', '').lower()
        breed = request.form.get('breed', '')

        # Map UI breed names to the labels the model was trained on
        known_breeds = list(bark_encoders['breed'].classes_)
        breed_lower_map = {b.lower(): b for b in known_breeds}
        if breed.lower() in breed_lower_map:
            breed = breed_lower_map[breed.lower()]
        else:
            breed = known_breeds[0]  # fallback to first known breed

        # Audio feature extraction (160 features)
        y, sr = librosa.load(audio_file, duration=3.0, offset=0.0)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        mfccs_mean = np.mean(mfccs.T, axis=0)
        mfccs_std = np.std(mfccs.T, axis=0)
        mfccs_max = np.max(mfccs.T, axis=0)
        mfccs_min = np.min(mfccs.T, axis=0)
        audio_features = np.hstack([mfccs_mean, mfccs_std, mfccs_max, mfccs_min])

        # Tabular encoding
        sex_encoded = bark_encoders['sex'].transform([sex])[0]
        breed_encoded = bark_encoders['breed'].transform([breed])[0]
        tabular_features = np.array([age, weight, sex_encoded, breed_encoded])

        # Combine and predict
        final_features = np.concatenate((audio_features, tabular_features)).reshape(1, -1)
        pred_encoded = bark_model.predict(final_features)[0]
        emotion = bark_encoders['context'].inverse_transform([pred_encoded])[0]

        return jsonify({"status": "success", "emotion": emotion})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ================================================================
#  Speech-to-Text — Transcribe recorded audio (server-side)
# ================================================================
import speech_recognition as sr_lib
import io
import tempfile

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Accept a WAV audio blob, transcribe it using Google free STT."""
    try:
        if 'audio' not in request.files:
            return jsonify({"status": "error", "message": "No audio file"}), 400

        audio_file = request.files['audio']
        language = request.form.get('language', 'en-US')

        # Save to a temp file so speech_recognition can read it
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            tmp.write(audio_file.read())
            tmp_path = tmp.name

        recognizer = sr_lib.Recognizer()
        with sr_lib.AudioFile(tmp_path) as source:
            audio_data = recognizer.record(source)

        os.unlink(tmp_path)  # cleanup temp file

        text = recognizer.recognize_google(audio_data, language=language)
        return jsonify({"status": "success", "text": text})

    except sr_lib.UnknownValueError:
        return jsonify({"status": "error", "message": "Could not understand the audio. Please speak clearly and try again."})
    except sr_lib.RequestError as e:
        return jsonify({"status": "error", "message": f"Speech service error: {e}"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

scheduler = BackgroundScheduler()

scheduler.add_job(func=automated_retraining_pipeline, trigger="interval", days=7) # minutes=1 if need it run immidiatly
scheduler.start()

if __name__ == '__main__':
    print("✅ Flask Server is running on port 5000...")
    app.run(port=5000, debug=True)