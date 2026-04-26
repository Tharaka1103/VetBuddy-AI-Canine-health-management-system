// seed.js
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config({ path: '.env.local' }); // .env ෆයිල් එකෙන් Database ලින්ක් එක ගන්නවා

// 1. ඔයාගේ MongoDB Connection String එක
// (ඔයාගේ .env.local එකේ MONGODB_URI කියලා තියෙනවා නම් ඒක ගනීවි. නැත්නම් මෙතන '' ඇතුළේ කෙලින්ම ඔයාගේ ලින්ක් එක දාන්න)
const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://woofy-user:28KAgJI97xXXJvA1@cluster-woofy.90gy9h3.mongodb.net/?appName=Cluster-woofy";

mongoose.connect(MONGO_URI)
  .then(() => console.log("⏳ Connected to MongoDB..."))
  .catch(err => console.log("MongoDB Connection Error: ", err));

// 2. Mongoose Schema එක (GeoJSON ආකෘතිය සහිතව)
const careCenterSchema = new mongoose.Schema({
  Center_Name: String,
  Location: String,
  Location_Coords: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // අනිවාර්යයෙන්ම [Longitude, Latitude] පිළිවෙළට තිබිය යුතුයි
  },
  Facility_Type: String,
  Is_24x7: Boolean,
  Specializations: String,
  Average_Rating: Number,
  Current_Wait_Time_Mins: Number,
  Contact_Number: String
});

// 10km Search එක වැඩ කරන්න මේ 2dsphere Index එක අනිවාර්යයි!
careCenterSchema.index({ Location_Coords: "2dsphere" });

const CareCenter = mongoose.models.CareCenter || mongoose.model('CareCenter', careCenterSchema);

// 3. CSV එක කියවා Database එකට දැමීම
const importData = async () => {
  try {
    // පරණ දත්ත තියෙනවා නම් ඒවා මකලා අලුතින් දානවා (Duplicate නොවෙන්න)
    await CareCenter.deleteMany();
    console.log("🧹 Cleared old Care Center data...");

    const centers = [];
    
    fs.createReadStream('sl_vet_clinics_db.csv')
      .pipe(csv())
      .on('data', (row) => {
        centers.push({
          Center_Name: row.Center_Name,
          Location: row.Location,
          // මෙතන තමයි මැජික් එක වෙන්නේ! Lat, Lng දෙක GeoJSON වලට හරවනවා
          Location_Coords: {
            type: "Point",
            coordinates: [parseFloat(row.Longitude), parseFloat(row.Latitude)]
          },
          Facility_Type: row.Facility_Type,
          Is_24x7: row.Is_24x7 === 'True', // Text එක Boolean කරනවා
          Specializations: row.Specializations,
          Average_Rating: parseFloat(row.Average_Rating),
          Current_Wait_Time_Mins: parseInt(row.Current_Wait_Time_Mins),
          Contact_Number: row.Contact_Number
        });
      })
      .on('end', async () => {
        await CareCenter.insertMany(centers);
        console.log(`✅ Successfully imported ${centers.length} Care Centers into MongoDB!`);
        process.exit();
      });

  } catch (error) {
    console.error("❌ Error importing data:", error);
    process.exit(1);
  }
};

importData();