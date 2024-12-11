import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  PeopleOutline,
  ReportProblemOutline,
  BarChartOutline,
  Settings,
} from "@mui/icons-material";
import { fetchAnalytics } from "../store/slices/adminSlice";

const StatCard = ({ title, value, icon, loading, error, action }) => (
  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      {loading ? (
        <CircularProgress size={24} />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      )}
    </CardContent>
    {action && (
      <CardActions>
        <Button size="small" component={RouterLink} to={action.to}>
          {action.label}
        </Button>
      </CardActions>
    )}
  </Card>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAdmin } = useSelector((state) => state.auth.user || {});
  const {
    data: analytics,
    loading,
    error,
  } = useSelector((state) => state.admin.analytics);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    dispatch(fetchAnalytics({ period: "7d" }));
  }, [dispatch, isAdmin, navigate]);

  const dashboardItems = [
    {
      title: "User Management",
      icon: <PeopleOutline fontSize="large" />,
      value: analytics?.totalUsers || 0,
      action: { label: "Manage Users", to: "/admin/users" },
    },
    {
      title: "Content Moderation",
      icon: <ReportProblemOutline fontSize="large" />,
      value: analytics?.pendingModeration || 0,
      action: { label: "View Queue", to: "/admin/moderation" },
    },
    {
      title: "Analytics",
      icon: <BarChartOutline fontSize="large" />,
      value: analytics?.totalInteractions || 0,
      action: { label: "View Details", to: "/admin/analytics" },
    },
    {
      title: "Settings",
      icon: <Settings fontSize="large" />,
      value: "System",
      action: { label: "Configure", to: "/admin/settings" },
    },
  ];

  if (!isAdmin) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography color="text.secondary">
          Welcome to the Sauti administration panel. Monitor and manage your
          platform from here.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {dashboardItems.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <StatCard
              title={item.title}
              value={item.value}
              icon={item.icon}
              loading={loading}
              error={error}
              action={item.action}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              component={RouterLink}
              to="/admin/users"
              startIcon={<PeopleOutline />}
            >
              Manage Users
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              component={RouterLink}
              to="/admin/moderation"
              startIcon={<ReportProblemOutline />}
            >
              Review Content
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              component={RouterLink}
              to="/admin/analytics"
              startIcon={<BarChartOutline />}
            >
              View Analytics
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
