import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import CommunicationPanel from "../components/representative/CommunicationPanel";

const RepresentativeDashboard = () => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    pendingFeedback: 0,
    resolvedFeedback: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [response, setResponse] = useState("");
  const { user } = useSelector((state) => state.auth);

  const fetchFeedback = useCallback(async () => {
    if (!user?._id) return;

    const controller = new AbortController();

    try {
      setLoading(true);
      const [feedbackResponse, statsResponse] = await Promise.all([
        axios.get("/feedback", {
          params: { representativeId: user._id },
          signal: controller.signal,
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }),
        axios.get(`/representatives/${user._id}/stats`, {
          signal: controller.signal,
        }),
      ]);

      setFeedback(feedbackResponse.data.feedback);
      setStats(statsResponse.data.stats);
    } catch (error) {
      if (!axios.isCancel(error)) {
        setError(error.response?.data?.message || "Error fetching data");
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [user?._id]);

  useEffect(() => {
    const cleanup = fetchFeedback();
    return () => cleanup();
  }, [fetchFeedback]);

  const handleRespond = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/feedback/${selectedFeedback._id}/respond`, {
        response,
        status: "resolved",
      });
      setResponse("");
      setSelectedFeedback(null);
      fetchFeedback();
    } catch (error) {
      setError(error.response?.data?.message || "Error responding to feedback");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Representative Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-white mb-2">Total Feedback</h3>
          <p className="text-3xl text-primary-500">{stats.totalFeedback}</p>
        </div>
        <div className="bg-dark-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-white mb-2">Pending</h3>
          <p className="text-3xl text-yellow-500">{stats.pendingFeedback}</p>
        </div>
        <div className="bg-dark-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold text-white mb-2">Resolved</h3>
          <p className="text-3xl text-green-500">{stats.resolvedFeedback}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          Communication Center
        </h2>
        <CommunicationPanel />
      </div>

      {/* Feedback List */}
      <div className="bg-dark-700 rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Constituent Feedback
          </h2>
          {loading ? (
            <div className="text-center text-white">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div
                  key={item._id}
                  className={`p-4 rounded-lg ${
                    item.status === "pending" ? "bg-dark-600" : "bg-dark-800"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        From: {item.author.name} •{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        item.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      } text-white`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">{item.content}</p>
                  {item.status === "pending" && (
                    <button
                      onClick={() => setSelectedFeedback(item)}
                      className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
                    >
                      Respond
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-dark-700 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-white mb-4">
              Respond to Feedback
            </h2>
            <form onSubmit={handleRespond}>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full bg-dark-600 text-white rounded-lg p-4 mb-4 h-32"
                placeholder="Type your response..."
                required
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setSelectedFeedback(null)}
                  className="bg-dark-600 text-white px-4 py-2 rounded hover:bg-dark-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600"
                >
                  Send Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepresentativeDashboard;
