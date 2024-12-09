import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PlusIcon } from "@heroicons/react/outline";
import Modal from "../common/Modal";
import { createPost } from "../../features/forum/forumAPI";
import { addPost } from "../../features/forum/forumSlice";
import { toast } from "react-toastify";

const CreatePostButton = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    tags: [],
    location: {
      county: user?.county || "",
      constituency: user?.constituency || "",
      ward: user?.ward || "",
    },
    media: {
      images: [],
      videos: [],
      documents: [],
    },
    poll: null,
    visibility: "public",
  });
  const [isPollEnabled, setIsPollEnabled] = useState(false);
  const [pollData, setPollData] = useState({
    question: "",
    options: ["", ""],
    endDate: "",
    allowMultipleVotes: false,
  });
  const [files, setFiles] = useState({
    images: [],
    videos: [],
    documents: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value,
      },
    }));
  };

  const handleTagInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const newTag = e.target.value.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      e.target.value = "";
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleFileChange = (e, type) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => ({
      ...prev,
      [type]: [...prev[type], ...selectedFiles],
    }));
  };

  const removeFile = (type, index) => {
    setFiles((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handlePollOptionChange = (index, value) => {
    setPollData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const addPollOption = () => {
    if (pollData.options.length < 5) {
      setPollData((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }));
    }
  };

  const removePollOption = (index) => {
    if (pollData.options.length > 2) {
      setPollData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Validate form
      if (!formData.title.trim() || !formData.content.trim()) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (isPollEnabled) {
        if (!pollData.question.trim() || !pollData.endDate) {
          toast.error("Please complete all poll fields");
          return;
        }
        if (pollData.options.some((opt) => !opt.trim())) {
          toast.error("Please fill in all poll options");
          return;
        }
      }

      // Create FormData object
      const postFormData = new FormData();
      postFormData.append("title", formData.title);
      postFormData.append("content", formData.content);
      postFormData.append("category", formData.category);
      postFormData.append("tags", JSON.stringify(formData.tags));
      postFormData.append("location", JSON.stringify(formData.location));
      postFormData.append("visibility", formData.visibility);

      if (isPollEnabled) {
        postFormData.append(
          "poll",
          JSON.stringify({
            ...pollData,
            options: pollData.options.filter((opt) => opt.trim()),
          })
        );
      }

      // Append files
      files.images.forEach((file) => {
        postFormData.append("images", file);
      });
      files.videos.forEach((file) => {
        postFormData.append("videos", file);
      });
      files.documents.forEach((file) => {
        postFormData.append("documents", file);
      });

      const { post } = await createPost(postFormData);
      dispatch(addPost(post));
      toast.success("Post created successfully");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        Create Post
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Post"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={300}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={4}
              maxLength={40000}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <div className="mt-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type and press Enter to add tags"
                onKeyPress={handleTagInput}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="county"
                className="block text-sm font-medium text-gray-700"
              >
                County
              </label>
              <input
                type="text"
                id="county"
                name="county"
                value={formData.location.county}
                onChange={handleLocationChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="constituency"
                className="block text-sm font-medium text-gray-700"
              >
                Constituency
              </label>
              <input
                type="text"
                id="constituency"
                name="constituency"
                value={formData.location.constituency}
                onChange={handleLocationChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="ward"
                className="block text-sm font-medium text-gray-700"
              >
                Ward
              </label>
              <input
                type="text"
                id="ward"
                name="ward"
                value={formData.location.ward}
                onChange={handleLocationChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Media Uploads */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Images (Max 4)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange(e, "images")}
                disabled={files.images.length >= 4}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {files.images.map((file, index) => (
                  <div
                    key={index}
                    className="relative group w-20 h-20 rounded-lg overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile("images", index)}
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Video (Max 1)
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, "videos")}
                disabled={files.videos.length >= 1}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {files.videos.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {files.videos[0].name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile("videos", 0)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Documents (Max 2)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => handleFileChange(e, "documents")}
                disabled={files.documents.length >= 2}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="mt-2 space-y-2">
                {files.documents.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile("documents", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Poll */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Add Poll
              </label>
              <button
                type="button"
                onClick={() => setIsPollEnabled(!isPollEnabled)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {isPollEnabled ? "Remove Poll" : "Add Poll"}
              </button>
            </div>

            {isPollEnabled && (
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="pollQuestion"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Question
                  </label>
                  <input
                    type="text"
                    id="pollQuestion"
                    value={pollData.question}
                    onChange={(e) =>
                      setPollData((prev) => ({
                        ...prev,
                        question: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Options
                  </label>
                  <div className="mt-2 space-y-2">
                    {pollData.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handlePollOptionChange(index, e.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        {index > 1 && (
                          <button
                            type="button"
                            onClick={() => removePollOption(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {pollData.options.length < 5 && (
                    <button
                      type="button"
                      onClick={addPollOption}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                    >
                      Add Option
                    </button>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="pollEndDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    id="pollEndDate"
                    value={pollData.endDate}
                    onChange={(e) =>
                      setPollData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    min={new Date().toISOString().slice(0, 16)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowMultipleVotes"
                    checked={pollData.allowMultipleVotes}
                    onChange={(e) =>
                      setPollData((prev) => ({
                        ...prev,
                        allowMultipleVotes: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="allowMultipleVotes"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Allow multiple votes
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Visibility */}
          <div>
            <label
              htmlFor="visibility"
              className="block text-sm font-medium text-gray-700"
            >
              Visibility
            </label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="public">Public</option>
              <option value="county">County Only</option>
              <option value="constituency">Constituency Only</option>
              <option value="ward">Ward Only</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Post"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default CreatePostButton; 