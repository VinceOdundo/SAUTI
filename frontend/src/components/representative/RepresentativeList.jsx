import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRepresentatives } from "../../features/representative/representativeAPI";
import LoadingSpinner from "../common/LoadingSpinner";

const RepresentativeList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [representatives, setRepresentatives] = useState([]);
  const [filteredRepresentatives, setFilteredRepresentatives] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    location: {
      county: "",
      constituency: "",
      ward: "",
    },
    organization: "",
    focusArea: "",
  });

  useEffect(() => {
    const fetchRepresentatives = async () => {
      try {
        const response = await getRepresentatives();
        setRepresentatives(response.representatives);
        setFilteredRepresentatives(response.representatives);
      } catch (err) {
        setError(err.message || "Failed to fetch representatives");
      } finally {
        setLoading(false);
      }
    };

    fetchRepresentatives();
  }, []);

  useEffect(() => {
    const filterResults = () => {
      let results = [...representatives];

      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(
          (rep) =>
            rep.user.name.toLowerCase().includes(query) ||
            rep.organization.name.toLowerCase().includes(query) ||
            rep.title.toLowerCase().includes(query)
        );
      }

      // Apply location filters
      if (filters.location.county) {
        results = results.filter(
          (rep) => rep.location.county === filters.location.county
        );
      }
      if (filters.location.constituency) {
        results = results.filter(
          (rep) => rep.location.constituency === filters.location.constituency
        );
      }
      if (filters.location.ward) {
        results = results.filter(
          (rep) => rep.location.ward === filters.location.ward
        );
      }

      // Apply organization filter
      if (filters.organization) {
        results = results.filter(
          (rep) => rep.organization._id === filters.organization
        );
      }

      // Apply focus area filter
      if (filters.focusArea) {
        results = results.filter((rep) =>
          rep.focusAreas.includes(filters.focusArea)
        );
      }

      setFilteredRepresentatives(results);
    };

    filterResults();
  }, [searchQuery, filters, representatives]);

  const handleFilterChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFilters((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFilters((prev) => ({ ...prev, [field]: value }));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="col-span-full">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700"
            >
              Search Representatives
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, organization, or title"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          {/* Location Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              County
            </label>
            <select
              value={filters.location.county}
              onChange={(e) =>
                handleFilterChange("location.county", e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All Counties</option>
              {/* Add county options */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Constituency
            </label>
            <select
              value={filters.location.constituency}
              onChange={(e) =>
                handleFilterChange("location.constituency", e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All Constituencies</option>
              {/* Add constituency options */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Focus Area
            </label>
            <select
              value={filters.focusArea}
              onChange={(e) => handleFilterChange("focusArea", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All Focus Areas</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Environment">Environment</option>
              <option value="Human Rights">Human Rights</option>
              <option value="Economic Empowerment">Economic Empowerment</option>
              <option value="Youth Development">Youth Development</option>
              <option value="Women Empowerment">Women Empowerment</option>
              <option value="Agriculture">Agriculture</option>
              <option value="Technology">Technology</option>
            </select>
          </div>
        </div>
      </div>

      {/* Representatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRepresentatives.map((representative) => (
          <Link
            key={representative._id}
            to={`/representatives/${representative._id}`}
            className="block"
          >
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                {representative.user.avatar && (
                  <img
                    src={representative.user.avatar}
                    alt={representative.user.name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {representative.user.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {representative.title}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  {representative.organization.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {representative.location.ward},{" "}
                  {representative.location.constituency}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {representative.focusAreas.slice(0, 3).map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {area}
                  </span>
                ))}
                {representative.focusAreas.length > 3 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{representative.focusAreas.length - 3} more
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center text-sm text-gray-500">
                <span>{representative.stats.postsCount} posts</span>
                <span className="mx-2">•</span>
                <span>{representative.stats.followersCount} followers</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredRepresentatives.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">
            No representatives found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default RepresentativeList;
