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

          {/* Payment Methods Section */}
          <div>
            <h4 className="font-bold mb-4">{t('We Accept')}</h4>
            <div className="flex flex-wrap gap-3">
              {/* Visa */}
              <div className="bg-white rounded-md p-2 h-10 w-14 flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="h-6 w-auto">
                  <path fill="#1565C0" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"/>
                  <path fill="#FFF" d="M15.186 19l-2.626 7.832c0 0-.667-3.313-.733-3.729-1.495-3.411-3.701-3.221-3.701-3.221L10.726 30v-.002h3.161L18.258 19H15.186zM17.689 30L20.56 30 22.296 19 19.389 19zM38.008 19h-3.021l-4.71 11h2.852l.588-1.571h3.596L37.619 30h2.613L38.008 19zM34.513 26.328l1.563-4.157.818 4.157H34.513zM26.369 22.206c0-.606.498-1.057 1.926-1.057.928 0 1.991.674 1.991.674l.466-2.309c0 0-1.358-.515-2.691-.515-3.019 0-4.576 1.444-4.576 3.272 0 3.306 3.979 2.853 3.979 4.551 0 .291-.231.964-1.888.964-1.662 0-2.759-.609-2.759-.609l-.495 2.216c0 0 1.063.606 3.117.606 2.059 0 4.915-1.54 4.915-3.752C30.354 23.586 26.369 23.394 26.369 22.206z"/>
                </svg>
              </div>
              {/* Mastercard */}
              <div className="bg-white rounded-md p-2 h-10 w-14 flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="h-6 w-auto">
                  <path fill="#ff9800" d="M32 10A14 14 0 1 0 32 38A14 14 0 1 0 32 10Z"/>
                  <path fill="#d50000" d="M16 10A14 14 0 1 0 16 38A14 14 0 1 0 16 10Z"/>
                  <path fill="#ff3d00" d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48 C20.376,15.05,18,19.245,18,24z"/>
                </svg>
              </div>
              {/* Apple Pay */}
              <div className="bg-white rounded-md p-2 h-10 w-14 flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="h-6 w-auto">
                  <path fill="#212121" d="M42,37c0,2.762-2.238,5-5,5H11c-2.762,0-5-2.238-5-5V11c0-2.762,2.238-5,5-5h26c2.762,0,5,2.238,5,5V37z"/>
                  <path fill="#fff" d="M16.649,20.424c0.375-0.468,0.629-1.12,0.559-1.769c-0.539,0.022-1.193,0.359-1.58,0.813 c-0.346,0.399-0.649,1.037-0.567,1.651C15.632,21.17,16.274,20.879,16.649,20.424z"/>
                  <path fill="#fff" d="M17.197,21.259c-0.873-0.052-1.618,0.496-2.033,0.496c-0.418,0-1.061-0.47-1.746-0.457 c-0.899,0.013-1.726,0.522-2.188,1.328c-0.935,1.612-0.239,4.001,0.67,5.313c0.444,0.643,0.973,1.364,1.67,1.338 c0.67-0.026,0.922-0.434,1.732-0.434c0.808,0,1.035,0.434,1.745,0.421c0.722-0.013,1.178-0.656,1.622-1.3 c0.511-0.743,0.722-1.464,0.735-1.503c-0.016-0.013-1.412-0.543-1.425-2.155c-0.013-1.348,1.101-1.995,1.152-2.03 C18.534,21.508,17.689,21.298,17.197,21.259z"/>
                  <path fill="#fff" d="M25.359 27.768L25.359 21.396 27.637 21.396C29.192 21.396 30.257 22.451 30.257 24.065 30.257 25.68 29.18 26.746 27.602 26.746L26.619 26.746 26.619 27.768 25.359 27.768zM26.619 22.426L26.619 25.727 27.417 25.727C28.41 25.727 28.973 25.166 28.973 24.071 28.973 22.976 28.41 22.426 27.423 22.426L26.619 22.426zM33.377 27.861C32.32 27.861 31.565 27.263 31.528 26.418L32.707 26.418C32.762 26.852 33.143 27.133 33.431 27.133 34.014 27.133 34.346 26.864 34.346 26.43 34.346 26.002 34.014 25.727 33.364 25.727L32.82 25.727 32.82 24.808 33.346 24.808C33.904 24.808 34.217 24.545 34.217 24.135 34.217 23.748 33.928 23.491 33.4 23.491 32.898 23.491 32.56 23.76 32.517 24.164L31.387 24.164C31.424 23.295 32.203 22.691 33.424 22.691 34.547 22.691 35.354 23.247 35.354 24.053 35.354 24.615 34.936 25.08 34.346 25.176L34.346 25.213C35.098 25.285 35.516 25.768 35.516 26.399C35.516 27.269 34.632 27.861 33.377 27.861zM37.002 28.103L35.817 28.103 37.773 22.276 39.119 22.276 41.069 28.103 39.884 28.103 39.409 26.582 37.471 26.582 37.002 28.103zM38.44 23.368L37.724 25.69 39.156 25.69 38.446 23.368 38.44 23.368z"/>
                </svg>
              </div>
              {/* Google Pay */}
              <div className="bg-white rounded-md p-2 h-10 w-14 flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="h-6 w-auto">
                  <path fill="#4285F4" d="M41.9,24.1c0-1.4-0.1-2.4-0.4-3.5H24v6.3h10.2c-0.2,1.5-1.3,3.7-3.8,5.2l5.8,4.5C39.7,33.5,41.9,29.2,41.9,24.1z"/>
                  <path fill="#34A853" d="M24,44c5.2,0,9.6-1.7,12.8-4.7l-5.8-4.5c-1.7,1.2-4,1.9-7,1.9c-5.4,0-9.9-3.6-11.5-8.5l-6,4.6C9.5,39.3,16.2,44,24,44z"/>
                  <path fill="#FBBC05" d="M12.5,28.2c-0.5-1.4-0.7-2.8-0.7-4.2s0.3-2.9,0.7-4.2l-6-4.6C5,18.1,4,21,4,24s1,5.9,2.5,8.8L12.5,28.2z"/>
                  <path fill="#EA4335" d="M24,9.5c3,0,5.1,1.3,6.2,2.4l4.7-4.5C31.5,4.5,28.2,3,24,3C16.2,3,9.5,7.7,6.5,15.2l6,4.6C14.1,14.1,18.6,9.5,24,9.5z"/>
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-3">{t('Secure payments')}</p>
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
