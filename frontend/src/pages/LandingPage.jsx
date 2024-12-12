import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import AppLayout from "../components/layouts/AppLayout";
import axios from "axios";

const LandingPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    communities: 0,
    engagementRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/stats/public");
      setStats(response.data);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to fetch platform stats",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      title: "Connect with Representatives",
      description:
        "Directly engage with your local representatives and make your voice heard.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      title: "Community Discussions",
      description:
        "Join meaningful discussions about issues that matter to your community.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          />
        </svg>
      ),
    },
    {
      title: "Location-Based Updates",
      description:
        "Stay informed about developments and issues in your local area.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="container py-12 space-y-24">
        {/* Hero Section */}
        <div className=" text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-primary">
            Your Voice in Local Governance
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Connect with your representatives, engage in community discussions,
            and make a difference in your local area.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/about" className="btn btn-secondary">
              Learn More
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {stats.users.toLocaleString()}
              </div>
              <div className="text-secondary">Active Users</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {stats.posts.toLocaleString()}
              </div>
              <div className="text-secondary">Community Posts</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {stats.communities.toLocaleString()}
              </div>
              <div className="text-secondary">Local Communities</div>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {stats.engagementRate}%
              </div>
              <div className="text-secondary">Engagement Rate</div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-primary">
              Why Choose Sauti
            </h2>
            <p className="mt-4 text-secondary max-w-2xl mx-auto">
              Our platform provides the tools you need to engage with your local
              government and community effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-accent-primary bg-opacity-10 flex items-center justify-center text-accent -primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-primary">
                  {feature.title}
                </h3>
                <p className="text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="card p-12 text-center space-y-6">
          <h2 className="text-3xl font-bold text-primary">
            Ready to Make a Difference?
          </h2>
          <p className="text-secondary max-w-2xl mx-auto">
            Join Sauti today and become part of a community dedicated to
            improving local governance and civic engagement.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn btn-primary">
              Create Account
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LandingPage;
