import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const SuggestedProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get("/users/suggested");
        setProfiles(response.data.profiles);
      } catch (error) {
        console.error("Error fetching suggested profiles:", error);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div className="bg-dark-700 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4">Who to Follow</h2>
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-dark-600 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-dark-600 rounded w-3/4" />
                <div className="h-3 bg-dark-600 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div
              key={profile._id}
              className="flex items-center justify-between"
            >
              <Link
                to={`/profile/${profile._id}`}
                className="flex items-center space-x-3"
              >
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="text-white font-medium">{profile.name}</h3>
                  <p className="text-gray-400 text-sm">{profile.role}</p>
                </div>
              </Link>
              <button className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm hover:bg-primary-600">
                Follow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestedProfiles;
