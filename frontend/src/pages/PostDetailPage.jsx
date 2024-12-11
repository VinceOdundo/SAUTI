import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPostById,
  createComment,
  voteOnPost,
} from "../store/slices/forumSlice";
import { useAuth } from "../hooks/useAuth";
import Navigation from "../components/Navigation";
import {
  ThumbUpIcon,
  ThumbDownIcon,
  ArrowLeftIcon,
} from "@heroicons/react/outline";
import {
  ThumbUpIcon as ThumbUpSolidIcon,
  ThumbDownIcon as ThumbDownSolidIcon,
} from "@heroicons/react/solid";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const commentValidationSchema = Yup.object().shape({
  content: Yup.string()
    .min(5, "Comment must be at least 5 characters")
    .required("Comment is required"),
});

export default function PostDetailPage() {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();
  const { currentPost, loading } = useSelector((state) => state.forum);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        await dispatch(fetchPostById(postId)).unwrap();
      } catch (err) {
        setError(err);
      }
    };
    loadPost();
  }, [dispatch, postId]);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      setError("Please login to vote");
      return;
    }

    try {
      await dispatch(voteOnPost({ postId, voteType })).unwrap();
    } catch (err) {
      setError(err);
    }
  };

  const handleComment = async (values, { resetForm }) => {
    if (!isAuthenticated) {
      setError("Please login to comment");
      return;
    }

    try {
      await dispatch(
        createComment({ postId, content: values.content })
      ).unwrap();
      resetForm();
    } catch (err) {
      setError(err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Post not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/forum"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Forum
        </Link>

        {/* Post Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {currentPost.category}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(currentPost.createdAt)}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {currentPost.title}
            </h1>

            <p className="text-gray-700 whitespace-pre-wrap mb-6">
              {currentPost.content}
            </p>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleVote("up")}
                  className={`flex items-center space-x-1 ${
                    currentPost.userVote === "up"
                      ? "text-primary-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {currentPost.userVote === "up" ? (
                    <ThumbUpSolidIcon className="h-5 w-5" />
                  ) : (
                    <ThumbUpIcon className="h-5 w-5" />
                  )}
                  <span>{currentPost.votes?.up || 0}</span>
                </button>

                <button
                  onClick={() => handleVote("down")}
                  className={`flex items-center space-x-1 ${
                    currentPost.userVote === "down"
                      ? "text-red-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {currentPost.userVote === "down" ? (
                    <ThumbDownSolidIcon className="h-5 w-5" />
                  ) : (
                    <ThumbDownIcon className="h-5 w-5" />
                  )}
                  <span>{currentPost.votes?.down || 0}</span>
                </button>
              </div>

              <div className="flex items-center">
                <img
                  src={
                    currentPost.author.avatar || "/assets/default-avatar.png"
                  }
                  alt={currentPost.author.name}
                  className="h-8 w-8 rounded-full mr-2"
                />
                <span className="text-sm text-gray-600">
                  {currentPost.author.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Comments ({currentPost.comments?.length || 0})
          </h2>

          {/* Comment Form */}
          {isAuthenticated && (
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="p-6">
                <Formik
                  initialValues={{ content: "" }}
                  validationSchema={commentValidationSchema}
                  onSubmit={handleComment}
                >
                  {({ errors, touched }) => (
                    <Form>
                      <div className="mb-4">
                        <Field
                          name="content"
                          as="textarea"
                          rows={3}
                          placeholder="Write a comment..."
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        />
                        {errors.content && touched.content && (
                          <div className="text-red-500 text-sm mt-1">
                            {errors.content}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                        >
                          Post Comment
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {currentPost.comments?.map((comment) => (
              <div
                key={comment.id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <img
                        src={
                          comment.author.avatar || "/assets/default-avatar.png"
                        }
                        alt={comment.author.name}
                        className="h-8 w-8 rounded-full mr-2"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {comment.author.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
