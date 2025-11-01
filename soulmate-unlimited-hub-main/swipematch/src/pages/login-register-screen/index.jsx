// src/pages/login-register-screen/index.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';

const LoginRegisterScreen = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    rememberMe: false,
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Mock credentials for testing
  const mockCredentials = {
    email: 'demo@2sweety.com',
    password: '2Sweety123!'
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
      if (!formData.birthdate) {
        newErrors.birthdate = 'Birthdate is required';
      } else {
        const age = new Date().getFullYear() - new Date(formData.birthdate).getFullYear();
        if (age < 18) {
          newErrors.birthdate = 'You must be at least 18 years old';
        }
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (isLogin) {
        // Check mock credentials for login
        if (formData.email === mockCredentials.email && formData.password === mockCredentials.password) {
          console.log('Login successful');
          navigate('/profile-discovery-swipe-screen');
        } else {
          setErrors({
            email: 'Invalid credentials. Use demo@2sweety.com / 2Sweety123!',
            password: 'Invalid credentials. Use demo@2sweety.com / 2Sweety123!'
          });
        }
      } else {
        // Registration success
        console.log('Registration successful', formData);
        navigate('/profile-creation-edit-screen');
      }
      setIsLoading(false);
    }, 2000);
  };

  const handleSocialAuth = (provider) => {
    console.log(`Authenticating with ${provider}...`);
    // Simulate social auth success
    setTimeout(() => {
      navigate('/profile-discovery-swipe-screen');
    }, 1500);
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      birthdate: '',
      rememberMe: false,
      agreeToTerms: false
    });
    setErrors({});
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // Navigate to forgot password flow
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full animate-pulse-slow"></div>
          <div className="absolute top-40 right-20 w-20 h-20 bg-secondary rounded-full animate-float"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-accent rounded-full animate-pulse-slow"></div>
        </div>

        <div className="relative z-10 px-4 pt-12 pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-brand-lg">
                    <Icon name="Heart" size={48} color="white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                </div>
              </div>
              <h1 className="text-6xl md:text-7xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                2Sweety
              </h1>
              <p className="text-xl md:text-2xl text-text-secondary font-body max-w-2xl mx-auto leading-relaxed">
                Where meaningful connections begin. Find your perfect match in a safe, authentic environment.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="Shield" size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">Safe & Secure</h3>
                <p className="text-text-secondary">Verified profiles and advanced privacy controls</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="Users" size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">Real Connections</h3>
                <p className="text-text-secondary">Meet genuine people looking for meaningful relationships</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="Sparkles" size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">Smart Matching</h3>
                <p className="text-text-secondary">AI-powered algorithm finds your perfect match</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Section */}
      <div className="relative z-20 px-4 pb-12">
        <div className="max-w-md mx-auto">
          {/* Tab Controls */}
          <div className="bg-white rounded-2xl shadow-elevated overflow-hidden mb-6">
            <div className="flex">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-4 px-6 font-heading font-semibold transition-all duration-300 ${
                  isLogin
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-brand-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-hover-bg'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 px-6 font-heading font-semibold transition-all duration-300 ${
                  !isLogin
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-brand-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-hover-bg'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Authentication Form */}
          <div className="bg-white rounded-2xl shadow-elevated p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-heading font-semibold text-text-primary mb-3">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 border-2 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 font-body ${
                        errors.name ? 'border-error' : 'border-border hover:border-primary/30'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-error font-body">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-heading font-semibold text-text-primary mb-3">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 border-2 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 font-body ${
                        errors.phone ? 'border-error' : 'border-border hover:border-primary/30'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-error font-body">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="birthdate" className="block text-sm font-heading font-semibold text-text-primary mb-3">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      id="birthdate"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 border-2 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 font-body ${
                        errors.birthdate ? 'border-error' : 'border-border hover:border-primary/30'
                      }`}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    />
                    {errors.birthdate && (
                      <p className="mt-2 text-sm text-error font-body">{errors.birthdate}</p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-heading font-semibold text-text-primary mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 border-2 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 font-body ${
                    errors.email ? 'border-error' : 'border-border hover:border-primary/30'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-error font-body">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-heading font-semibold text-text-primary mb-3">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 pr-12 border-2 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 font-body ${
                      errors.password ? 'border-error' : 'border-border hover:border-primary/30'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary transition-colors duration-300"
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-error font-body">{errors.password}</p>
                )}
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-heading font-semibold text-text-primary mb-3">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 pr-12 border-2 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 font-body ${
                        errors.confirmPassword ? 'border-error' : 'border-border hover:border-primary/30'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary transition-colors duration-300"
                    >
                      <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={20} />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-error font-body">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-primary border-2 border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor="rememberMe" className="text-sm font-body text-text-secondary">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm font-body text-primary hover:text-secondary transition-colors duration-300"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {!isLogin && (
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="mt-1 w-5 h-5 text-primary border-2 border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="agreeToTerms" className="text-sm font-body text-text-secondary">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:text-secondary transition-colors duration-300">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary hover:text-secondary transition-colors duration-300">Privacy Policy</a>
                    {' '}and confirm I am 18+ years old
                  </label>
                </div>
              )}
              {errors.agreeToTerms && (
                <p className="text-sm text-error font-body">{errors.agreeToTerms}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-heading font-semibold py-4 px-4 rounded-button hover:shadow-brand-md transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3 min-h-touch"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <>
                    <Icon name={isLogin ? 'LogIn' : 'UserPlus'} size={20} />
                    <span>{isLogin ? 'Sign In to 2Sweety' : 'Join 2Sweety'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Social Authentication */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-text-secondary font-body">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Google')}
                  className="w-full flex items-center justify-center px-4 py-4 border-2 border-border rounded-button hover:border-primary/30 hover:bg-hover-bg transition-all duration-300 min-h-touch"
                >
                  <Icon name="Chrome" size={20} className="text-text-secondary mr-3" />
                  <span className="font-body text-text-primary font-medium">Continue with Google</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Facebook')}
                  className="w-full flex items-center justify-center px-4 py-4 border-2 border-border rounded-button hover:border-primary/30 hover:bg-hover-bg transition-all duration-300 min-h-touch"
                >
                  <Icon name="Facebook" size={20} className="text-text-secondary mr-3" />
                  <span className="font-body text-text-primary font-medium">Continue with Facebook</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialAuth('Apple')}
                  className="w-full flex items-center justify-center px-4 py-4 border-2 border-border rounded-button hover:border-primary/30 hover:bg-hover-bg transition-all duration-300 min-h-touch"
                >
                  <Icon name="Apple" size={20} className="text-text-secondary mr-3" />
                  <span className="font-body text-text-primary font-medium">Continue with Apple</span>
                </button>
              </div>
            </div>

            {/* Toggle Auth Mode */}
            <div className="mt-8 text-center">
              <p className="text-text-secondary font-body">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="ml-2 text-primary hover:text-secondary font-semibold transition-colors duration-300"
                >
                  {isLogin ? 'Join 2Sweety' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          {/* Demo Credentials Info */}
          {isLogin && (
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-brand">
              <p className="text-sm font-body text-text-secondary text-center">
                <Icon name="Info" size={16} className="inline mr-2" />
                Demo: {mockCredentials.email} / {mockCredentials.password}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 px-4">
        <p className="text-text-secondary font-body text-sm">
          © 2024 2Sweety. All rights reserved. Made with ❤️ for meaningful connections.
        </p>
      </div>
    </div>
  );
};

export default LoginRegisterScreen;