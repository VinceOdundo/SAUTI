import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import {
  PaperAirplaneIcon,
  PhotographIcon,
  DocumentIcon,
  XIcon,
} from "@heroicons/react/outline";
import { sendMessage } from "../../features/messages/messageAPI";
import { addMessage } from "../../features/messages/messageSlice";
import { toast } from "react-toastify";

const ChatWindow = ({ conversation, onMessageSent }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState({
    images: [],
    documents: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedMessage = message.trim();
    if (!trimmedMessage && !hasAttachments()) {
      toast.error("Please enter a message or add attachments");
      return;
    }

    try {
      setIsSubmitting(true);
      const { message: newMessage } = await sendMessage(
        conversation.user._id,
        trimmedMessage,
        hasAttachments() ? attachments : null
      );

      dispatch(addMessage({ message: newMessage }));
      setMessage("");
      setAttachments({ images: [], documents: [] });
      onMessageSent();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending message");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = files.filter((file) => file.size <= maxSize);

    if (validFiles.length !== files.length) {
      toast.error("Some files were too large (max 5MB)");
    }

    setAttachments((prev) => ({
      ...prev,
      [type]: [...prev[type], ...validFiles],
    }));

    // Reset file input
    e.target.value = null;
  };

  const removeAttachment = (type, index) => {
    setAttachments((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const hasAttachments = () => {
    return attachments.images.length > 0 || attachments.documents.length > 0;
  };

  const renderMessage = (message) => {
    const isOwnMessage = message.sender._id === user._id;

    return (
      <div
        key={message._id}
        className={`flex ${
          isOwnMessage ? "justify-end" : "justify-start"
        } mb-4`}
      >
        <div
          className={`flex flex-col space-y-2 max-w-lg ${
            isOwnMessage ? "items-end" : "items-start"
          }`}
        >
          <div
            className={`flex items-end space-x-2 ${
              isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <img
              src={message.sender.avatar || "/default-avatar.png"}
              alt={message.sender.name}
              className="h-8 w-8 rounded-full"
            />
            <div
              className={`rounded-lg px-4 py-2 ${
                isOwnMessage
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
          </div>

          {/* Attachments */}
          {message.attachments?.length > 0 && (
            <div
              className={`flex flex-wrap gap-2 max-w-sm ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              {message.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className={`rounded-lg overflow-hidden ${
                    attachment.type === "image" ? "w-32 h-32" : "w-full"
                  }`}
                >
                  {attachment.type === "image" ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-gray-100 hover:bg-gray-200"
                    >
                      <DocumentIcon className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-900 truncate">
                        {attachment.name}
                      </span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          <div
            className={`text-xs text-gray-500 ${
              isOwnMessage ? "text-right" : "text-left"
            }`}
          >
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
            })}
            {isOwnMessage && (
              <span className="ml-2">
                {message.status === "sent" && "✓"}
                {message.status === "delivered" && "✓✓"}
                {message.status === "read" && (
                  <span className="text-blue-500">✓✓</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <img
            src={conversation.user?.avatar || "/default-avatar.png"}
            alt={conversation.user?.name}
            className="h-10 w-10 rounded-full"
          />
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              {conversation.user?.name}
            </h2>
            <p className="text-sm text-gray-500">
              {conversation.user?.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {conversation.loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : conversation.error ? (
          <div className="flex items-center justify-center h-full text-red-500">
            {conversation.error}
          </div>
        ) : conversation.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet
          </div>
        ) : (
          conversation.messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachments preview */}
      {hasAttachments() && (
        <div className="px-4 py-2 border-t">
          <div className="flex flex-wrap gap-2">
            {attachments.images.map((file, index) => (
              <div
                key={index}
                className="relative group w-20 h-20 rounded-lg overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeAttachment("images", index)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100"
                >
                  <XIcon className="h-6 w-6 text-white" />
                </button>
              </div>
            ))}
            {attachments.documents.map((file, index) => (
              <div
                key={index}
                className="relative group flex items-center p-2 bg-gray-100 rounded-lg"
              >
                <DocumentIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-900 truncate">
                  {file.name}
                </span>
                <button
                  onClick={() => removeAttachment("documents", index)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e, "images")}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <PhotographIcon className="h-6 w-6" />
            </button>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              multiple
              onChange={(e) => handleFileSelect(e, "documents")}
            />
            <button
              type="button"
              onClick={() =>
                document
                  .querySelector('input[accept=".pdf,.doc,.docx"]')
                  .click()
              }
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <DocumentIcon className="h-6 w-6" />
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-6 w-6 transform rotate-90" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatWindow;
