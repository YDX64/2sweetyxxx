/* jshint esversion: 6 */
/* jshint ignore:start */
import React from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaLifeRing, FaHandshake } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import SharedFooter from "../components/SharedFooter";

const ContactUs = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {t('Contact Us')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">{t('Get in Touch')}</p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800/80 rounded-xl p-6 border dark:border-gray-700 text-center">
            <FaLifeRing className="w-8 h-8 text-pink-500 mx-auto mb-3" />
            <h3 className="font-bold mb-1">{t('Customer Support')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('We typically respond within 24 hours')}</p>
            <a href="mailto:support@2sweety.com" className="text-primary-600 hover:underline">support@2sweety.com</a>
          </div>

          <div className="bg-white dark:bg-gray-800/80 rounded-xl p-6 border dark:border-gray-700 text-center">
            <FaEnvelope className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-bold mb-1">Legal</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('Email us')}</p>
            <a href="mailto:legal@2sweety.com" className="text-primary-600 hover:underline">legal@2sweety.com</a>
          </div>

          <div className="bg-white dark:bg-gray-800/80 rounded-xl p-6 border dark:border-gray-700 text-center">
            <FaHandshake className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold mb-1">{t('Partnerships')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('Email us')}</p>
            <a href="mailto:partners@2sweety.com" className="text-primary-600 hover:underline">partners@2sweety.com</a>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            to="/home"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold no-underline"
          >
            ← {t('Back to Home')}
          </Link>
        </div>
      </main>

      <SharedFooter />
    </div>
  );
};

export default ContactUs;
/* jshint ignore:end */
