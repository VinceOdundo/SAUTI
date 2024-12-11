import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Button,
  Paper,
  Divider,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { fetchActivityStream, setFilters } from "../store/slices/activitySlice";
import { ACTIVITY_TYPES } from "../hooks/useActivity";

const ActivityIcon = ({ type }) => {
  // You can customize icons based on activity type
  return <Avatar>{type[0].toUpperCase()}</Avatar>;
};

const ActivityContent = ({ activity }) => {
  const renderContent = () => {
    switch (activity.type) {
      case ACTIVITY_TYPES.POST_CREATE:
        return `Created a new post: "${activity.details.title}"`;
      case ACTIVITY_TYPES.POST_LIKE:
        return "Liked a post";
      case ACTIVITY_TYPES.POST_COMMENT:
        return "Commented on a post";
      case ACTIVITY_TYPES.MESSAGE_SEND:
        return "Sent a message";
      case ACTIVITY_TYPES.PROFILE_UPDATE:
        return "Updated their profile";
      case ACTIVITY_TYPES.SEARCH_QUERY:
        return "Performed a search";
      case ACTIVITY_TYPES.CONTENT_SHARE:
        return `Shared content on ${activity.details.platform}`;
      case ACTIVITY_TYPES.REPORT_SUBMIT:
        return "Submitted a report";
      default:
        return "Performed an action";
    }
  };

  return (
    <Box>
      <Typography variant="body1">{renderContent()}</Typography>
      <Typography variant="caption" color="text.secondary">
        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
      </Typography>
    </Box>
  );
};

const ActivityStream = ({ userId, limit = 10 }) => {
  const dispatch = useDispatch();
  const { data, loading, error, total } = useSelector(
    (state) => state.activity.activityStream
  );
  const filters = useSelector((state) => state.activity.filters);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadActivities();
  }, [dispatch, userId, page, filters]);

  const loadActivities = () => {
    dispatch(
      fetchActivityStream({
        userId,
        page,
        limit,
        filters,
      })
    );
  };

  const handleFilterChange = (event) => {
    dispatch(setFilters({ type: event.target.value }));
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleRefresh = () => {
    setPage(1);
    loadActivities();
  };

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" component="h2">
          Activity Stream
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            select
            size="small"
            value={filters.type}
            onChange={handleFilterChange}
            sx={{ minWidth: 150 }}
            InputProps={{
              startAdornment: <FilterIcon color="action" sx={{ mr: 1 }} />,
            }}
          >
            <MenuItem value="all">All Activities</MenuItem>
            {Object.entries(ACTIVITY_TYPES).map(([key, value]) => (
              <MenuItem key={key} value={value}>
                {key.split("_").join(" ").toLowerCase()}
              </MenuItem>
            ))}
          </TextField>
          <IconButton onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {loading && page === 1 ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <List>
            {data.map((activity) => (
              <ListItem
                key={activity.id}
                alignItems="flex-start"
                sx={{
                  "&:not(:last-child)": {
                    borderBottom: 1,
                    borderColor: "divider",
                  },
                }}
              >
                <ListItemAvatar>
                  <ActivityIcon type={activity.type} />
                </ListItemAvatar>
                <ListItemText
                  primary={<ActivityContent activity={activity} />}
                  secondary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      <TimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(activity.timestamp).toLocaleString()}
                      </Typography>
                      <Chip
                        label={activity.type.split("_").join(" ").toLowerCase()}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>

          {data.length < total && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="outlined"
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Load More Activities"
                )}
              </Button>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default ActivityStream;
