import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import api from "../utils/axiosConfig";

const MessagingPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get("/messages/conversations");
      setConversations(response.data.conversations);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching conversations");
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await api.get(`/messages/${userId}`);
      setMessages(response.data.messages);
      scrollToBottom();
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching messages");
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const loadConversations = async () => {
      try {
        const response = await fetchConversations();
        if (isSubscribed) {
          setConversations(response.data.conversations);
          setLoading(false);
        }
      } catch (error) {
        if (isSubscribed) {
          setError(
            error.response?.data?.message || "Error fetching conversations"
          );
          setLoading(false);
        }
      }
    };

    loadConversations();

    return () => {
      isSubscribed = false;
    };
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    if (activeConversation) {
      const loadMessages = async () => {
        try {
          const response = await fetchMessages(activeConversation._id);
          if (isSubscribed) {
            setMessages(response.data.messages);
            scrollToBottom();
          }
        } catch (error) {
          if (isSubscribed) {
            setError(
              error.response?.data?.message || "Error fetching messages"
            );
          }
        }
      };

      loadMessages();
    }

    return () => {
      isSubscribed = false;
    };
  }, [activeConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post("/messages/send", {
        receiverId: activeConversation._id,
        content: newMessage,
      });
      setNewMessage("");
      fetchMessages(activeConversation._id);
      fetchConversations(); // Update conversation list
    } catch (error) {
      setError(error.response?.data?.message || "Error sending message");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex h-[calc(100vh-200px)] bg-dark-700 rounded-lg overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-dark-600">
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
            {conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => setActiveConversation(conv._id)}
                className={`p-4 cursor-pointer hover:bg-dark-600 ${
                  activeConversation?._id === conv._id ? "bg-dark-600" : ""
                }`}
              >
                <div className="flex items-center">
                  <img
                    src={conv._id.avatar}
                    alt={conv._id.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="text-white font-medium">{conv._id.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {conv.lastMessage.content.substring(0, 50)}...
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`mb-4 flex ${
                      message.sender._id === user._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender._id === user._id
                          ? "bg-primary-500 text-white"
                          : "bg-dark-600 text-gray-300"
                      }`}
                    >
                      <p>{message.content}</p>
                      <span className="text-xs opacity-75">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-dark-600"
              >
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-dark-600 text-white rounded-lg px-4 py-2"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
