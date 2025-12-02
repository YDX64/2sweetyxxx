/* jshint esversion: 6 */
/* jshint ignore:start */
import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaShieldAlt, FaUsers, FaGlobe, FaVideo, FaComments, FaStar, FaRocket } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import SharedFooter from "../components/SharedFooter";

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <FaHeart className="w-16 h-16 text-pink-500 dark:text-pink-400 mx-auto animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <span className="bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300 border border-pink-200 dark:border-pink-800 px-2 py-1 rounded text-xs font-semibold">
                  2Sweety
                </span>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {t('About Us')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('Welcome to 2Sweety!')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="border-2 border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50 to-red-50 dark:bg-gray-800/80 rounded-xl p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <FaHeart className="w-8 h-8 text-pink-500 dark:text-pink-400" />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('Welcome to 2Sweety!')}</h2>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('2Sweety is a modern dating platform created to help people find meaningful connections and relationships. We believe that love is everywhere - you just need the right tools to find it.')}
            </p>
          </div>

          {/* Our Vision */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-xl p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <FaStar className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('Our Vision')}</h2>
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('We strive to create a safe, inclusive, and fun environment where people can meet, chat, and build relationships. Whether you are looking for friendship, dating, or your soulmate - 2Sweety is here for you.')}
            </p>
          </div>

          {/* What Makes Us Unique */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-xl p-8 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <FaRocket className="w-8 h-8 text-purple-500 dark:text-purple-400" />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('What Makes Us Unique?')}</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {/* Safety First */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-500 p-3 rounded-full">
                    <FaShieldAlt className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300">{t('Safety First')}</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {t('We prioritize your privacy and security with advanced verification systems.')}
                </p>
              </div>

              {/* Smart Matching */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl p-6 border border-pink-200 dark:border-pink-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-pink-500 p-3 rounded-full">
                    <FaHeart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-pink-800 dark:text-pink-300">{t('Smart Matching')}</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {t('Our algorithm helps you find people who share your interests and values.')}
                </p>
              </div>

              {/* Global Community */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-500 p-3 rounded-full">
                    <FaGlobe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-300">{t('Global Community')}</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {t('Meet people from around the world or focus on your local area.')}
                </p>
              </div>

              {/* Video & Chat */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-purple-500 p-3 rounded-full">
                    <FaVideo className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300">{t('Video & Chat')}</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {t('Communicate your way with video and voice calls.')}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 rounded-xl p-8 shadow-xl text-white">
            <h3 className="text-2xl font-bold mb-8 text-center">{t('Join Our Growing Community')}</h3>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <FaUsers className="w-10 h-10 mx-auto mb-3 text-white" />
                <div className="text-3xl font-bold">1M+</div>
                <div className="text-sm opacity-80">{t('Active Users')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <FaHeart className="w-10 h-10 mx-auto mb-3 text-white" />
                <div className="text-3xl font-bold">500K+</div>
                <div className="text-sm opacity-80">{t('Matches Made')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <FaGlobe className="w-10 h-10 mx-auto mb-3 text-white" />
                <div className="text-3xl font-bold">150+</div>
                <div className="text-sm opacity-80">{t('Countries')}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <FaComments className="w-10 h-10 mx-auto mb-3 text-white" />
                <div className="text-3xl font-bold">10M+</div>
                <div className="text-sm opacity-80">{t('Messages Sent')}</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-xl p-8 shadow-lg text-center">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {t('Ready to Find Your Match?')}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('Join thousands of people who have already found their perfect match on 2Sweety.')}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 no-underline"
            >
              <FaHeart className="mr-2" />
              {t('Get Started')}
            </Link>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-12">
          <Link
            to="/home"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold no-underline"
          >
            ← {t('Back to Home')}
          </Link>
        </div>
      </main>

      {/* Shared Footer for consistent design */}
      <SharedFooter />
    </div>
  );
};

export default AboutUs;
/* jshint ignore:end */
