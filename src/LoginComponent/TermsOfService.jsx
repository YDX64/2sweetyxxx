/* jshint esversion: 6 */
/* jshint ignore:start */
import React from "react";
import { Link } from "react-router-dom";
import { FaBalanceScale, FaShieldAlt, FaExclamationTriangle, FaClock, FaCheckCircle, FaFileAlt, FaUser, FaHeart } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <FaBalanceScale className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto" />
              <div className="absolute -top-2 -right-2">
                <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded text-xs font-semibold">
                  {t('Legal')}
                </span>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {t('Terms of Service')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('Please read these terms carefully before using 2Sweety. By using our service, you agree to these terms.')}
          </p>
          <div className="mt-6 inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FaClock className="w-4 h-4 mr-2" />
            {t('Last updated')}: {t('December 2024')}
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Quick Overview */}
          <div className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-gray-800/80 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FaCheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold">{t('Quick Overview')}</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('These Terms of Service govern your use of 2Sweety, a dating platform that connects people worldwide. By creating an account, you agree to follow our community guidelines and use our service responsibly.')}
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                <FaUser className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
                <div className="font-semibold text-sm dark:text-gray-200">{t('18+ Only')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('Age Verification Required')}</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                <FaShieldAlt className="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
                <div className="font-semibold text-sm dark:text-gray-200">{t('Safe Environment')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('Verified Profiles')}</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                <FaHeart className="w-8 h-8 text-pink-500 dark:text-pink-400 mx-auto mb-2" />
                <div className="font-semibold text-sm dark:text-gray-200">{t('Respectful Community')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('Zero Tolerance Policy')}</div>
              </div>
            </div>
          </div>

          {/* Section 1: Acceptance of Terms */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('1. Acceptance of Terms')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('By accessing or using 2Sweety, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.')}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              {t('We may update these terms from time to time. Continued use of our service after changes constitutes acceptance of the updated terms.')}
            </p>
          </div>

          {/* Section 2: Eligibility */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('2. Eligibility Requirements')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('To use 2Sweety, you must:')}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
              <li>{t('Be at least 18 years old')}</li>
              <li>{t('Provide accurate and complete information')}</li>
              <li>{t('Have the legal capacity to enter into these terms')}</li>
              <li>{t('Not be prohibited from using our service under applicable laws')}</li>
              <li>{t('Not have been previously banned from our platform')}</li>
            </ul>
            <div className="bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-300">{t('Age Verification')}</p>
                  <p className="text-gray-700 dark:text-gray-400 text-sm">{t('We may request age verification documentation to ensure compliance with this requirement.')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Account Rules */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('3. Account Responsibilities')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('When creating and maintaining your account, you agree to:')}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700 dark:text-green-400">✓ {t('Allowed')}:</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>{t('Use recent, accurate photos of yourself')}</li>
                  <li>{t('Provide truthful profile information')}</li>
                  <li>{t('Engage respectfully with others')}</li>
                  <li>{t('Report inappropriate behavior')}</li>
                  <li>{t('Maintain account security')}</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-red-700 dark:text-red-400">✗ {t('Prohibited')}:</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>{t('Creating fake or multiple accounts')}</li>
                  <li>{t('Using others photos without permission')}</li>
                  <li>{t('Harassment or inappropriate content')}</li>
                  <li>{t('Commercial solicitation')}</li>
                  <li>{t('Sharing personal contact information')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Privacy and Data */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('4. Privacy and Data Protection')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('Your privacy is important to us. We collect and process your data in accordance with our Privacy Policy and applicable data protection laws.')}
            </p>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FaShieldAlt className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-1" />
                <div>
                  <p className="font-semibold dark:text-gray-200">{t('Data Security')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('We use industry-standard encryption and security measures to protect your information.')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FaUser className="w-5 h-5 text-green-500 dark:text-green-400 mt-1" />
                <div>
                  <p className="font-semibold dark:text-gray-200">{t('Your Rights')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('You have the right to access, modify, or delete your personal data at any time.')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Premium Services */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('5. Premium Services and Payments')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('2Sweety offers premium features through subscription plans. By purchasing a premium subscription:')}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
              <li>{t('You agree to pay the specified fees')}</li>
              <li>{t('Subscriptions automatically renew unless cancelled')}</li>
              <li>{t('Refunds are subject to our refund policy')}</li>
              <li>{t('Premium features are subject to availability')}</li>
            </ul>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-300 font-semibold">{t('Cancellation Policy')}</p>
              <p className="text-blue-700 dark:text-blue-400 text-sm">{t('You can cancel your subscription at any time. The cancellation will take effect at the end of your current billing period.')}</p>
            </div>
          </div>

          {/* Section 6: Termination */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('6. Account Termination')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('Either party may terminate your account:')}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 dark:text-gray-200">{t('By You')}:</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>{t('Delete your account anytime')}</li>
                  <li>{t('Contact support for assistance')}</li>
                  <li>{t('Data deletion within 30 days')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 dark:text-gray-200">{t('By Us')}:</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>{t('Violation of terms')}</li>
                  <li>{t('Inappropriate behavior')}</li>
                  <li>{t('Suspicious activity')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 7: Liability */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('7. Limitation of Liability')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('2Sweety provides the service as is and makes no warranties regarding:')}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
              <li>{t('Compatibility or success in finding matches')}</li>
              <li>{t('Accuracy of user-provided information')}</li>
              <li>{t('Uninterrupted service availability')}</li>
              <li>{t('Security against all possible threats')}</li>
            </ul>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FaExclamationTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-1" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-300">{t('User Safety')}</p>
                  <p className="text-red-700 dark:text-red-400 text-sm">{t('While we strive to provide a safe environment, users are responsible for their own safety when meeting others.')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8: Governing Law */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('8. Governing Law and Disputes')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('These terms are governed by the laws of Sweden. Any disputes will be resolved in the courts of Stockholm, Sweden.')}
            </p>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FaBalanceScale className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-1" />
                <div>
                  <p className="font-semibold dark:text-gray-200">{t('Dispute Resolution')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('We encourage resolving disputes through our customer support before legal proceedings.')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 9: Changes to Terms */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('9. Changes to These Terms')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('We may update these Terms of Service to reflect changes in our service or legal requirements. We will notify users of significant changes through the app or email.')}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              {t('Your continued use of 2Sweety after changes constitutes acceptance of the updated terms.')}
            </p>
          </div>

          {/* Section 10: Contact */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 dark:from-gray-700 dark:via-gray-800 dark:to-gray-800 text-white shadow-xl rounded-lg p-8">
            <FaFileAlt className="w-12 h-12 mx-auto mb-4 text-white drop-shadow-lg" />
            <h3 className="text-2xl font-bold mb-4 text-center text-white">{t('Questions About These Terms?')}</h3>
            <p className="mb-6 text-blue-100 dark:text-gray-300 text-center">
              {t('If you have any questions about these Terms of Service, please contact us')}
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-white">📧 {t('Legal Inquiries')}:</h4>
                <p className="text-sm text-blue-100 dark:text-gray-300">legal@2sweety.com</p>
              </div>
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-white">💬 {t('General Support')}:</h4>
                <p className="text-sm text-blue-100 dark:text-gray-300">support@2sweety.com</p>
              </div>
            </div>
            <div className="mt-6 text-sm text-blue-200 dark:text-gray-300 text-center">
              <p>{t('Available 24/7')} • {t('Response within 24 hours')}</p>
            </div>
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img src="/logo.png" alt="2Sweety" className="h-10 mb-4" />
              <p className="text-gray-400">{t('Find your perfect match today')}</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('Company')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/page/about" className="hover:text-white no-underline">{t('About Us')}</Link></li>
                <li><Link to="/page/contact" className="hover:text-white no-underline">{t('Contact')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('Legal')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white no-underline">{t('Privacy Policy')}</Link></li>
                <li><Link to="/terms" className="hover:text-white no-underline">{t('Terms of Service')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('Follow Us')}</h4>
              <p className="text-gray-400">{t('Stay connected with 2Sweety')}</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 2Sweety. {t('All rights reserved.')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;
/* jshint ignore:end */
