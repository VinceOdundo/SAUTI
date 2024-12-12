import React, { useState } from "react";
import { useToast } from "../contexts/ToastContext";
import LocationPicker from "./post-components/LocationPicker";
import axios from "axios";

const PostForm = ({ onPost }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState({
    county: "",
    constituency: "",
    ward: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { showToast } = useToast();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) {
      showToast("Please add some content or an image", "error");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) {
        formData.append("image", image);
      }
      if (location.county) {
        formData.append("location", JSON.stringify(location));
      }

      await axios.post("/api/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setContent("");
      setImage(null);
      setImagePreview(null);
      setLocation({ county: "", constituency: "", ward: "" });
      setIsExpanded(false);
      showToast("Post created successfully", "success");
      if (onPost) onPost();
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to create post",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-primary">Create Post</h2>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="w-full min-h-[100px] bg-base text-primary placeholder-text-secondary border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none transition-base"
          />

          {isExpanded && (
            <>
              {/* Image Upload */}
              <div className="space-y-2">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 rounded-full bg-base text-secondary hover:text-primary transition-base"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="btn btn-secondary flex items-center space-x-2 cursor-pointer">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Location Picker */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-primary">
                  Location (Optional)
                </label>
                <LocationPicker location={location} onChange={setLocation} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={isLoading || (!content.trim() && !image)}
            className={`btn btn-primary ${
              isLoading || (!content.trim() && !image)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isLoading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
