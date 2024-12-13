import React, { useState, useEffect } from "react";
import { useToast } from "../../contexts/ToastContext";
import axios from "axios";

const LocationPicker = ({ location, onChange }) => {
  const [counties, setCounties] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [wards, setWards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCounties();
  }, []);

  useEffect(() => {
    if (location.county) {
      fetchConstituencies(location.county);
    } else {
      setConstituencies([]);
      setWards([]);
    }
  }, [location.county]);

  useEffect(() => {
    if (location.constituency) {
      fetchWards(location.constituency);
    } else {
      setWards([]);
    }
  }, [location.constituency]);

  const fetchCounties = async () => {
    try {
      const response = await axios.get("/locations/counties");
      setCounties(response.data);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch counties",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConstituencies = async (county) => {
    try {
      const response = await axios.get(
        `/locations/constituencies/${county}`
      );
      setConstituencies(response.data);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch constituencies",
        "error"
      );
    }
  };

  const fetchWards = async (constituency) => {
    try {
      const response = await axios.get(`/locations/wards/${constituency}`);
      setWards(response.data);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch wards",
        "error"
      );
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* County */}
      <div className="space-y-2">
        <label
          htmlFor="county"
          className="block text-sm font-medium text-primary"
        >
          County
        </label>
        <select
          id="county"
          name="county"
          value={location.county}
          onChange={handleChange}
          className="w-full bg-base text-primary border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-accent-primary transition-base"
        >
          <option value="">Select County</option>
          {counties.map((county) => (
            <option key={county} value={county}>
              {county}
            </option>
          ))}
        </select>
      </div>

      {/* Constituency */}
      {location.county && (
        <div className="space-y-2">
          <label
            htmlFor="constituency"
            className="block text-sm font-medium text-primary"
          >
            Constituency
          </label>
          <select
            id="constituency"
            name="constituency"
            value={location.constituency}
            onChange={handleChange}
            className="w-full bg-base text-primary border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-accent-primary transition-base"
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

      {/* Ward */}
      {location.constituency && (
        <div className="space-y-2">
          <label
            htmlFor="ward"
            className="block text-sm font-medium text-primary"
          >
            Ward
          </label>
          <select
            id="ward"
            name="ward"
            value={location.ward}
            onChange={handleChange}
            className="w-full bg-base text-primary border border-border rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-accent-primary transition-base"
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
