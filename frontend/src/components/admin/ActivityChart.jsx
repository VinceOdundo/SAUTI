import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ActivityChart = () => {
  const [timeRange, setTimeRange] = useState("week");

  // Mock data - replace with real API data
  const data = {
    week: [
      { date: "Mon", users: 120, posts: 45, messages: 350 },
      { date: "Tue", users: 132, posts: 52, messages: 410 },
      { date: "Wed", users: 145, posts: 58, messages: 460 },
      { date: "Thu", users: 150, posts: 48, messages: 420 },
      { date: "Fri", users: 165, posts: 55, messages: 480 },
      { date: "Sat", users: 142, posts: 42, messages: 390 },
      { date: "Sun", users: 130, posts: 38, messages: 360 },
    ],
    month: [
      { date: "Week 1", users: 850, posts: 320, messages: 2400 },
      { date: "Week 2", users: 920, posts: 350, messages: 2600 },
      { date: "Week 3", users: 980, posts: 380, messages: 2800 },
      { date: "Week 4", users: 1050, posts: 420, messages: 3100 },
    ],
    year: [
      { date: "Jan", users: 3200, posts: 1200, messages: 9500 },
      { date: "Feb", users: 3400, posts: 1300, messages: 10200 },
      { date: "Mar", users: 3600, posts: 1400, messages: 11000 },
      { date: "Apr", users: 3800, posts: 1500, messages: 11800 },
      { date: "May", users: 4100, posts: 1600, messages: 12500 },
      { date: "Jun", users: 4300, posts: 1700, messages: 13200 },
      { date: "Jul", users: 4600, posts: 1800, messages: 14000 },
      { date: "Aug", users: 4800, posts: 1900, messages: 14800 },
      { date: "Sep", users: 5100, posts: 2000, messages: 15500 },
      { date: "Oct", users: 5300, posts: 2100, messages: 16200 },
      { date: "Nov", users: 5600, posts: 2200, messages: 17000 },
      { date: "Dec", users: 5800, posts: 2300, messages: 17800 },
    ],
  };

  const timeRangeOptions = [
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "Last Month" },
    { value: "year", label: "Last Year" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900">Activity Trends</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
            <span className="text-sm text-gray-500">Users</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <span className="text-sm text-gray-500">Posts</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2" />
            <span className="text-sm text-gray-500">Messages</span>
          </div>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data[timeRange]}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                value >= 1000 ? `${value / 1000}k` : value
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "none",
                borderRadius: "0.5rem",
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              }}
              formatter={(value) => value.toLocaleString()}
            />
            <Legend display={false} />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="posts"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="messages"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityChart;
