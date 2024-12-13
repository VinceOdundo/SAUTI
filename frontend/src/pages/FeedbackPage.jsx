import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const FeedbackPage = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    title: "",
    content: "",
    category: "suggestion",
    visibility: "public",
    representativeId: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [representatives, setRepresentatives] = useState([]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchRepresentatives();
    fetchFeedback();
  }, []);

  const fetchRepresentatives = async () => {
    try {
      const response = await axios.get("/representatives");
      setRepresentatives(response.data.representatives);
    } catch (error) {
      setError(
        error.response?.data?.message || "Error fetching representatives"
      );
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await axios.get("/feedback");
      setFeedbackList(response.data.feedback);
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/feedback", newFeedback);
      setFeedbackList([response.data.feedback, ...feedbackList]);
      setNewFeedback({
        title: "",
        content: "",
        category: "suggestion",
        visibility: "public",
        representativeId: "",
      });
    } catch (error) {
      setError(error.response?.data?.message || "Error submitting feedback");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Constituent Feedback
      </h1>

      {/* Feedback Form */}
      <div className="bg-dark-700 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Submit Feedback</h2>
        <form onSubmit={handleSubmitFeedback}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              value={newFeedback.representativeId}
              onChange={(e) =>
                setNewFeedback({
                  ...newFeedback,
                  representativeId: e.target.value,
                })
              }
              className="bg-dark-600 text-white rounded-lg p-2"
              required
            >
              <option value="">Select Representative</option>
              {representatives.map((rep) => (
                <option key={rep._id} value={rep._id}>
                  {rep.user.name} - {rep.position}
                </option>
              ))}
            </select>

            <select
              value={newFeedback.category}
              onChange={(e) =>
                setNewFeedback({ ...newFeedback, category: e.target.value })
              }
              className="bg-dark-600 text-white rounded-lg p-2"
            >
              <option value="suggestion">Suggestion</option>
              <option value="complaint">Complaint</option>
              <option value="question">Question</option>
              <option value="appreciation">Appreciation</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Title"
            value={newFeedback.title}
            onChange={(e) =>
              setNewFeedback({ ...newFeedback, title: e.target.value })
            }
            className="w-full bg-dark-600 text-white rounded-lg p-2 mb-4"
            required
            maxLength={200}
          />

          <textarea
            placeholder="Your feedback"
            value={newFeedback.content}
            onChange={(e) =>
              setNewFeedback({ ...newFeedback, content: e.target.value })
            }
            className="w-full bg-dark-600 text-white rounded-lg p-2 mb-4 h-32"
            required
            maxLength={2000}
          />

          <div className="flex justify-between items-center">
            <select
              value={newFeedback.visibility}
              onChange={(e) =>
                setNewFeedback({ ...newFeedback, visibility: e.target.value })
              }
              className="bg-dark-600 text-white rounded-lg p-2"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>

            <button
              type="submit"
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </div>

      {/* Feedback List */}
      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-4">{error}</div>
      )}

      {loading ? (
        <div className="text-center text-white">Loading...</div>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((feedback) => (
            <div
              key={feedback._id}
              className="bg-dark-700 p-6 rounded-lg shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {feedback.title}
                  </h3>
                  <p className="text-gray-400">
                    To: {feedback.representative.user.name}
                  </p>
                </div>
                <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm">
                  {feedback.category}
                </span>
              </div>
              <p className="text-gray-300 mb-4">{feedback.content}</p>
              {feedback.response && (
                <div className="bg-dark-600 p-4 rounded-lg mt-4">
                  <p className="text-white font-bold mb-2">Response:</p>
                  <p className="text-gray-300">{feedback.response.content}</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Responded on:{" "}
                    {new Date(
                      feedback.response.respondedAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
