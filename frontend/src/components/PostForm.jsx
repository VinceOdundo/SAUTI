import { useState } from "react";
import { useSelector } from "react-redux";
import { PollOption, MediaUpload, LocationPicker } from "./post-components";
import { toast } from "react-hot-toast";

const PostForm = ({ onPostCreated }) => {
  const { user } = useSelector((state) => state.auth);
  const [postType, setPostType] = useState("text");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    media: { images: [], video: null },
    poll: { question: "", options: ["", ""] },
    location: { county: "", constituency: "", ward: "" },
    tags: [],
  });
  const [loading, setLoading] = useState(false);

  const postTypes = [
    { id: "text", label: "Text", icon: "text" },
    { id: "media", label: "Media", icon: "image" },
    { id: "poll", label: "Poll", icon: "chart-bar" },
    { id: "location", label: "Location", icon: "map-marker" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/forum/posts", {
        ...formData,
        type: postType,
      });

      // Show success message
      toast.success("Post created successfully!");

      // Update parent component
      onPostCreated(response.data.post);

      // Reset form
      setFormData({
        title: "",
        content: "",
        media: { images: [], video: null },
        poll: { question: "", options: ["", ""] },
        location: { county: "", constituency: "", ward: "" },
        tags: [],
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-700 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <h3 className="text-white font-medium">{user.name}</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Post Type Selector */}
        <div className="flex gap-2 mb-4 border-b border-dark-600 pb-4">
          {postTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setPostType(type.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                postType === type.id
                  ? "bg-primary-500 text-white"
                  : "text-gray-400 hover:bg-dark-600"
              }`}
            >
              <i className={`icon-${type.icon}`} />
              {type.label}
            </button>
          ))}
        </div>

        {/* Title Input */}
        <input
          type="text"
          placeholder="Post title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-dark-600 text-white px-4 py-2 rounded-lg mb-4"
          required
        />

        {/* Content Input */}
        <textarea
          placeholder="What's on your mind?"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          className="w-full bg-dark-600 text-white px-4 py-2 rounded-lg mb-4 min-h-[100px]"
          required
        />

        {/* Conditional Form Elements */}
        {postType === "media" && (
          <MediaUpload
            media={formData.media}
            onChange={(media) => setFormData({ ...formData, media })}
          />
        )}

        {postType === "poll" && (
          <PollOption
            poll={formData.poll}
            onChange={(poll) => setFormData({ ...formData, poll })}
          />
        )}

        {postType === "location" && (
          <LocationPicker
            location={formData.location}
            onChange={(location) => setFormData({ ...formData, location })}
          />
        )}

        {/* Tags Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Add tags (comma separated)"
            value={formData.tags.join(", ")}
            onChange={(e) =>
              setFormData({
                ...formData,
                tags: e.target.value.split(",").map((tag) => tag.trim()),
              })
            }
            className="w-full bg-dark-600 text-white px-4 py-2 rounded-lg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
};

export default PostForm;
