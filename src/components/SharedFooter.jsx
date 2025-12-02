/* jshint esversion: 6 */
/* jshint ignore:start */
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SharedFooter = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <img src="/logo.png" alt="2Sweety" className="h-10 mb-4" />
            <p className="text-gray-400">{t('Find your perfect match')}</p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold mb-4">{t('Company')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/about" className="hover:text-white no-underline transition-colors">
                  {t('About Us')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white no-underline transition-colors">
                  {t('Contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold mb-4">{t('Legal')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/privacy" className="hover:text-white no-underline transition-colors">
                  {t('Privacy Policy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white no-underline transition-colors">
                  {t('Terms of Service')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Methods Section */}
          <div>
            <h4 className="font-bold mb-4">{t('We Accept')}</h4>
            <div className="flex flex-wrap gap-3">
              {/* Use static assets to ensure visibility across themes */}
              <img src="/payments/visa.svg" alt="Visa" className="bg-white rounded-md p-2 h-10 w-14 object-contain" />
              <img src="/payments/mastercard.svg" alt="Mastercard" className="bg-white rounded-md p-2 h-10 w-14 object-contain" />
              <img src="/payments/applepay.svg" alt="Apple Pay" className="bg-white rounded-md p-2 h-10 w-14 object-contain" />
              <img src="/payments/googlepay.svg" alt="Google Pay" className="bg-white rounded-md p-2 h-10 w-14 object-contain" />
            </div>
            <p className="text-gray-500 text-xs mt-3">{t('Secure payments')}</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} 2Sweety. {t('All rights reserved.')}</p>
        </div>
      </div>
    </footer>
  );
};

export default SharedFooter;
/* jshint ignore:end */
