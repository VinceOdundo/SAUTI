import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Async thunks
export const fetchConversations = createAsyncThunk(
  "messages/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/messages/conversations`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch conversations"
      );
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/messages/conversations/${conversationId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  }
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ conversationId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/messages/conversations/${conversationId}`,
        {
          content,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }
);

export const startConversation = createAsyncThunk(
  "messages/startConversation",
  async ({ recipientId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/messages/conversations`, {
        recipientId,
        content,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to start conversation"
      );
    }
  }
);

export const markConversationAsRead = createAsyncThunk(
  "messages/markConversationAsRead",
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/messages/conversations/${conversationId}/read`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark conversation as read"
      );
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (state.currentConversation?.id === conversationId) {
        state.messages.push(message);
      }
      // Update conversation preview
      const conversation = state.conversations.find(
        (conv) => conv.id === conversationId
      );
      if (conversation) {
        conversation.lastMessage = message;
        conversation.unreadCount += 1;
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.conversations;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConversation = action.payload.conversation;
        state.messages = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload.message);
        // Update conversation preview
        const conversation = state.conversations.find(
          (conv) => conv.id === action.payload.message.conversationId
        );
        if (conversation) {
          conversation.lastMessage = action.payload.message;
        }
      })
      // Start Conversation
      .addCase(startConversation.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload.conversation);
        state.currentConversation = action.payload.conversation;
        state.messages = [action.payload.message];
      })
      // Mark Conversation as Read
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const conversation = state.conversations.find(
          (conv) => conv.id === action.payload.conversationId
        );
        if (conversation) {
          const oldUnreadCount = conversation.unreadCount;
          conversation.unreadCount = 0;
          state.unreadCount = Math.max(0, state.unreadCount - oldUnreadCount);
        }
      });
  },
});

export const {
  clearError,
  clearCurrentConversation,
  updateUnreadCount,
  addMessage,
} = messageSlice.actions;

export default messageSlice.reducer;
