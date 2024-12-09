const LocationPicker = ({ location, onChange }) => {
  return (
    <div className="space-y-4">
      <select
        value={location.county}
        onChange={(e) => onChange({ ...location, county: e.target.value })}
        className="w-full bg-dark-600 text-white px-4 py-2 rounded-lg"
        required
      >
        <option value="">Select County</option>
        {/* Add county options here */}
      </select>

      <select
        value={location.constituency}
        onChange={(e) =>
          onChange({ ...location, constituency: e.target.value })
        }
        className="w-full bg-dark-600 text-white px-4 py-2 rounded-lg"
        required
      >
        <option value="">Select Constituency</option>
        {/* Add constituency options based on selected county */}
      </select>

      <select
        value={location.ward}
        onChange={(e) => onChange({ ...location, ward: e.target.value })}
        className="w-full bg-dark-600 text-white px-4 py-2 rounded-lg"
        required
      >
        <option value="">Select Ward</option>
        {/* Add ward options based on selected constituency */}
      </select>
    </div>
  );
};

export default LocationPicker;
