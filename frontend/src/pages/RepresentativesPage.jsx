import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import debounce from "lodash/debounce";

const RepresentativesPage = () => {
  const [representatives, setRepresentatives] = useState([]);
  const [filters, setFilters] = useState({
    county: "",
    constituency: "",
    ward: "",
    position: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Memoize filter options
  const positions = useMemo(() => ["MP", "Senator", "Governor", "MCA"], []);

  // Debounced fetch function
  const debouncedFetch = useCallback(
    debounce(async (filterParams) => {
      try {
        setLoading(true);
        const params = Object.fromEntries(
          Object.entries(filterParams).filter(([_, v]) => v)
        );
        const response = await axios.get("/api/representatives", {
          params,
          headers: { "Cache-Control": "max-age=300" }, // 5 minute cache
        });
        setRepresentatives(response.data.representatives);
        setError(null);
      } catch (error) {
        setError(
          error.response?.data?.message || "Error fetching representatives"
        );
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    debouncedFetch(filters);
    return () => debouncedFetch.cancel();
  }, [filters, debouncedFetch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Representatives</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <select
          value={filters.position}
          onChange={(e) => setFilters({ ...filters, position: e.target.value })}
          className="bg-dark-600 text-white rounded-lg p-2"
        >
          <option value="">All Positions</option>
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="County"
          value={filters.county}
          onChange={(e) => setFilters({ ...filters, county: e.target.value })}
          className="bg-dark-600 text-white rounded-lg p-2"
        />
        <input
          type="text"
          placeholder="Constituency"
          value={filters.constituency}
          onChange={(e) =>
            setFilters({ ...filters, constituency: e.target.value })
          }
          className="bg-dark-600 text-white rounded-lg p-2"
        />
        <input
          type="text"
          placeholder="Ward"
          value={filters.ward}
          onChange={(e) => setFilters({ ...filters, ward: e.target.value })}
          className="bg-dark-600 text-white rounded-lg p-2"
        />
      </div>

      {/* Representatives Grid */}
      {loading ? (
        <div className="text-center text-white">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {representatives.map((rep) => (
            <div key={rep._id} className="bg-dark-700 rounded-lg p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <img
                  src={rep.user.avatar}
                  alt={rep.user.name}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {rep.user.name}
                    {rep.verified && (
                      <span className="ml-2 text-primary-500">✓</span>
                    )}
                  </h3>
                  <p className="text-gray-400">{rep.position}</p>
                </div>
              </div>
              <div className="space-y-2 text-gray-300">
                <p>Party: {rep.party}</p>
                <p>County: {rep.county}</p>
                {rep.constituency && <p>Constituency: {rep.constituency}</p>}
                {rep.ward && <p>Ward: {rep.ward}</p>}
              </div>
              <div className="mt-4 flex space-x-4">
                {rep.officeContact.email && (
                  <a
                    href={`mailto:${rep.officeContact.email}`}
                    className="text-primary-500 hover:text-primary-400"
                  >
                    Email
                  </a>
                )}
                {rep.socialMedia.twitter && (
                  <a
                    href={rep.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:text-primary-400"
                  >
                    Twitter
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepresentativesPage;
