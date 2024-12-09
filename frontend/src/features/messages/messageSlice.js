import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [],
  currentConversation: {
    user: null,
    messages: [],
    loading: false,
    error: null,
    hasMore: true,
  },
  unreadCount: 0,
  loading: false,
  error: null,
  success: false,
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    messageStart: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    messageSuccess: (state) => {
      state.loading = false;
      state.error = null;
      state.success = true;
    },
    messageFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action) => {
      const exists = state.conversations.some(
        (conv) => conv.user._id === action.payload.user._id
      );
      if (!exists) {
        state.conversations.unshift(action.payload);
      }
    },
    updateConversation: (state, action) => {
      const { userId, updates } = action.payload;
      const conversation = state.conversations.find(
        (conv) => conv.user._id === userId
      );
      if (conversation) {
        Object.assign(conversation, updates);
      }
    },
    removeConversation: (state, action) => {
      state.conversations = state.conversations.filter(
        (conv) => conv.user._id !== action.payload
      );
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = {
        ...state.currentConversation,
        user: action.payload,
        messages: [],
        loading: false,
        error: null,
        hasMore: true,
      };
    },
    setCurrentConversationMessages: (state, action) => {
      state.currentConversation.messages = action.payload;
    },
    addMessage: (state, action) => {
      const { message } = action.payload;

      // Add to current conversation if it matches
      if (
        state.currentConversation.user &&
        (message.sender._id === state.currentConversation.user._id ||
          message.recipient._id === state.currentConversation.user._id)
      ) {
        state.currentConversation.messages.unshift(message);
      }

      // Update conversations list
      const otherUserId =
        message.sender._id === state.currentConversation.user?._id
          ? message.recipient._id
          : message.sender._id;

      const conversationIndex = state.conversations.findIndex(
        (conv) => conv.user._id === otherUserId
      );

      if (conversationIndex !== -1) {
        // Update existing conversation
        state.conversations[conversationIndex].lastMessage = message;
        if (message.recipient._id === state.currentConversation.user?._id) {
          state.conversations[conversationIndex].unreadCount += 1;
        }
      } else {
        // Add new conversation
        state.conversations.unshift({
          user:
            message.sender._id === state.currentConversation.user?._id
              ? message.recipient
              : message.sender,
          lastMessage: message,
          unreadCount:
            message.recipient._id === state.currentConversation.user?._id
              ? 1
              : 0,
        });
      }
    },
    updateMessage: (state, action) => {
      const { messageId, updates } = action.payload;

      // Update in current conversation
      const messageIndex = state.currentConversation.messages.findIndex(
        (msg) => msg._id === messageId
      );
      if (messageIndex !== -1) {
        state.currentConversation.messages[messageIndex] = {
          ...state.currentConversation.messages[messageIndex],
          ...updates,
        };
      }

      // Update in conversations list if it's the last message
      const conversationIndex = state.conversations.findIndex(
        (conv) => conv.lastMessage._id === messageId
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = {
          ...state.conversations[conversationIndex].lastMessage,
          ...updates,
        };
      }
    },
    removeMessage: (state, action) => {
      const messageId = action.payload;

      // Remove from current conversation
      state.currentConversation.messages =
        state.currentConversation.messages.filter(
          (msg) => msg._id !== messageId
        );

      // Update conversations list if it's the last message
      const conversationIndex = state.conversations.findIndex(
        (conv) => conv.lastMessage._id === messageId
      );
      if (conversationIndex !== -1) {
        const conversation = state.conversations[conversationIndex];
        if (conversation.messages?.length > 0) {
          conversation.lastMessage = conversation.messages[0];
        } else {
          state.conversations.splice(conversationIndex, 1);
        }
      }
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    markConversationAsRead: (state, action) => {
      const userId = action.payload;
      const conversation = state.conversations.find(
        (conv) => conv.user._id === userId
      );
      if (conversation) {
        conversation.unreadCount = 0;
      }
      state.unreadCount = state.conversations.reduce(
        (total, conv) => total + conv.unreadCount,
        0
      );
    },
    clearMessageState: (state) => {
      return initialState;
    },
  },
});

export const {
  messageStart,
  messageSuccess,
  messageFail,
  setConversations,
  addConversation,
  updateConversation,
  removeConversation,
  setCurrentConversation,
  setCurrentConversationMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setUnreadCount,
  markConversationAsRead,
  clearMessageState,
} = messageSlice.actions;

export default messageSlice.reducer;
