import React, { useState } from "react";
import { useSelector } from "react-redux";
import { createPost } from "../features/forum/forumAPI";
import { toast } from "react-hot-toast";
import { LocationPicker } from "./post-components";

const PostForm = ({ onPostCreated }) => {
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    category: "general",
    location: {
      county: user?.county || "",
      constituency: user?.constituency || "",
      ward: user?.ward || "",
    },
    images: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (location) => {
    setFormData((prev) => ({
      ...prev,
      location,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      setIsLoading(true);

      // Format tags as array
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      // Create form data for file upload support
      const postData = new FormData();
      postData.append("title", formData.title);
      postData.append("content", formData.content);
      postData.append("category", formData.category);
      postData.append("tags", JSON.stringify(tags));
      postData.append("location", JSON.stringify(formData.location));

      // Add files if present
      formData.images.forEach((image) => {
        postData.append("images", image);
      });

      const { post } = await createPost(postData);

      // Notify parent component
      onPostCreated(post);

      // Reset form
      setFormData({
        title: "",
        content: "",
        tags: "",
        category: "general",
        location: {
          county: user?.county || "",
          constituency: user?.constituency || "",
          ward: user?.ward || "",
        },
        images: [],
      });

      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Post creation error:", error);
      toast.error(error.message || "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    "general",
    "policy",
    "development",
    "education",
    "health",
    "environment",
    "governance",
    "other",
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Post title"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="What's on your mind?"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            rows="3"
            required
          />
        </div>

        <div>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Tags (comma-separated)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <LocationPicker
          location={formData.location}
          onChange={handleLocationChange}
        />

        <div>
          <input
            type="file"
            name="images"
            onChange={handleImageChange}
            multiple
            accept="image/*"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
          {formData.images.length > 0 && (
            <div className="mt-2 flex gap-2">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index),
                      }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Creating..." : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
