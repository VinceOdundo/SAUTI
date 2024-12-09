import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  messageStart,
  messageSuccess,
  messageFail,
  setConversations,
  setCurrentConversation,
  setCurrentConversationMessages,
  markConversationAsRead,
} from "../features/messages/messageSlice";
import {
  getConversationsList,
  getConversation,
  markAsRead,
} from "../features/messages/messageAPI";
import ConversationsList from "../components/messages/ConversationsList";
import ChatWindow from "../components/messages/ChatWindow";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";

const MessagesPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { conversations, currentConversation, loading, error } = useSelector(
    (state) => state.messages
  );
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchConversation(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchConversations = async () => {
    try {
      dispatch(messageStart());
      const { conversations } = await getConversationsList();
      dispatch(setConversations(conversations));
      dispatch(messageSuccess());

      // Select first conversation if none selected
      if (!selectedUserId && conversations.length > 0) {
        setSelectedUserId(conversations[0].user._id);
      }
    } catch (error) {
      dispatch(
        messageFail(
          error.response?.data?.message || "Error fetching conversations"
        )
      );
    }
  };

  const fetchConversation = async (userId) => {
    try {
      dispatch(messageStart());

      // Set current conversation user immediately for better UX
      const conversation = conversations.find(
        (conv) => conv.user._id === userId
      );
      if (conversation) {
        dispatch(setCurrentConversation(conversation.user));
      }

      const { messages } = await getConversation(userId);
      dispatch(setCurrentConversationMessages(messages));
      dispatch(messageSuccess());

      // Mark messages as read
      const unreadMessages = messages.filter(
        (msg) =>
          msg.recipient._id === user._id &&
          ["sent", "delivered"].includes(msg.status)
      );

      if (unreadMessages.length > 0) {
        await Promise.all(unreadMessages.map((msg) => markAsRead(msg._id)));
        dispatch(markConversationAsRead(userId));
      }
    } catch (error) {
      dispatch(
        messageFail(
          error.response?.data?.message || "Error fetching conversation"
        )
      );
    }
  };

  const handleConversationSelect = (userId) => {
    setSelectedUserId(userId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">
            Please log in to access messages
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-12 divide-x divide-gray-200 h-[calc(100vh-8rem)]">
            {/* Conversations List */}
            <div className="col-span-4 flex flex-col">
              <div className="p-4 border-b">
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              </div>
              {loading && !currentConversation.user ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : error && !currentConversation.user ? (
                <div className="p-4">
                  <ErrorAlert message={error} />
                </div>
              ) : (
                <ConversationsList
                  conversations={conversations}
                  selectedUserId={selectedUserId}
                  onSelect={handleConversationSelect}
                />
              )}
            </div>

            {/* Chat Window */}
            <div className="col-span-8 flex flex-col">
              {selectedUserId ? (
                <ChatWindow
                  conversation={currentConversation}
                  onMessageSent={() => fetchConversations()}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a conversation to start messaging
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
