/* jshint esversion: 6 */
/* jshint ignore:start */
import React from "react";
import { Link } from "react-router-dom";
import { FaShieldAlt, FaEye, FaLock, FaUsers, FaDatabase, FaGlobe, FaClock, FaEnvelope } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <FaShieldAlt className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto" />
              <div className="absolute -top-2 -right-2">
                <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 px-2 py-1 rounded text-xs font-semibold">
                  {t('Privacy')}
                </span>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            {t('Privacy Policy')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('Your privacy is our priority. Learn how we collect, use, and protect your personal information.')}
          </p>
          <div className="mt-6 inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FaClock className="w-4 h-4 mr-2" />
            {t('Last updated')}: {t('December 2024')}
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Privacy Overview */}
          <div className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-gray-800/80 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FaShieldAlt className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-2xl font-bold">{t('Privacy at a Glance')}</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('At 2Sweety, we are committed to protecting your privacy and ensuring the security of your personal data. This policy complies with GDPR and other international privacy regulations.')}
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                <FaLock className="w-8 h-8 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
                <div className="font-semibold text-sm dark:text-gray-200">{t('256-bit SSL')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('Encryption')}</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                <FaDatabase className="w-8 h-8 text-purple-500 dark:text-purple-400 mx-auto mb-2" />
                <div className="font-semibold text-sm dark:text-gray-200">{t('Secure Storage')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('Encrypted Databases')}</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                <FaEye className="w-8 h-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
                <div className="font-semibold text-sm dark:text-gray-200">{t('Your Control')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('Privacy Settings')}</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-700/50 rounded-lg">
                <FaGlobe className="w-8 h-8 text-orange-500 dark:text-orange-400 mx-auto mb-2" />
                <div className="font-semibold text-sm dark:text-gray-200">{t('GDPR')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('Compliant')}</div>
              </div>
            </div>
          </div>

          {/* Information We Collect */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('1. Information We Collect')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('We collect information to provide you with the best dating experience while maintaining your privacy and security.')}
            </p>

            <div className="space-y-4">
              <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/10">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">{t('Information You Provide (Mandatory)')}</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>{t('Name, age, and gender')}</li>
                  <li>{t('Email address and phone number')}</li>
                  <li>{t('Profile photos and bio')}</li>
                  <li>{t('Location (for matching purposes)')}</li>
                  <li>{t('Interests and preferences')}</li>
                </ul>
              </div>

              <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50/50 dark:bg-green-900/10">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3">{t('Optional Information')}</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>{t('Education and occupation details')}</li>
                  <li>{t('Social media connections')}</li>
                  <li>{t('Additional profile information')}</li>
                  <li>{t('Premium feature preferences')}</li>
                </ul>
              </div>

              <div className="border border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50/50 dark:bg-purple-900/10">
                <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-3">{t('Automatically Collected')}</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>{t('Device information and IP address')}</li>
                  <li>{t('App usage analytics')}</li>
                  <li>{t('Location data (with permission)')}</li>
                  <li>{t('Log files and crash reports')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('2. How We Use Your Information')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('We use your information for the following purposes:')}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FaUsers className="w-5 h-5 text-pink-500 dark:text-pink-400 mt-1" />
                  <div>
                    <p className="font-semibold dark:text-gray-200">{t('Service Delivery')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('Creating matches, enabling communication, and personalizing your experience')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaShieldAlt className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-1" />
                  <div>
                    <p className="font-semibold dark:text-gray-200">{t('Security & Verification')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('Preventing fraud, ensuring safety, and maintaining community standards')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FaDatabase className="w-5 h-5 text-green-500 dark:text-green-400 mt-1" />
                  <div>
                    <p className="font-semibold dark:text-gray-200">{t('Service Improvement')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('Analytics, research, and developing new features')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaEnvelope className="w-5 h-5 text-purple-500 dark:text-purple-400 mt-1" />
                  <div>
                    <p className="font-semibold dark:text-gray-200">{t('Communication')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('Sending notifications, updates, and customer support')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Information Sharing */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('3. Information Sharing and Disclosure')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('We never sell your personal information. We may share your information only in the following limited circumstances:')}
            </p>

            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
              <li><strong className="dark:text-gray-200">{t('With Other Users')}:</strong> {t('Profile information you choose to display publicly')}</li>
              <li><strong className="dark:text-gray-200">{t('Service Providers')}:</strong> {t('Trusted partners who help us operate our service')}</li>
              <li><strong className="dark:text-gray-200">{t('Legal Requirements')}:</strong> {t('When required by law or to protect our rights')}</li>
              <li><strong className="dark:text-gray-200">{t('Business Transfers')}:</strong> {t('In case of merger or acquisition (with notice)')}</li>
            </ul>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-300 font-semibold">{t('We Never Share')}:</p>
              <p className="text-red-700 dark:text-red-400 text-sm">{t('Your private messages, financial information, or precise location data with third parties for marketing purposes.')}</p>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('4. Data Security Measures')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('We implement comprehensive security measures to protect your data:')}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 dark:text-gray-200">{t('Technical Safeguards')}:</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>{t('256-bit SSL encryption')}</li>
                  <li>{t('Encrypted database storage')}</li>
                  <li>{t('Regular security audits')}</li>
                  <li>{t('Secure data centers')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 dark:text-gray-200">{t('Operational Safeguards')}:</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <li>{t('Employee training programs')}</li>
                  <li>{t('Access controls and monitoring')}</li>
                  <li>{t('Incident response procedures')}</li>
                  <li>{t('ISO 27001 compliance')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('5. Your Privacy Rights')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('Under GDPR, you have the following rights regarding your personal data:')}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-sm dark:text-gray-200">{t('Right to Access')}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">{t('Request copies of your personal data')}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-semibold text-sm dark:text-gray-200">{t('Right to Correction')}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">{t('Update or correct inaccurate information')}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-semibold text-sm dark:text-gray-200">{t('Right to Deletion')}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">{t('Request deletion of your data')}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="font-semibold text-sm dark:text-gray-200">{t('Right to Portability')}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">{t('Export your data in readable format')}</p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-300 font-semibold">{t('Exercise Your Rights')}</p>
              <p className="text-blue-700 dark:text-blue-400 text-sm">{t('Contact privacy@2sweety.com or use the settings in your app to exercise these rights.')}</p>
            </div>
          </div>

          {/* Data Retention */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('6. Data Retention')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('We retain your data only as long as necessary for the purposes outlined in this policy:')}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-200">{t('Data Type')}</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-200">{t('Retention Period')}</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left dark:text-gray-200">{t('Reason')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="dark:bg-gray-800/50">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t('Profile Information')}</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t('Until account deletion')}</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t('Service provision')}</td>
                  </tr>
                  <tr className="dark:bg-gray-800/50">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t('Messages')}</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t('1 year after deletion')}</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t('Safety investigation')}</td>
                  </tr>
                  <tr className="dark:bg-gray-800/50">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t('Usage Analytics')}</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t('2 years')}</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t('Service improvement')}</td>
                  </tr>
                  <tr className="dark:bg-gray-800/50">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t('Support Records')}</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t('3 years')}</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 dark:text-gray-300">{t('Legal compliance')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cookies */}
          <div className="bg-white dark:bg-gray-800/80 dark:border-gray-600/50 border rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{t('7. Cookies and Tracking')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('We use cookies and similar technologies to improve your experience:')}
            </p>

            <div className="space-y-3 mb-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-semibold dark:text-gray-200">{t('Essential Cookies')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('Required for basic app functionality and security')}</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-semibold dark:text-gray-200">{t('Analytics Cookies')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('Help us understand how you use our service (with consent)')}</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="font-semibold dark:text-gray-200">{t('Preference Cookies')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('Remember your settings and preferences')}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('You can manage cookie preferences in your browser settings or through our privacy settings.')}
            </p>
          </div>

          {/* Contact and DPO */}
          <div className="bg-gradient-to-br from-green-600 via-green-700 to-blue-700 dark:from-gray-700 dark:via-gray-800 dark:to-gray-800 text-white shadow-xl rounded-lg p-8">
            <FaShieldAlt className="w-12 h-12 mx-auto mb-4 text-white drop-shadow-lg" />
            <h3 className="text-2xl font-bold mb-4 text-center text-white">{t('Data Protection Officer')}</h3>
            <p className="mb-6 text-green-100 dark:text-gray-300 text-center">
              {t('Our Data Protection Officer is available to help with privacy-related questions')}
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-white">🛡️ {t('Data Protection')}:</h4>
                <p className="text-sm text-green-100 dark:text-gray-300 mb-2">dpo@2sweety.com</p>
                <p className="text-sm text-green-100 dark:text-gray-300">{t('Privacy Officer')}</p>
              </div>
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-white">📧 {t('General Privacy')}:</h4>
                <p className="text-sm text-green-100 dark:text-gray-300 mb-1">privacy@2sweety.com</p>
                <p className="text-sm text-green-100 dark:text-gray-300">{t('Privacy Team')}</p>
              </div>
            </div>
            <div className="mt-6 text-sm text-green-200 dark:text-gray-300 text-center">
              <p>{t('Response within 72 hours')} • {t('GDPR Compliant')} • {t('Multi-language support')}</p>
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

export default PrivacyPolicy;
/* jshint ignore:end */
