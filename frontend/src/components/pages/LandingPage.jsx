import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const LandingPage = () => {
  const { user } = useAuth();

  const features = [
    {
      title: "Community Engagement",
      description:
        "Connect with representatives and organizations in your area. Share your voice and participate in meaningful discussions.",
      icon: (
        <svg
          className="h-6 w-6 text-primary-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
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
      title: "Representative Access",
      description:
        "Direct access to your local representatives. Stay updated with their activities and initiatives in your community.",
      icon: (
        <svg
          className="h-6 w-6 text-primary-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      title: "Organization Collaboration",
      description:
        "Partner with local organizations and participate in community initiatives. Make a real difference in your area.",
      icon: (
        <svg
          className="h-6 w-6 text-primary-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
  ];

  const userTypes = [
    {
      title: "Citizens",
      description:
        "Engage with your community, follow representatives, and participate in local initiatives.",
      action: "Get Started",
      link: "/register",
    },
    {
      title: "Representatives",
      description:
        "Connect with your constituents, share updates, and gather community feedback.",
      action: "Register as Representative",
      link: "/register/representative",
    },
    {
      title: "Organizations",
      description:
        "Establish your presence, manage representatives, and coordinate community efforts.",
      action: "Register Organization",
      link: "/register/organization",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-base-secondary">
        <main className="lg:relative">
          <div className="mx-auto max-w-7xl w-full pt-16 pb-20 text-center lg:py-48 lg:text-left">
            <div className="px-4 lg:w-1/2 sm:px-8 xl:pr-16">
              <h1 className="text-4xl tracking-tight font-extrabold text-primary">
                <span className="block xl:inline">Community Engagement</span>{" "}
                <span className="block text-primary-600 xl:inline">
                  Made Simple
                </span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-lg text-secondary">
                Connect with your local representatives, organizations, and
                community members. Share your voice and make a difference in
                your area.
              </p>
              <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
                {!user && (
                  <>
                    <div className="rounded-md shadow">
                      <Link
                        to="/register"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                      >
                        Get Started
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        to="/login"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
                      >
                        Sign In
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="relative w-full h-64 sm:h-72 md:h-96 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 lg:h-full">
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src="/images/hero.jpg"
              alt="Community engagement"
            />
          </div>
        </main>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to engage with your community
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.title} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-white">
                      {feature.icon}
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      {feature.title}
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* User Types Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Get Started
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Choose your role
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {userTypes.map((type) => (
                <div
                  key={type.title}
                  className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
                >
                  <div className="px-6 py-8">
                    <h3 className="text-lg font-medium text-gray-900">
                      {type.title}
                    </h3>
                    <p className="mt-4 text-base text-gray-500">
                      {type.description}
                    </p>
                  </div>
                  <div className="px-6 py-4 bg-gray-50">
                    <Link
                      to={type.link}
                      className="block text-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      {type.action}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Join your community today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Connect with your local representatives, organizations, and make
            your voice heard in your community.
          </p>
          {!user && (
            <Link
              to="/register"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 sm:w-auto"
            >
              Sign up for free
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
