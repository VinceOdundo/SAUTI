import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  startConversation,
  markConversationAsRead,
} from "../store/slices/messageSlice";
import { useAuth } from "../hooks/useAuth";
import Navigation from "../components/Navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  SearchIcon,
  PaperAirplaneIcon,
  DotsVerticalIcon,
} from "@heroicons/react/outline";

const messageValidationSchema = Yup.object().shape({
  content: Yup.string().required("Message cannot be empty"),
});

export default function MessagesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  const { conversations, currentConversation, messages, loading, error } =
    useSelector((state) => state.messages);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (currentConversation) {
      dispatch(markConversationAsRead(currentConversation.id));
    }
  }, [dispatch, currentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleConversationSelect = async (conversationId) => {
    await dispatch(fetchMessages(conversationId));
  };

  const handleSendMessage = async (values, { resetForm }) => {
    try {
      if (currentConversation) {
        await dispatch(
          sendMessage({
            conversationId: currentConversation.id,
            content: values.content,
          })
        ).unwrap();
      } else if (selectedRecipient) {
        await dispatch(
          startConversation({
            recipientId: selectedRecipient.id,
            content: values.content,
          })
        ).unwrap();
        setShowNewMessageModal(false);
        setSelectedRecipient(null);
      }
      resetForm();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    const otherParticipant =
      conversation.participants.find((p) => p.id !== user.id) || {};
    return (
      otherParticipant.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage?.content
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-12 h-[calc(100vh-12rem)]">
            {/* Conversation List */}
            <div className="col-span-4 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                  <button
                    onClick={() => setShowNewMessageModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    New Message
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  <SearchIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(100%-5rem)]">
                {filteredConversations.map((conversation) => {
                  const otherParticipant =
                    conversation.participants.find((p) => p.id !== user.id) ||
                    {};
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleConversationSelect(conversation.id)}
                      className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 focus:outline-none ${
                        currentConversation?.id === conversation.id
                          ? "bg-primary-50"
                          : ""
                      }`}
                    >
                      <img
                        src={
                          otherParticipant.avatar ||
                          "/assets/default-avatar.png"
                        }
                        alt={otherParticipant.name}
                        className="h-12 w-12 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {otherParticipant.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(conversation.lastMessage?.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage?.content}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-600 text-xs font-medium text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-8 flex flex-col">
              {currentConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          currentConversation.participants.find(
                            (p) => p.id !== user.id
                          )?.avatar || "/assets/default-avatar.png"
                        }
                        alt="Profile"
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {
                            currentConversation.participants.find(
                              (p) => p.id !== user.id
                            )?.name
                          }
                        </h3>
                        <p className="text-sm text-gray-500">
                          {currentConversation.participants.find(
                            (p) => p.id !== user.id
                          )?.role || "User"}
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <DotsVerticalIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === user.id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                              message.senderId === user.id
                                ? "bg-primary-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.senderId === user.id
                                  ? "text-primary-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatDate(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <Formik
                      initialValues={{ content: "" }}
                      validationSchema={messageValidationSchema}
                      onSubmit={handleSendMessage}
                    >
                      <Form className="flex items-center space-x-4">
                        <Field
                          name="content"
                          type="text"
                          placeholder="Type a message..."
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          type="submit"
                          className="inline-flex items-center p-2 border border-transparent rounded-full text-white bg-primary-600 hover:bg-primary-700"
                        >
                          <PaperAirplaneIcon className="h-5 w-5 transform rotate-90" />
                        </button>
                      </Form>
                    </Formik>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-500">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">New Message</h2>
            {/* Add recipient selection and message input here */}
          </div>
        </div>
      )}
    </div>
  );
}
