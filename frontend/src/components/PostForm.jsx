import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useToast } from "../contexts/ToastContext";
import { createPost } from "../store/slices/forumSlice";
import axios from "axios";

const PostForm = ({ onPost }) => {
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [category, setCategory] = useState("general");
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    content: "",
    media: "",
    category: "general",
    tags: [],
    location: null,
    status: "active"
  });
  const { showToast } = useToast();

  useEffect(() => {
    // Check if we have stored location permission
    const hasLocationPermission = localStorage.getItem("locationPermission");
    if (hasLocationPermission === "granted") {
      getCurrentLocation();
    }
  }, []);

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use reverse geocoding to get place name
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            setLocation({
              latitude,
              longitude,
              placeName: data.display_name,
            });
            localStorage.setItem("locationPermission", "granted");
          } catch (error) {
            console.error("Error getting location name:", error);
            setLocation({ latitude, longitude });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          localStorage.setItem("locationPermission", "denied");
        }
      );
    }
  };

  const handleLocationClick = () => {
    if (location) {
      setLocation(null); // Toggle location off
    } else {
      getCurrentLocation();
    }
  };

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

  const extractHashtags = (text) => {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    return text.match(hashtagRegex) || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If there's an image, upload it first
      let mediaUrl = "";
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        const response = await axios.post("/upload", formData);
        mediaUrl = response.data.url;
      }

      const postData = {
        ...formData,
        media: mediaUrl,
        location: location ? {
          coordinates: [location.longitude, location.latitude],
          placeName: location.placeName
        } : undefined
      };

      const response = await dispatch(createPost(postData)).unwrap();
      showToast("Post created successfully!", "success");
      setFormData({
        content: "",
        media: "",
        category: "general",
        tags: [],
        location: null,
        status: "active"
      });
      setImage(null);
      setImagePreview(null);
      if (onPost) onPost(response);
    } catch (error) {
      showToast(error.message || "Failed to create post", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        placeholder="What's happening?"
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
        rows={isExpanded ? 4 : 2}
        onFocus={() => setIsExpanded(true)}
      />

      {isExpanded && (
        <>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full p-2 border rounded-lg"
            required
          >
            <option value="general">General</option>
            <option value="policy">Policy</option>
            <option value="development">Development</option>
            <option value="education">Education</option>
            <option value="health">Health</option>
            <option value="environment">Environment</option>
            <option value="governance">Governance</option>
            <option value="other">Other</option>
          </select>

          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="px-4 py-2 text-sm bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
            >
              Add Image
            </label>
            <button
              type="button"
              onClick={handleLocationClick}
              className={`px-4 py-2 text-sm rounded-lg cursor-pointer ${
                location
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {location
                ? "📍 " + (location.placeName || "Location added")
                : "📍 Add location"}
            </button>
          </div>

          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
              >
                ×
              </button>
            </div>
          )}

          <div className="text-sm text-gray-500">
            {formData.content.length}/310 • Use # to add tags
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-lg ${
          isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
        } text-white font-medium`}
      >
        {isLoading ? "Posting..." : "Post"}
      </button>
    </form>
  );
};

export default PostForm;
