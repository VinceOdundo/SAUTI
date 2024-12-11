import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import {
  fetchContentModeration,
  moderateContent,
} from "../../store/slices/adminSlice";

const ContentModeration = () => {
  const dispatch = useDispatch();
  const { items, total, loading, error } = useSelector(
    (state) => state.admin.moderation
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedContent, setSelectedContent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [moderationReason, setModerationReason] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");

  useEffect(() => {
    dispatch(
      fetchContentModeration({
        page: page + 1,
        limit: rowsPerPage,
        type: contentTypeFilter,
      })
    );
  }, [dispatch, page, rowsPerPage, contentTypeFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleContentTypeChange = (event) => {
    setContentTypeFilter(event.target.value);
    setPage(0);
  };

  const handleViewContent = (content) => {
    setSelectedContent(content);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedContent(null);
    setOpenDialog(false);
    setModerationReason("");
  };

  const handleModerateContent = async (contentId, action) => {
    await dispatch(
      moderateContent({
        contentId,
        action,
        reason: moderationReason,
      })
    );
    handleCloseDialog();
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case "post":
        return "primary";
      case "comment":
        return "secondary";
      case "message":
        return "info";
      default:
        return "default";
    }
  };

  const getReportSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Content Moderation
        </Typography>
        <Typography color="text.secondary">
          Review and moderate reported content.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Reports
              </Typography>
              <Typography variant="h3">{total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                High Priority
              </Typography>
              <Typography variant="h3" color="error">
                {items.filter((item) => item.severity === "high").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Response Time
              </Typography>
              <Typography variant="h3">2.4h</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 4, p: 2 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            select
            label="Content Type"
            value={contentTypeFilter}
            onChange={handleContentTypeChange}
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Content</MenuItem>
            <MenuItem value="post">Posts</MenuItem>
            <MenuItem value="comment">Comments</MenuItem>
            <MenuItem value="message">Messages</MenuItem>
          </TextField>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Content</TableCell>
                <TableCell>Reporter</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Reported At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Chip
                      label={item.type}
                      color={getContentTypeColor(item.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {item.content.substring(0, 100)}
                    {item.content.length > 100 ? "..." : ""}
                  </TableCell>
                  <TableCell>{item.reporter.name}</TableCell>
                  <TableCell>{item.reason}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.severity}
                      color={getReportSeverityColor(item.severity)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewContent(item)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Review Content</DialogTitle>
        <DialogContent>
          {selectedContent && (
            <Box sx={{ pt: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Reported Content:
              </Typography>
              <Paper sx={{ p: 2, mb: 3, bgcolor: "grey.100" }}>
                <Typography>{selectedContent.content}</Typography>
              </Paper>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Report Details:
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography>
                  <strong>Reporter:</strong> {selectedContent.reporter.name}
                </Typography>
                <Typography>
                  <strong>Reason:</strong> {selectedContent.reason}
                </Typography>
                <Typography>
                  <strong>Severity:</strong>{" "}
                  <Chip
                    label={selectedContent.severity}
                    color={getReportSeverityColor(selectedContent.severity)}
                    size="small"
                  />
                </Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Moderation Reason"
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            startIcon={<ApproveIcon />}
            onClick={() =>
              handleModerateContent(selectedContent?.id, "approve")
            }
            color="success"
            variant="contained"
          >
            Approve
          </Button>
          <Button
            startIcon={<RejectIcon />}
            onClick={() => handleModerateContent(selectedContent?.id, "reject")}
            color="error"
            variant="contained"
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContentModeration;
