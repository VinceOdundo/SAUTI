import React from "react";
import Navigation from "../components/Navigation";
import {
  UserGroupIcon,
  ChatBubbleLeftIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Community Engagement",
    description:
      "Connect with your local community and participate in meaningful discussions about issues that matter.",
    icon: UserGroupIcon,
  },
  {
    name: "Direct Communication",
    description:
      "Engage directly with elected officials and community representatives through our secure messaging system.",
    icon: ChatBubbleLeftIcon,
  },
  {
    name: "Civic Innovation",
    description:
      "Propose and collaborate on solutions to community challenges through our innovative platform.",
    icon: LightBulbIcon,
  },
  {
    name: "Transparent Governance",
    description:
      "Access public information and track the progress of community initiatives and government projects.",
    icon: DocumentTextIcon,
  },
  {
    name: "Data-Driven Insights",
    description:
      "Make informed decisions with access to community data and analytics on various civic issues.",
    icon: ChartBarIcon,
  },
  {
    name: "Secure & Private",
    description:
      "Your privacy and security are our top priorities, with state-of-the-art encryption and data protection.",
    icon: ShieldCheckIcon,
  },
];

const team = [
  {
    name: "John Doe",
    role: "Founder & CEO",
    image: "/assets/team/john-doe.jpg",
    bio: "Former civic tech leader with 15 years of experience in community development.",
  },
  {
    name: "Jane Smith",
    role: "Head of Community",
    image: "/assets/team/jane-smith.jpg",
    bio: "Community organizing expert with a background in social impact initiatives.",
  },
  {
    name: "David Wilson",
    role: "Technical Director",
    image: "/assets/team/david-wilson.jpg",
    bio: "Technology veteran specializing in secure communication platforms.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-base font-semibold text-primary-600 tracking-wide uppercase">
              About Sauti
            </h1>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Empowering Democratic Participation
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Sauti is a cutting-edge platform designed to strengthen democratic
              participation and civic engagement in Kenya through technology and
              innovation.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white text-center">
            Our Mission
          </h2>
          <div className="mt-6 text-xl text-primary-100 text-center max-w-3xl mx-auto">
            <p>
              To create a more inclusive and participatory democracy by
              connecting citizens with their representatives and providing tools
              for meaningful civic engagement.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for civic engagement
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="relative">
                  <div>
                    <div className="absolute h-12 w-12 rounded-md bg-primary-500 text-white flex items-center justify-center">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      {feature.name}
                    </p>
                  </div>
                  <div className="mt-2 ml-16 text-base text-gray-500">
                    {feature.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Our Team
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Meet the people behind Sauti
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
              {team.map((member) => (
                <div key={member.name} className="space-y-4">
                  <div className="aspect-w-3 aspect-h-3">
                    <img
                      className="object-cover shadow-lg rounded-lg"
                      src={member.image}
                      alt={member.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-lg leading-6 font-medium space-y-1">
                      <h3>{member.name}</h3>
                      <p className="text-primary-600">{member.role}</p>
                    </div>
                    <div className="text-base text-gray-500">
                      <p>{member.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Our Values
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              What drives us forward
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Transparency
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  We believe in open communication and accountability at all
                  levels of governance.
                </p>
              </div>

              <div className="relative">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Innovation
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  We continuously evolve our platform to meet the changing needs
                  of our communities.
                </p>
              </div>

              <div className="relative">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Inclusivity
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  We ensure our platform is accessible and welcoming to all
                  members of society.
                </p>
              </div>

              <div className="relative">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Impact
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  We measure our success by the positive changes we help create
                  in communities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
