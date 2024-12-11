import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp,
  TrendingDown,
  FilterList,
} from "@mui/icons-material";
import {
  fetchAnalyticsOverview,
  fetchUserEngagement,
  fetchContentMetrics,
  generateReport,
  setFilters,
} from "../../store/slices/analyticsSlice";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const StatCard = ({ title, value, trend, loading, error }) => (
  <Card>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {title}
      </Typography>
      {loading ? (
        <CircularProgress size={24} />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {trend && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                ml: 1,
                color: trend > 0 ? "success.main" : "error.main",
              }}
            >
              {trend > 0 ? <TrendingUp /> : <TrendingDown />}
              <Typography variant="body2">{Math.abs(trend)}%</Typography>
            </Box>
          )}
        </Box>
      )}
    </CardContent>
  </Card>
);

const AnalyticsDashboard = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const { overview, userEngagement, contentMetrics, reports, filters } =
    useSelector((state) => state.analytics);

  useEffect(() => {
    const fetchData = () => {
      dispatch(fetchAnalyticsOverview({ period: filters.period }));
      dispatch(
        fetchUserEngagement({
          period: filters.period,
          type: filters.engagementType,
        })
      );
      dispatch(
        fetchContentMetrics({
          period: filters.period,
          contentType: filters.contentType,
        })
      );
    };
    fetchData();
  }, [dispatch, filters]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePeriodChange = (event) => {
    dispatch(setFilters({ period: event.target.value }));
  };

  const handleGenerateReport = async (type) => {
    await dispatch(generateReport({ type, period: filters.period, filters }));
    // Handle report download
  };

  const handleRefreshData = () => {
    dispatch(fetchAnalyticsOverview({ period: filters.period }));
    dispatch(fetchUserEngagement({ period: filters.period }));
    dispatch(fetchContentMetrics({ period: filters.period }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            select
            label="Time Period"
            value={filters.period}
            onChange={handlePeriodChange}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </TextField>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefreshData}
            variant="outlined"
          >
            Refresh
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            onClick={() => handleGenerateReport("overview")}
            variant="contained"
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={overview.data?.totalUsers || 0}
            trend={overview.data?.userGrowth}
            loading={overview.loading}
            error={overview.error}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={overview.data?.activeUsers || 0}
            trend={overview.data?.activeUserGrowth}
            loading={overview.loading}
            error={overview.error}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Posts"
            value={overview.data?.totalPosts || 0}
            trend={overview.data?.postGrowth}
            loading={overview.loading}
            error={overview.error}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Engagement Rate"
            value={`${overview.data?.engagementRate || 0}%`}
            trend={overview.data?.engagementGrowth}
            loading={overview.loading}
            error={overview.error}
          />
        </Grid>
      </Grid>

      {/* Tabs for different metrics */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="User Engagement" />
          <Tab label="Content Performance" />
          <Tab label="Demographics" />
        </Tabs>

        {/* User Engagement Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Activity Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={userEngagement.data?.timeline || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#8884d8"
                  name="Active Users"
                />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#82ca9d"
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Content Performance Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Content Engagement by Type
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={contentMetrics.data?.byType || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="views" fill="#8884d8" name="Views" />
                <Bar dataKey="likes" fill="#82ca9d" name="Likes" />
                <Bar dataKey="comments" fill="#ffc658" name="Comments" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Demographics Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Demographics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Age Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={overview.data?.demographics?.age || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {(overview.data?.demographics?.age || []).map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Location Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={overview.data?.demographics?.location || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {(overview.data?.demographics?.location || []).map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AnalyticsDashboard;
