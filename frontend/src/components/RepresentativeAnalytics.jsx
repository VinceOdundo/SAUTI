import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const RepresentativeAnalytics = ({ representativeId }) => {
  const [analytics, setAnalytics] = useState({
    feedbackByCategory: [],
    feedbackByMonth: [],
    responseRate: 0,
    averageResponseTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const processedAnalytics = useMemo(
    () => ({
      ...analytics,
      responseRate: Number(analytics.responseRate.toFixed(1)),
      averageResponseTime: Number(analytics.averageResponseTime.toFixed(1)),
      trendData: analytics.feedbackByMonth.map((month) => ({
        ...month,
        growth: calculateGrowthRate(month, analytics.feedbackByMonth),
      })),
    }),
    [analytics]
  );

  const fetchAnalytics = useCallback(async () => {
    const cacheKey = `analytics_${representativeId}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
      setAnalytics(JSON.parse(cachedData));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/representatives/${representativeId}/analytics`
      );
      setAnalytics(response.data);
      sessionStorage.setItem(cacheKey, JSON.stringify(response.data));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [representativeId]);

  useEffect(() => {
    fetchAnalytics();
  }, [representativeId]);

  if (isLoading)
    return <div className="text-center text-white">Loading analytics...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-8">
      {/* Response Rate Card */}
      <div className="bg-dark-700 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">
          Response Performance
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Response Rate</p>
            <p className="text-3xl text-primary-500">
              {processedAnalytics.responseRate}%
            </p>
          </div>
          <div>
            <p className="text-gray-400">Avg. Response Time</p>
            <p className="text-3xl text-primary-500">
              {processedAnalytics.averageResponseTime}h
            </p>
          </div>
        </div>
      </div>

      {/* Feedback by Category Chart */}
      <div className="bg-dark-700 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">
          Feedback by Category
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedAnalytics.feedbackByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="category" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                labelStyle={{ color: "#F9FAFB" }}
              />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Feedback Trend */}
      <div className="bg-dark-700 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">
          Monthly Feedback Trend
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedAnalytics.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                labelStyle={{ color: "#F9FAFB" }}
              />
              <Bar dataKey="growth" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RepresentativeAnalytics;
