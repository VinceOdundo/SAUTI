import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config";

const LocationPicker = ({ location, onChange }) => {
  const [counties, setCounties] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${API_URL}/locations`);
        setCounties(response.data.counties);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchConstituencies = async () => {
      if (!location.county) {
        setConstituencies([]);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/locations/${location.county}/constituencies`
        );
        setConstituencies(response.data.constituencies);
      } catch (error) {
        console.error("Error fetching constituencies:", error);
      }
    };

    fetchConstituencies();
  }, [location.county]);

  useEffect(() => {
    const fetchWards = async () => {
      if (!location.constituency) {
        setWards([]);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/locations/${location.county}/${location.constituency}/wards`
        );
        setWards(response.data.wards);
      } catch (error) {
        console.error("Error fetching wards:", error);
      }
    };

    fetchWards();
  }, [location.county, location.constituency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newLocation = { ...location };

    if (name === "county") {
      newLocation.constituency = "";
      newLocation.ward = "";
    } else if (name === "constituency") {
      newLocation.ward = "";
    }

    newLocation[name] = value;
    onChange(newLocation);
  };

  if (loading) {
    return <div className="text-gray-500">Loading locations...</div>;
  }

  return (
    <div className="space-y-3">
      <div>
        <select
          name="county"
          value={location.county}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select County</option>
          {counties.map((county) => (
            <option key={county} value={county}>
              {county}
            </option>
          ))}
        </select>
      </div>

      {location.county && (
        <div>
          <select
            name="constituency"
            value={location.constituency}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select Constituency</option>
            {constituencies.map((constituency) => (
              <option key={constituency} value={constituency}>
                {constituency}
              </option>
            ))}
          </select>
        </div>
      )}

      {location.constituency && (
        <div>
          <select
            name="ward"
            value={location.ward}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select Ward</option>
            {wards.map((ward) => (
              <option key={ward} value={ward}>
                {ward}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
