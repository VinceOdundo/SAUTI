import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  ChatBubbleLeftIcon,
  UserGroupIcon,
  MapPinIcon,
  BellIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const CitizenDashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    organizations: {
      following: 0,
      nearby: 0,
    },
    posts: {
      participated: 0,
      saved: 0,
    },
    messages: {
      unread: 0,
      total: 0,
    },
    notifications: {
      unread: 0,
    },
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // TODO: Implement API call to fetch citizen stats
      // const { stats } = await getCitizenStats();
      // setStats(stats);

      // Mock data
      setStats({
        organizations: {
          following: 12,
          nearby: 25,
        },
        posts: {
          participated: 45,
          saved: 15,
        },
        messages: {
          unread: 3,
          total: 120,
        },
        notifications: {
          unread: 5,
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching stats");
    }
  };

  const features = [
    {
      name: "Organizations",
      description: "Connect with NGOs and CBOs in your area",
      icon: UserGroupIcon,
      stats: [
        { label: "Following", value: stats.organizations.following },
        { label: "Nearby", value: stats.organizations.nearby },
      ],
      link: "/organizations",
      color: "blue",
    },
    {
      name: "Forum",
      description: "Participate in community discussions",
      icon: ChatBubbleLeftIcon,
      stats: [
        { label: "Participated", value: stats.posts.participated },
        { label: "Saved", value: stats.posts.saved },
      ],
      link: "/forum",
      color: "green",
    },
    {
      name: "Local Services",
      description: "Find services and resources near you",
      icon: MapPinIcon,
      stats: [
        { label: "Available", value: 150 },
        { label: "Categories", value: 12 },
      ],
      link: "/services",
      color: "purple",
    },
    {
      name: "Messages",
      description: "Connect with organizations and representatives",
      icon: ChatBubbleLeftIcon,
      stats: [
        { label: "Unread", value: stats.messages.unread },
        { label: "Total", value: stats.messages.total },
      ],
      link: "/messages",
      color: "indigo",
    },
    {
      name: "Reports & Surveys",
      description: "Share your feedback and experiences",
      icon: DocumentTextIcon,
      stats: [
        { label: "Completed", value: 8 },
        { label: "Available", value: 3 },
      ],
      link: "/surveys",
      color: "yellow",
    },
    {
      name: "Impact Tracking",
      description: "Monitor community development progress",
      icon: ChartBarIcon,
      stats: [
        { label: "Projects", value: 15 },
        { label: "Updates", value: 45 },
      ],
      link: "/impact",
      color: "red",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Stay connected with your community
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-500">
              <BellIcon className="h-6 w-6" />
              {stats.notifications.unread > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {features.map((feature) => (
            <Link
              key={feature.name}
              to={feature.link}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 rounded-md p-3 bg-${feature.color}-100`}
                  >
                    <feature.icon
                      className={`h-6 w-6 text-${feature.color}-600`}
                    />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {feature.name}
                      </dt>
                      <dd className="text-xs text-gray-500 mt-1">
                        {feature.description}
                      </dd>
                      <div className="mt-3 flex justify-between">
                        {feature.stats.map((stat, index) => (
                          <div key={stat.label}>
                            <p className="text-2xl font-semibold text-gray-900">
                              {stat.value}
                            </p>
                            <p className="text-sm text-gray-500">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
            <div className="mt-6 flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {/* Mock activity items */}
                {[1, 2, 3].map((item) => (
                  <li key={item} className="py-5">
                    <div className="relative focus-within:ring-2 focus-within:ring-indigo-500">
                      <h3 className="text-sm font-semibold text-gray-800">
                        <a
                          href="#"
                          className="hover:underline focus:outline-none"
                        >
                          {/* Extend touch target */}
                          <span
                            className="absolute inset-0"
                            aria-hidden="true"
                          />
                          New forum post in Education category
                        </a>
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Sed do eiusmod tempor incididunt ut labore et dolore
                        magna aliqua.
                      </p>
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                          15 comments
                        </div>
                        <div className="text-sm text-gray-500">2 hours ago</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <a
                href="#"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View all activity
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboardPage;
