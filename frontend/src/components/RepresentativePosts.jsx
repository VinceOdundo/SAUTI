import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

const RepresentativePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRepresentativePosts = async () => {
      try {
        const response = await axios.get("/posts/representatives");
        setPosts(response.data.posts);
      } catch (error) {
        console.error("Error fetching representative posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRepresentativePosts();
  }, []);

  return (
    <div className="bg-dark-700 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4">
        Representative Updates
      </h2>
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-dark-600 rounded w-3/4" />
              <div className="h-3 bg-dark-600 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post._id}
              className="border-b border-dark-600 last:border-0 pb-4 last:pb-0"
            >
              <Link
                to={`/profile/${post.author._id}`}
                className="flex items-center gap-2 mb-2"
              >
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <h3 className="text-white font-medium">{post.author.name}</h3>
                  <p className="text-gray-400 text-xs">
                    {post.author.position}
                  </p>
                </div>
              </Link>
              <Link to={`/post/${post._id}`} className="block">
                <h4 className="text-white font-medium hover:text-primary-500">
                  {post.title}
                </h4>
                <p className="text-gray-400 text-sm mt-1">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepresentativePosts;
