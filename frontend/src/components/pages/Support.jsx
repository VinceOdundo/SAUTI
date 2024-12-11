import React, { useState } from "react";
import { Link } from "react-router-dom";

const Support = () => {
  const [activeTab, setActiveTab] = useState("faq");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      question: "How do I verify my account?",
      answer:
        "After registration, you'll receive a verification email. Click the link in the email to verify your account. If you haven't received the email, you can request a new one from your profile settings.",
    },
    {
      question: "How long does organization verification take?",
      answer:
        "Organization verification typically takes 1-2 business days. Our team reviews your submitted documents and verifies your organization's legitimacy. You'll receive an email once the verification is complete.",
    },
    {
      question: "How can I become a representative?",
      answer:
        "To become a representative, you need to be affiliated with a verified organization. Register as a representative and provide your credentials and organization details. Our team will review your application within 1-2 business days.",
    },
    {
      question: "What documents do I need for verification?",
      answer:
        "Organizations need to provide registration certificates and official documents. Representatives need to provide government-issued ID and credentials proving their role in the organization.",
    },
    {
      question: "How do I reset my password?",
      answer:
        "Click the 'Forgot Password' link on the login page. Enter your email address, and we'll send you instructions to reset your password.",
    },
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // Handle contact form submission
    setSubmitted(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            How can we help?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Choose a category below or search for the help you need
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex justify-center space-x-8">
              <button
                onClick={() => setActiveTab("faq")}
                className={`${
                  activeTab === "faq"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Frequently Asked Questions
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`${
                  activeTab === "contact"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Contact Support
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          {activeTab === "faq" ? (
            <div className="max-w-3xl mx-auto">
              <dl className="space-y-8">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <dt className="text-lg font-medium text-gray-900">
                      {faq.question}
                    </dt>
                    <dd className="mt-2 text-base text-gray-500">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-12 text-center">
                <p className="text-base text-gray-500">
                  Can't find what you're looking for?{" "}
                  <button
                    onClick={() => setActiveTab("contact")}
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Contact our support team
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-lg mx-auto">
              {submitted ? (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg
                      className="h-6 w-6 text-green-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-xl font-medium text-gray-900">
                    Message Sent!
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    We'll get back to you within 24 hours.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setContactForm({
                          name: "",
                          email: "",
                          subject: "",
                          message: "",
                        });
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      value={contactForm.subject}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Message
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      rows={4}
                      value={contactForm.message}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-sm font-medium text-gray-500">Quick Links</h3>
              <div className="mt-4 flex space-x-6">
                <Link
                  to="/privacy"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/guidelines"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Community Guidelines
                </Link>
                <a
                  href="mailto:support@sauti.com"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Email Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
