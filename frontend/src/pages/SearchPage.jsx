import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  searchAll,
  setQuery,
  setFilters,
  setPage,
  clearResults,
} from "../store/slices/searchSlice";
import Navigation from "../components/Navigation";
import {
  SearchIcon,
  FilterIcon,
  UserIcon,
  OfficeBuildingIcon,
  ChatAltIcon,
  ClockIcon,
  TrendingUpIcon,
  XIcon,
} from "@heroicons/react/outline";

const filterOptions = {
  type: [
    { value: "all", label: "All" },
    { value: "posts", label: "Posts" },
    { value: "users", label: "Users" },
    { value: "organizations", label: "Organizations" },
  ],
  sortBy: [
    { value: "relevance", label: "Most Relevant" },
    { value: "date", label: "Most Recent" },
    { value: "popularity", label: "Most Popular" },
  ],
  timeRange: [
    { value: "all", label: "All Time" },
    { value: "day", label: "Last 24 Hours" },
    { value: "week", label: "Last Week" },
    { value: "month", label: "Last Month" },
    { value: "year", label: "Last Year" },
  ],
};

export default function SearchPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryParam = searchParams.get("q") || "";

  const {
    query,
    results,
    filters,
    pagination,
    loading,
    error,
    recentSearches,
    popularSearches,
  } = useSelector((state) => state.search);

  useEffect(() => {
    if (queryParam && queryParam !== query) {
      dispatch(setQuery(queryParam));
      dispatch(searchAll({ query: queryParam, filters }));
    }
  }, [dispatch, queryParam, query, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    if (query) {
      dispatch(searchAll({ query, filters: { ...filters, [key]: value } }));
    }
  };

  const handlePageChange = (page) => {
    dispatch(setPage(page));
    if (query) {
      dispatch(
        searchAll({
          query,
          filters: { ...filters, page },
        })
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => dispatch(setQuery(e.target.value))}
                placeholder="Search posts, users, and organizations..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
              <SearchIcon className="h-6 w-6 text-gray-400 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          {Object.entries(filterOptions).map(([key, options]) => (
            <div key={key} className="relative">
              <select
                value={filters[key]}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FilterIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          ))}
        </div>

        {/* Search Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        ) : query ? (
          <div className="space-y-8">
            {/* Posts */}
            {results.posts.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Posts</h2>
                <div className="space-y-4">
                  {results.posts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/forum/posts/${post.id}`}
                      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                            {post.category}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2">
                          {post.content}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Users */}
            {results.users.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Users</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.users.map((user) => (
                    <Link
                      key={user.id}
                      to={`/profile/${user.id}`}
                      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-center space-x-4">
                          <img
                            src={user.avatar || "/assets/default-avatar.png"}
                            alt={user.name}
                            className="h-12 w-12 rounded-full"
                          />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {user.name}
                            </h3>
                            <p className="text-sm text-gray-500">{user.role}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Organizations */}
            {results.organizations.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Organizations
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.organizations.map((org) => (
                    <Link
                      key={org.id}
                      to={`/organizations/${org.id}`}
                      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-center space-x-4">
                          <img
                            src={org.logo || "/assets/default-org-logo.png"}
                            alt={org.name}
                            className="h-12 w-12 rounded-lg"
                          />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {org.name}
                            </h3>
                            <p className="text-sm text-gray-500">{org.type}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!results.posts.length &&
              !results.users.length &&
              !results.organizations.length && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No results found for "{query}"
                  </p>
                </div>
              )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`${
                        pagination.currentPage === i + 1
                          ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Recent Searches
                </h2>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() =>
                        navigate(`/search?q=${encodeURIComponent(search)}`)
                      }
                      className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-sm text-gray-700"
                    >
                      {search}
                      <XIcon className="h-4 w-4 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <TrendingUpIcon className="h-5 w-5 text-gray-400 mr-2" />
                  Trending Searches
                </h2>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() =>
                        navigate(`/search?q=${encodeURIComponent(search)}`)
                      }
                      className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 hover:bg-primary-100 text-sm text-primary-700"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
