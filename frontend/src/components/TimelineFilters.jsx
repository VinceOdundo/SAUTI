const TimelineFilters = ({ filters, onChange }) => {
  return (
    <div className="flex gap-4 mb-4">
      <select
        value={filters.sort}
        onChange={(e) => onChange({ ...filters, sort: e.target.value })}
        className="bg-dark-600 text-white rounded-lg p-2"
      >
        <option value="recent">Most Recent</option>
        <option value="popular">Most Popular</option>
      </select>

      <select
        value={filters.timeRange}
        onChange={(e) => onChange({ ...filters, timeRange: e.target.value })}
        className="bg-dark-600 text-white rounded-lg p-2"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
    </div>
  );
};

export default TimelineFilters;
