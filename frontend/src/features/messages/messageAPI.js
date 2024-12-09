import axios from "axios";
import { API_URL } from "../../config";

const API = axios.create({
  baseURL: `${API_URL}/messages`,
  withCredentials: true,
});

// Send a message
export const sendMessage = async (
  recipientId,
  content,
  attachments = null,
  replyToId = null
) => {
  const formData = new FormData();
  formData.append("recipientId", recipientId);
  formData.append("content", content);
  formData.append("clientMessageId", Date.now().toString());

  if (replyToId) {
    formData.append("replyToId", replyToId);
  }

  if (attachments) {
    if (attachments.images) {
      attachments.images.forEach((image) => {
        formData.append("images", image);
      });
    }
    if (attachments.documents) {
      attachments.documents.forEach((doc) => {
        formData.append("documents", doc);
      });
    }
  }

  const response = await API.post("/send", formData);
  return response.data;
};

// Get conversation with a user
export const getConversation = async (userId, page = 1, limit = 50) => {
  const response = await API.get(`/conversation/${userId}`, {
    params: { page, limit },
  });
  return response.data;
};

// Get list of conversations
export const getConversationsList = async () => {
  const response = await API.get("/conversations");
  return response.data;
};

// Mark message as read
export const markAsRead = async (messageId) => {
  const response = await API.post(`/read/${messageId}`);
  return response.data;
};

// Delete message
export const deleteMessage = async (messageId) => {
  const response = await API.delete(`/${messageId}`);
  return response.data;
};

// Get unread messages count
export const getUnreadCount = async () => {
  const response = await API.get("/unread/count");
  return response.data;
};
