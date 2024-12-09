import { useState, useEffect } from "react";
import axios from "axios";

const CommunicationPanel = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({
    title: "",
    content: "",
    type: "announcement",
    audience: {
      county: "",
      constituency: "",
      ward: "",
    },
    status: "draft",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const messageTypes = ["announcement", "update", "newsletter"];

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get("/api/communication/messages");
      setMessages(response.data.messages);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching messages");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/communication/messages", newMessage);
      setNewMessage({
        title: "",
        content: "",
        type: "announcement",
        audience: {
          county: "",
          constituency: "",
          ward: "",
        },
        status: "draft",
      });
      fetchMessages();
    } catch (error) {
      setError(error.response?.data?.message || "Error creating message");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-dark-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          Create Communication
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Title"
              value={newMessage.title}
              onChange={(e) =>
                setNewMessage({ ...newMessage, title: e.target.value })
              }
              className="w-full bg-dark-600 text-white rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <textarea
              placeholder="Content"
              value={newMessage.content}
              onChange={(e) =>
                setNewMessage({ ...newMessage, content: e.target.value })
              }
              className="w-full bg-dark-600 text-white rounded-lg px-4 py-2 h-32"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={newMessage.type}
              onChange={(e) =>
                setNewMessage({ ...newMessage, type: e.target.value })
              }
              className="bg-dark-600 text-white rounded-lg px-4 py-2"
            >
              {messageTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={newMessage.status}
              onChange={(e) =>
                setNewMessage({ ...newMessage, status: e.target.value })
              }
              className="bg-dark-600 text-white rounded-lg px-4 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Publish</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600"
          >
            Create Message
          </button>
        </form>
      </div>

      <div className="bg-dark-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Recent Messages</h2>
        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className="bg-dark-600 rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-white">
                    {message.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      message.status === "published"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {message.status}
                  </span>
                </div>
                <p className="text-gray-300">{message.content}</p>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{message.type}</span>
                  <span>
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationPanel;
