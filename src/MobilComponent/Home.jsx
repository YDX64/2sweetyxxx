/* jshint esversion: 6 */
/* jshint ignore:start */
import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MyContext } from '../Context/MyProvider';
import SharedFooter from '../components/SharedFooter';
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
                                <span className="text-gray-800 dark:text-white">Find Your</span>
                                <br />
                                <span className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
                                    Perfect Match
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                Join millions on 2Sweety, the leading dating app. Meet singles, find love, and build meaningful relationships.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-105 flex items-center justify-center no-underline"
                                >
                                    <FaHeart className="w-5 h-5 mr-2" />
                                    Join Free Now
                                </Link>
                                <Link
                                    to="/login"
                                    className="border-2 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-8 py-4 text-lg rounded-full transition-all duration-300 flex items-center justify-center no-underline"
                                >
                                    I have an account
                                </Link>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center">
                                    <FaShieldAlt className="w-4 h-4 mr-1 text-green-500" />
                                    <span>Safe & Verified</span>
                                </div>
                                <div className="flex items-center">
                                    <FaStar className="w-4 h-4 mr-1 text-yellow-500" />
                                    <span>4.8★ Rating</span>
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
                            Why Choose <span className="text-primary-500">2Sweety</span>?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Experience the most advanced matching algorithm and connect with like-minded singles
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FaStar className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Smart Matching</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Our AI-powered algorithm finds your perfect match based on interests, values, and compatibility
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FaShieldAlt className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Safe Environment</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Verified profiles, photo verification, and 24/7 moderation keep our community safe and authentic
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <FaComments className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Instant Connection</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Chat, video call, and send voice messages instantly when you match with someone special
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
                            Success Stories
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Real stories from couples who found love on 2Sweety
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
                                    "We met on 2Sweety and it was love at first chat! Now we're planning our wedding. Thank you for bringing us together!"
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
                                    "The best dating app I've ever used. Found my perfect match in just two weeks! Couldn't be happier with 2Sweety."
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
                                    "Amazing algorithm that really understands compatibility. We connected instantly and haven't looked back since. Highly recommend!"
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
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            3 simple steps to find love on 2Sweety
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
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Create Profile</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                    Create an amazing profile in just a few minutes. Add your photos, introduce yourself, and share what makes you unique.
                                </p>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors no-underline"
                                >
                                    Get Started
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
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Discover & Match</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                    Discover compatible people with our smart algorithm. Swipe, like, and when you both match, it's time to connect!
                                </p>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors no-underline"
                                >
                                    See Matches
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
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Chat & Meet</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                    Start meaningful conversations after matching. Share your interests, plan your first date, and build a real connection!
                                </p>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors no-underline"
                                >
                                    Start Messaging
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
                            <div className="text-lg opacity-90">Active Users</div>
                        </div>
                        <div className="transform hover:scale-110 transition-transform duration-300">
                            <div className="text-5xl font-bold mb-2">2M+</div>
                            <div className="text-lg opacity-90">Matches Made</div>
                        </div>
                        <div className="transform hover:scale-110 transition-transform duration-300">
                            <div className="text-5xl font-bold mb-2">4.8★</div>
                            <div className="text-lg opacity-90">Average Rating</div>
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
                        <h2 className="text-4xl font-bold mb-4">Premiumfunktioner</h2>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-2">
                            Uppgradera till Premium för fler matchningar och specialfunktioner
                        </p>
                        <p className="text-lg text-yellow-300 font-semibold">
                            Välj din plan
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {/* Premium Feature 1 - Unlimited Likes */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <FaHeart className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Obegränsade Likes</h3>
                            <p className="text-white/80 mb-4 leading-relaxed">
                                Like as many profiles as you want without limits
                            </p>
                            <div className="flex items-center text-pink-300">
                                <span className="text-2xl mr-2">∞</span>
                                <span className="font-semibold">Unlimited</span>
                            </div>
                        </div>

                        {/* Premium Feature 2 - See Who Likes You */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <FaEye className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Se Vem Som Gillar Dig</h3>
                            <p className="text-white/80 mb-4 leading-relaxed">
                                See everyone who has liked your profile and match instantly
                            </p>
                            <div className="flex items-center text-purple-300">
                                <span className="text-2xl mr-2">👀</span>
                                <span className="font-semibold">Full Visibility</span>
                            </div>
                        </div>

                        {/* Premium Feature 3 - Super Likes */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <FaStar className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Super Likes</h3>
                            <p className="text-white/80 mb-4 leading-relaxed">
                                Stand out with 5 Super Likes per day to get noticed
                            </p>
                            <div className="flex items-center text-yellow-300">
                                <span className="text-2xl mr-2">⭐</span>
                                <span className="font-semibold">5/day</span>
                            </div>
                        </div>

                        {/* Premium Feature 4 - Rewind */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <FaUndo className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Ångra</h3>
                            <p className="text-white/80 mb-4 leading-relaxed">
                                Go back and give profiles a second chance
                            </p>
                            <div className="flex items-center text-cyan-300">
                                <span className="text-2xl mr-2">↩️</span>
                                <span className="font-semibold">Unlimited Rewind</span>
                            </div>
                        </div>

                        {/* Premium Feature 5 - Boost Profile */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <FaBolt className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Boost</h3>
                            <p className="text-white/80 mb-4 leading-relaxed">
                                Be the top profile in your area for 30 minutes
                            </p>
                            <div className="flex items-center text-purple-300">
                                <span className="text-2xl mr-2">⚡</span>
                                <span className="font-semibold">1 per month</span>
                            </div>
                        </div>

                        {/* Premium Feature 6 - No Ads */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                                <FaShieldAlt className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Reklamfritt</h3>
                            <p className="text-white/80 mb-4 leading-relaxed">
                                Enjoy an ad-free experience while using the app
                            </p>
                            <div className="flex items-center text-green-300">
                                <span className="text-2xl mr-2">🚫</span>
                                <span className="font-semibold">Ad-Free</span>
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
                            Uppgradera från $9.99/månad
                        </Link>
                        <p className="mt-4 text-white/70 text-sm">Choose your plan and start getting more matches today</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6">
                        Ready to Find Your <span className="text-primary-500">Perfect Match</span>?
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        Join 2Sweety today and start your journey to finding love. It's free to sign up!
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-10 py-5 text-xl rounded-full shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-105 no-underline"
                    >
                        <FaHeart className="w-6 h-6 mr-2" />
                        Join 2Sweety Now
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <SharedFooter />
        </div>
    );
};

export default Home;
/* jshint ignore:end */
