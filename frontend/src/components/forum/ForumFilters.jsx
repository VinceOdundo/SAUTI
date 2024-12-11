import React from "react";
import {
  FilterIcon,
  LocationMarkerIcon,
  TagIcon,
  ViewListIcon,
  GlobeIcon,
} from "@heroicons/react/outline";

const categories = [
  "general",
  "policy",
  "development",
  "education",
  "health",
  "environment",
  "governance",
  "other",
];

const sortOptions = [
  { value: "recent", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
  { value: "trending", label: "Trending" },
  { value: "commented", label: "Most Commented" },
];

const visibilityOptions = [
  { value: "public", label: "All Posts", icon: GlobeIcon },
  { value: "county", label: "County Only", icon: LocationMarkerIcon },
  { value: "constituency", label: "Constituency", icon: LocationMarkerIcon },
  { value: "ward", label: "Ward", icon: LocationMarkerIcon },
];

const ForumFilters = ({ filters, onFilterChange }) => {
  const handleCategoryChange = (category) => {
    onFilterChange({
      ...filters,
      category: filters.category === category ? null : category,
    });
  };

  const handleSortChange = (e) => {
    onFilterChange({
      ...filters,
      sort: e.target.value,
    });
  };

  const handleVisibilityChange = (visibility) => {
    onFilterChange({
      ...filters,
      visibility,
    });
  };

  const handleTagAdd = (tag) => {
    if (!filters.tags.includes(tag)) {
      onFilterChange({
        ...filters,
        tags: [...filters.tags, tag],
      });
    }
  };

  const handleTagRemove = (tag) => {
    onFilterChange({
      ...filters,
      tags: filters.tags.filter((t) => t !== tag),
    });
  };

  return (
    <div className="bg-bg-primary rounded-lg shadow p-6 space-y-6">
      {/* Sort */}
      <div>
        <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center">
          <ViewListIcon className="w-5 h-5 mr-2" />
          Sort By
        </h3>
        <select
          value={filters.sort}
          onChange={handleSortChange}
          className="w-full rounded-md border-border py-2 px-3 text-sm text-text-primary bg-bg-primary focus:border-accent-primary focus:ring-accent-primary"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center">
          <FilterIcon className="w-5 h-5 mr-2" />
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                filters.category === category
                  ? "bg-info-bg text-accent-primary"
                  : "text-text-secondary hover:bg-hover-bg"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Visibility */}
      <div>
        <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center">
          <LocationMarkerIcon className="w-5 h-5 mr-2" />
          Location Filter
        </h3>
        <div className="space-y-2">
          {visibilityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleVisibilityChange(option.value)}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                filters.visibility === option.value
                  ? "bg-info-bg text-accent-primary"
                  : "text-text-secondary hover:bg-hover-bg"
              }`}
            >
              <option.icon className="w-5 h-5 mr-2" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center">
          <TagIcon className="w-5 h-5 mr-2" />
          Tags
        </h3>
        <div className="flex flex-wrap gap-2">
          {filters.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-info-bg text-accent-primary"
            >
              {tag}
              <button
                onClick={() => handleTagRemove(tag)}
                className="ml-2 text-accent-secondary hover:text-accent-primary"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add tag..."
            className="w-full mt-2 px-3 py-2 border border-border rounded-md text-sm text-text-primary bg-bg-primary focus:border-accent-primary focus:ring-accent-primary"
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.target.value.trim()) {
                handleTagAdd(e.target.value.trim().toLowerCase());
                e.target.value = "";
              }
            }}
          />
        </div>
      </div>

      {/* Reset Filters */}
      <button
        onClick={() =>
          onFilterChange({
            category: null,
            tags: [],
            visibility: "public",
            sort: "recent",
          })
        }
        className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default ForumFilters;
