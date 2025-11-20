/* jshint esversion: 6 */
/* jshint ignore:start */
import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from '../Context/MyProvider';
import { useTranslation } from 'react-i18next';
import {
    FaHeart,
    FaStar,
    FaComments,
    FaShieldAlt,
    FaUserPlus,
    FaEye,
    FaUndo,
    FaBolt
} from 'react-icons/fa';

const Home = () => {
    const { setValidateId } = useContext(MyContext);
    const { t } = useTranslation();

    useEffect(() => {
        setValidateId(false);
    }, [setValidateId]);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden pt-24 md:pt-32">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5"></div>

                <div className="relative container mx-auto px-4 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="text-left">
                            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                <span className="text-gray-800 dark:text-white">{t('Find Your')}</span>
                                <br />
                                <span className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
                                    {t('Perfect Match')}
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                {t('Join millions on 2Sweety')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center no-underline"
                                >
                                    <FaHeart className="w-5 h-5 mr-2" />
                                    {t('Join Free Now')}
                                </Link>
                                <Link
                                    to="/login"
                                    className="border-2 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-8 py-4 text-lg rounded-full transition-all duration-300 flex items-center justify-center no-underline"
                                >
                                    {t('I have an account')}
                                </Link>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                    <FaShieldAlt className="w-4 h-4 mr-1 text-green-500" />
                                    <span>{t('Safe & Verified')}</span>
                                </div>
                                <div className="flex items-center">
                                    <FaStar className="w-4 h-4 mr-1 text-yellow-500" />
                                    <span>4.8★ {t('Rating')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Profile Cards */}
                        <div className="relative">
                            <div className="relative bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-3xl p-8 shadow-2xl">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Profile Card 1 */}
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                        <div className="w-full aspect-[3/4] bg-gradient-to-br from-primary-300 to-secondary-300 rounded-xl mb-3 overflow-hidden">
                                            <img
                                                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop"
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white">Sarah, 25</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">New York, NY</p>
                                    </div>

                                    {/* Profile Card 2 */}
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300 mt-8">
                                        <div className="w-full aspect-[3/4] bg-gradient-to-br from-accent-300 to-secondary-300 rounded-xl mb-3 overflow-hidden">
                                            <img
                                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop"
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white">Michael, 28</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Los Angeles, CA</p>
                                    </div>
                                </div>

                                {/* Floating Hearts */}
                                <div className="absolute -top-4 -right-4 text-primary-500">
                                    <FaHeart className="w-8 h-8 animate-pulse" fill="currentColor" />
                                </div>
                                <div className="absolute -bottom-4 -left-4 text-secondary-500">
                                    <FaHeart className="w-6 h-6 animate-pulse" fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                            {t('Why Choose')} <span className="text-primary-500">2Sweety</span>?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            {t('Experience the most advanced')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FaStar className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('Smart Matching')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t('Smart Matching Description')}
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FaShieldAlt className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('Safe Environment')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t('Safe Environment Description')}
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FaComments className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('Instant Connection')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {t('Instant Connection Description')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Stories Section */}
            <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                            {t('Success Stories')}
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            {t('Real stories from couples')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Testimonial 1 */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="flex items-center mb-6">
                                    <div className="flex -space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold">
                                            S
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-400 to-secondary-400 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold">
                                            E
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="font-bold text-gray-800 dark:text-white">Sara & Erik</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Stockholm</p>
                                    </div>
                                </div>
                                <div className="text-yellow-400 mb-3 flex">
                                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
                                    "{t('Testimonial 1')}"
                                </p>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-primary-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="flex items-center mb-6">
                                    <div className="flex -space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-primary-400 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold">
                                            E
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold">
                                            J
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="font-bold text-gray-800 dark:text-white">Emma & James</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Göteborg</p>
                                    </div>
                                </div>
                                <div className="text-yellow-400 mb-3 flex">
                                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
                                    "{t('Testimonial 2')}"
                                </p>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-secondary-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
                            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="flex items-center mb-6">
                                    <div className="flex -space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-400 to-secondary-400 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold">
                                            A
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-400 to-primary-400 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold">
                                            J
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="font-bold text-gray-800 dark:text-white">Anna & Johan</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Malmö</p>
                                    </div>
                                </div>
                                <div className="text-yellow-400 mb-3 flex">
                                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
                                    "{t('Testimonial 3')}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                            {t('How It Works')}
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            {t('3 simple steps')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Step 1 */}
                        <div className="relative">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
                                1
                            </div>
                            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 pt-12 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6">
                                    <FaUserPlus className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('Create Profile')}</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                    {t('Create Profile Description')}
                                </p>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors no-underline"
                                >
                                    {t('Get Started')}
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
                                2
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 pt-12 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-primary-500 rounded-2xl flex items-center justify-center mb-6">
                                    <FaHeart className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('Discover & Match')}</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                    {t('Discover & Match Description')}
                                </p>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors no-underline"
                                >
                                    {t('See Matches')}
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
                                3
                            </div>
                            <div className="bg-gradient-to-br from-pink-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 pt-12 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-6">
                                    <FaComments className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('Chat & Meet')}</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                    {t('Chat & Meet Description')}
                                </p>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors no-underline"
                                >
                                    {t('Start Messaging')}
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="transform hover:scale-110 transition-transform duration-300">
                            <div className="text-5xl font-bold mb-2">10M+</div>
                            <div className="text-lg opacity-90">{t('Active Users')}</div>
                        </div>
                        <div className="transform hover:scale-110 transition-transform duration-300">
                            <div className="text-5xl font-bold mb-2">2M+</div>
                            <div className="text-lg opacity-90">{t('Matches Made')}</div>
                        </div>
                        <div className="transform hover:scale-110 transition-transform duration-300">
                            <div className="text-5xl font-bold mb-2">4.8★</div>
                            <div className="text-lg opacity-90">{t('Average Rating')}</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Features Section */}
            <section id="premium" className="py-20 bg-gradient-to-br from-purple-900 via-primary-900 to-secondary-900 text-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-primary-500 rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-72 h-72 bg-secondary-500 rounded-full filter blur-3xl"></div>
                </div>

                <div className="relative container mx-auto px-4">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full mb-4">
                            <FaStar className="w-4 h-4 mr-2" />
                            <span className="font-semibold">Premium</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-4">{t('Premium Features')}</h2>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-2">
                            {t('Upgrade to Premium')}
                        </p>
                        <p className="text-lg text-yellow-300 font-semibold">
                            {t('Choose your plan')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {/* Premium Feature 1 - Unlimited Likes */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <FaHeart className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{t('Unlimited Likes')}</h3>
                            <p className="text-white/80 mb-4 leading-relaxed">
                                {t('Unlimited Likes Description')}
                            </p>
                            <div className="flex items-center text-pink-300">
                                <span className="text-2xl mr-2">∞</span>
                                <span className="font-semibold">{t('Unlimited')}</span>
                            </div>
                        </div>

                        {/* Premium Feature 2 - See Who Likes You */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <FaEye className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{t('See Who Likes You')}</h3>
                            <p className="text-white/80 mb-4 leading-relaxed">
                                {t('See Who Likes You Description')}
                            </p>
                            <div className="flex items-center text-purple-300">
                                <span className="text-2xl mr-2">👀</span>
                                <span className="font-semibold">{t('Full Visibility')}</span>
                            </div>
                        </div>

                        {/* Premium Feature 3 - Super Likes */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <FaStar className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{t('Super Likes')}</h3>
                            <p className="text-white/80 mb-4 leading-relaxed">
                                {t('Super Likes Description')}
                            </p>
                            <div className="flex items-center text-yellow-300">
                                <span className="text-2xl mr-2">⭐</span>
                                <span className="font-semibold">5/{t('per day')}</span>
                            </div>
                        </div>

                        {/* Premium Feature 4 - Rewind */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <FaUndo className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{t('Rewind')}</h3>
                            <p className="text-white/80 mb-4 leading-relaxed">
                                {t('Rewind Description')}
                            </p>
                            <div className="flex items-center text-cyan-300">
                                <span className="text-2xl mr-2">↩️</span>
                                <span className="font-semibold">{t('Unlimited Rewind')}</span>
                            </div>
                        </div>

                        {/* Premium Feature 5 - Boost Profile */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <FaBolt className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{t('Boost')}</h3>
                            <p className="text-white/80 mb-4 leading-relaxed">
                                {t('Boost Description')}
                            </p>
                            <div className="flex items-center text-purple-300">
                                <span className="text-2xl mr-2">⚡</span>
                                <span className="font-semibold">1 {t('per month')}</span>
                            </div>
                        </div>

                        {/* Premium Feature 6 - No Ads */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <FaShieldAlt className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">{t('Ad-Free')}</h3>
                            <p className="text-white/80 mb-4 leading-relaxed">
                                {t('Ad-Free Description')}
                            </p>
                            <div className="flex items-center text-green-300">
                                <span className="text-2xl mr-2">🚫</span>
                                <span className="font-semibold">{t('Ad-Free')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Premium CTA Button */}
                    <div className="text-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold px-12 py-5 text-xl rounded-full shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 transform hover:scale-105 no-underline"
                        >
                            <FaStar className="w-6 h-6 mr-3" />
                            {t('Upgrade from')}
                        </Link>
                        <p className="mt-4 text-white/70 text-sm">{t('Choose plan and start')}</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
                        {t('Ready to Find')} <span className="text-primary-500">{t('Perfect Match')}</span>?
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        {t('Join 2Sweety today')}
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-10 py-5 text-xl rounded-full shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-105 no-underline"
                    >
                        <FaHeart className="w-6 h-6 mr-2" />
                        {t('Join 2Sweety Now')}
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <img src="/logo.png" alt="2Sweety" className="h-10 mb-4" />
                            <p className="text-gray-400">{t('Find your perfect match')}</p>
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
                                <li><Link to="/page/privacy" className="hover:text-white no-underline">{t('Privacy Policy')}</Link></li>
                                <li><Link to="/page/terms" className="hover:text-white no-underline">{t('Terms of Service')}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">{t('Follow Us')}</h4>
                            <p className="text-gray-400">{t('Stay connected')}</p>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 2Sweety. {t('All rights reserved')}.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
/* jshint ignore:end */
