const express = require("express");
const router = express.Router();

// Sample location data (replace with actual data or database)
const locations = {
  counties: [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Eldoret",
    "Machakos",
    "Kiambu",
  ],
  constituencies: {
    Nairobi: ["Westlands", "Dagoretti", "Langata", "Kibra", "Roysambu"],
    Mombasa: ["Mvita", "Nyali", "Kisauni", "Likoni", "Changamwe"],
    Kisumu: ["Kisumu Central", "Kisumu East", "Kisumu West", "Nyando"],
    Nakuru: ["Nakuru Town East", "Nakuru Town West", "Naivasha", "Gilgil"],
    Eldoret: ["Ainabkoi", "Kapseret", "Moiben", "Turbo"],
    Machakos: ["Machakos Town", "Mavoko", "Kathiani", "Matungulu"],
    Kiambu: ["Kiambu Town", "Ruiru", "Thika Town", "Juja", "Gatundu"],
  },
  wards: {
    Westlands: ["Kitisuru", "Parklands", "Karura", "Mountain View"],
    Dagoretti: ["Kilimani", "Kawangware", "Gatina", "Kileleshwa"],
    Langata: ["Karen", "Mugumo-ini", "South C", "Nyayo Highrise"],
    // Add more wards as needed
  },
};

// Get all counties
router.get("/", (req, res) => {
  res.json({ counties: locations.counties });
});

// Get constituencies for a county
router.get("/:county/constituencies", (req, res) => {
  const { county } = req.params;
  const constituencies = locations.constituencies[county] || [];
  res.json({ constituencies });
});

// Get wards for a constituency
router.get("/:county/:constituency/wards", (req, res) => {
  const { constituency } = req.params;
  const wards = locations.wards[constituency] || [];
  res.json({ wards });
});

module.exports = router;
