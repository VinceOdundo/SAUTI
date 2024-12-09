import { useState } from "react";
import axios from "axios";

const PostPoll = ({ poll, postId, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const totalVotes = poll.options.reduce(
    (sum, option) => sum + option.votes,
    0
  );

  const handleVote = async (optionIndex) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `/api/forum/posts/${postId}/vote-poll`,
        {
          optionIndex,
        }
      );
      onUpdate(response.data.post);
    } catch (error) {
      toast.error("Error voting in poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-600 rounded-lg p-4 mb-4">
      <h4 className="text-white font-medium mb-3">{poll.question}</h4>
      <div className="space-y-2">
        {poll.options.map((option, index) => {
          const percentage =
            totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              disabled={loading}
              className="w-full text-left"
            >
              <div className="relative bg-dark-500 rounded-lg p-3">
                <div
                  className="absolute left-0 top-0 h-full bg-primary-500 opacity-20 rounded-lg"
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative flex justify-between">
                  <span className="text-gray-300">{option.text}</span>
                  <span className="text-gray-400">{percentage}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-gray-400 text-sm mt-2">
        {totalVotes} votes • Ends {new Date(poll.endDate).toLocaleDateString()}
      </p>
    </div>
  );
};

export default PostPoll;
