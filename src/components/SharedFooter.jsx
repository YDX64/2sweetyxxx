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
            <p className="text-gray-400">Find your perfect match with 2Sweety</p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/page/about" className="hover:text-white no-underline transition-colors">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link to="/page/contact" className="hover:text-white no-underline transition-colors">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
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

          {/* Social/Contact Section */}
          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <p className="text-gray-400">Stay connected with 2Sweety</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} 2Sweety. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default SharedFooter;
/* jshint ignore:end */
