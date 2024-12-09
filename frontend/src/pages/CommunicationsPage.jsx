import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import api from "../utils/axiosConfig";
import { useSelector } from "react-redux";

const CommunicationsPage = () => {
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
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState("all");
  const { user } = useSelector((state) => state.auth);

  const messageTypes = ["announcement", "update", "newsletter", "alert"];

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get("/communication/messages");
      setMessages(response.data.messages);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/communication/messages", newMessage);
      setMessages([response.data.message, ...messages]);
      setNewMessage({
        title: "",
        content: "",
        type: "announcement",
        audience: { county: "", constituency: "", ward: "" },
        status: "draft",
      });
      setView("list");
      toast.success("Message created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create message");
    }
  };

  const handlePublish = async (messageId) => {
    try {
      const response = await api.patch(`/communication/messages/${messageId}`, {
        status: "published",
      });
      setMessages(
        messages.map((msg) =>
          msg._id === messageId ? response.data.message : msg
        )
      );
      toast.success("Message published successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to publish message");
    }
  };

  const filteredMessages = messages.filter((msg) =>
    filter === "all" ? true : msg.status === filter
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Communications</h1>
        <button
          onClick={() => setView(view === "list" ? "create" : "list")}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          {view === "list" ? "Create Message" : "View Messages"}
        </button>
      </div>

      {view === "create" ? (
        <div className="bg-dark-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Create New Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newMessage.title}
                onChange={(e) =>
                  setNewMessage({ ...newMessage, title: e.target.value })
                }
                className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Content
              </label>
              <textarea
                value={newMessage.content}
                onChange={(e) =>
                  setNewMessage({ ...newMessage, content: e.target.value })
                }
                className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg h-32 focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Type
                </label>
                <select
                  value={newMessage.type}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, type: e.target.value })
                  }
                  className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {messageTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Status
                </label>
                <select
                  value={newMessage.status}
                  onChange={(e) =>
                    setNewMessage({ ...newMessage, status: e.target.value })
                  }
                  className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-400">
                Target Audience
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="County"
                  value={newMessage.audience.county}
                  onChange={(e) =>
                    setNewMessage({
                      ...newMessage,
                      audience: {
                        ...newMessage.audience,
                        county: e.target.value,
                      },
                    })
                  }
                  className="bg-dark-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  placeholder="Constituency"
                  value={newMessage.audience.constituency}
                  onChange={(e) =>
                    setNewMessage({
                      ...newMessage,
                      audience: {
                        ...newMessage.audience,
                        constituency: e.target.value,
                      },
                    })
                  }
                  className="bg-dark-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  placeholder="Ward"
                  value={newMessage.audience.ward}
                  onChange={(e) =>
                    setNewMessage({
                      ...newMessage,
                      audience: {
                        ...newMessage.audience,
                        ward: e.target.value,
                      },
                    })
                  }
                  className="bg-dark-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Create Message
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-6">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-dark-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Messages</option>
              <option value="draft">Drafts</option>
              <option value="published">Published</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No messages found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <div
                  key={message._id}
                  className="bg-dark-700 rounded-lg p-6 transition-all hover:bg-dark-600"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {message.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {message.type} •{" "}
                        {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        message.status === "published"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {message.status}
                    </span>
                  </div>

                  <p className="text-gray-300 mb-4">{message.content}</p>

                  {message.audience && (
                    <div className="flex gap-2 text-sm text-gray-400 mb-4">
                      {message.audience.county && (
                        <span className="px-2 py-1 bg-dark-800 rounded">
                          {message.audience.county}
                        </span>
                      )}
                      {message.audience.constituency && (
                        <span className="px-2 py-1 bg-dark-800 rounded">
                          {message.audience.constituency}
                        </span>
                      )}
                      {message.audience.ward && (
                        <span className="px-2 py-1 bg-dark-800 rounded">
                          {message.audience.ward}
                        </span>
                      )}
                    </div>
                  )}

                  {message.status === "draft" && (
                    <button
                      onClick={() => handlePublish(message._id)}
                      className="text-sm bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition-colors"
                    >
                      Publish
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommunicationsPage;
