import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Clock, Bell, Zap, CheckCircle, ArrowRight } from 'lucide-react';

const Home = ({ user }) => {
  const features = [
    {
      icon: <Bookmark className="h-6 w-6" />,
      title: 'Smart Bookmarking',
      description: 'Save important content from anywhere with our intuitive bookmarking system.'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Smart Reminders',
      description: 'Never forget to revisit your saved content with intelligent reminder scheduling.'
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: 'Email Notifications',
      description: 'Get timely email reminders about your bookmarks so you never miss important content.'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lightning Fast',
      description: 'Quick and responsive interface that makes bookmarking effortless.'
    }
  ];

  const benefits = [
    'Never lose important content again',
    'Stay organized with smart categorization',
    'Get reminded at the perfect time',
    'Access your bookmarks from anywhere'
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Never Forget to
          <span className="text-primary-600"> Revisit</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Transform how you save and revisit content. Revisitly helps you bookmark important 
          information and sends you smart reminders so you never miss valuable content again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn-primary text-lg px-8 py-3">
              Get Started Free
            </Link>
          )}
          <Link to="/login" className="btn-secondary text-lg px-8 py-3">
            Learn More
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Revisitly?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center hover:shadow-lg transition-shadow">
              <div className="text-primary-600 mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 px-4 bg-white rounded-2xl shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What You'll Get
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Perfect for Everyone</h3>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <span>Save bookmarks with our easy-to-use interface</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <span>Set custom reminder schedules</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <span>Receive timely email notifications</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <span>Revisit and stay organized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of users who never forget to revisit their important content.
        </p>
        {user ? (
          <Link to="/dashboard" className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2">
            <span>Go to Dashboard</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        ) : (
          <Link to="/login" className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2">
            <span>Start Free Today</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home; 