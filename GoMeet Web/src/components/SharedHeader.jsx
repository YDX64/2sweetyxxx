/* jshint esversion: 6 */
/* jshint ignore:start */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

const SharedHeader = ({ isAuthenticated = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: t('home'), isHash: false },
        { to: '/explore', label: t('Explore'), isHash: false },
        { to: '/chat', label: t('Messages'), isHash: false },
        { to: '/profile', label: t('Settings'), isHash: false },
      ]
    : [
        { to: '/', label: t('home'), isHash: false },
        { to: '#features', label: 'Features', isHash: true },
        { to: '#premium', label: t('Premium'), isHash: true },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="2Sweety Logo"
              className="h-12 w-auto object-contain group-hover:scale-110 transition-transform"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isHash ? (
                <a
                  key={link.to}
                  href={link.to}
                  className="text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 font-medium transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Right Section - Language & Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector />

            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                  {t('Get Started')}
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('UserId');
                  navigate('/');
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                {t('Log Out')}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-pink-500 transition-colors"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Navigation Links */}
            {navLinks.map((link) => (
              link.isHash ? (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 font-medium transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              )
            ))}

            {/* Mobile Language & Theme Selector */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <LanguageSelector />
            </div>

            {/* Mobile Auth Buttons */}
            {!isAuthenticated ? (
              <div className="pt-4 space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-4 py-2.5 text-center text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-700 rounded-full font-semibold hover:border-pink-500 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-4 py-2.5 text-center bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white rounded-full font-semibold"
                >
                  {t('Get Started')}
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('UserId');
                  setIsMobileMenuOpen(false);
                  navigate('/');
                }}
                className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white rounded-full font-semibold"
              >
                {t('Log Out')}
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default SharedHeader;
/* jshint ignore:end */
