/* jshint esversion: 6 */
/* jshint ignore:start */

import React, { useContext, useRef, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { FaGoogle, FaApple, FaFacebook, FaEye, FaEyeSlash, FaCheck, FaArrowRight, FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { MyContext } from "../Context/MyProvider";
import axios from "axios";
import { showTost } from "../showTost";
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation();
  const [Bio, setbio] = useState("");
  const [Name, setname] = useState("");
  const [Email, setemail] = useState("");
  const [Password, setpassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  const [ReferralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Form validation errors
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: ""
  });

  const { setName, setEmail, setPassword, setBio, basUrl } = useContext(MyContext);
  const navigation = useNavigate();
  const { t } = useTranslation();

  // Social Registration Handlers - Placeholder for future OAuth integration
  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
    // TODO: Implement Google OAuth
    showTost({ title: "Google signup coming soon!" });
  };

  const handleAppleSignup = () => {
    console.log('Apple signup clicked');
    // TODO: Implement Apple Sign In
    showTost({ title: "Apple signup coming soon!" });
  };

  const handleFacebookSignup = () => {
    console.log('Facebook signup clicked');
    // TODO: Implement Facebook Login
    showTost({ title: "Facebook signup coming soon!" });
  };

  const validateEmail = (email) => {
    const Validation = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    return Validation.test(email);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]+/)) strength += 25;
    if (password.match(/[A-Z]+/)) strength += 25;
    if (password.match(/[0-9]+/)) strength += 25;
    return strength;
  };

  const handlePasswordChange = (value) => {
    setpassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
    setErrors({ ...errors, password: "" });
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-orange-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return t("Weak");
    if (passwordStrength <= 50) return t("Fair");
    if (passwordStrength <= 75) return t("Good");
    return t("Strong");
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: ""
    };

    let isValid = true;

    if (!Name.trim()) {
      newErrors.name = t("Name is required");
      isValid = false;
    }

    if (!Email.trim()) {
      newErrors.email = t("Email is required");
      isValid = false;
    } else if (!validateEmail(Email)) {
      newErrors.email = t("Please enter a valid email");
      isValid = false;
    }

    if (!Password) {
      newErrors.password = t("Password is required");
      isValid = false;
    } else if (Password.length < 8) {
      newErrors.password = t("Password must be at least 6 characters");
      isValid = false;
    }

    if (!ConfirmPassword) {
      newErrors.confirmPassword = t("Please confirm your password");
      isValid = false;
    } else if (Password !== ConfirmPassword) {
      newErrors.confirmPassword = t("Passwords do not match");
      isValid = false;
    }

    if (!termsAccepted) {
      newErrors.terms = "You must accept the terms and conditions";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const SubmitHandler = () => {
    if (!validateForm()) {
      showTost({ title: "Please fix the errors before continuing" });
      return;
    }

    setIsLoading(true);

    axios
      .post(`${basUrl}email_check.php`, { email: Email })
      .then((res) => {
        setIsLoading(false);
        if (res.data.Result === "true") {
          setName(Name);
          setEmail(Email);
          setPassword(Password);
          setBio(Bio);
          navigation("/phonenumber");
        } else {
          showTost({ title: res.data.ResponseMsg });
          setErrors({ ...errors, email: res.data.ResponseMsg });
        }
      })
      .catch((error) => {
        setIsLoading(false);
        showTost({ title: "Registration failed. Please try again." });
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Main Register Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: '15%' }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">{t("Step 1 of 5")}</p>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 dark:text-white">
              {t("Join")}{" "}
              <span className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent">
                2Sweety
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{t("Start your journey to finding love")}</p>
          </div>

          {/* Social Registration Buttons - FIRST */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              <FaGoogle className="text-xl text-red-500" />
              <span>{t("Sign up with Google")}</span>
            </button>

            <button
              onClick={handleAppleSignup}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-black dark:bg-gray-900 border-2 border-black dark:border-gray-800 rounded-xl font-semibold text-white hover:bg-gray-900 dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              <FaApple className="text-xl" />
              <span>{t("Continue with Apple")}</span>
            </button>

            <button
              onClick={handleFacebookSignup}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#1877f2] dark:bg-[#166fe5] border-2 border-[#1877f2] dark:border-[#166fe5] rounded-xl font-semibold text-white hover:bg-[#166fe5] dark:hover:bg-[#1559c7] hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              <FaFacebook className="text-xl" />
              <span>{t("Continue with Facebook")}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center my-8">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm font-medium">
              {t("or")}
            </span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Registration Form */}
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <div className={`relative flex items-center border-2 ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus-within:border-pink-500 rounded-xl transition-all duration-300 bg-white dark:bg-gray-700`}>
                <div className="pl-4 pr-2">
                  <FaUser className={`text-lg ${errors.name ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'} transition-colors`} />
                </div>
                <input
                  type="text"
                  placeholder={t("First Name")}
                  value={Name}
                  onChange={(e) => {
                    setname(e.target.value);
                    setErrors({ ...errors, name: "" });
                  }}
                  className="w-full px-2 py-4 outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
                />
                {Name && (
                  <div className="pr-4">
                    <FaCheck className="text-green-500" />
                  </div>
                )}
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className={`relative flex items-center border-2 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus-within:border-pink-500 rounded-xl transition-all duration-300 bg-white dark:bg-gray-700`}>
                <div className="pl-4 pr-2">
                  <FaEnvelope className={`text-lg ${errors.email ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'} transition-colors`} />
                </div>
                <input
                  type="email"
                  placeholder={t("Email")}
                  value={Email}
                  onChange={(e) => {
                    setemail(e.target.value);
                    setErrors({ ...errors, email: "" });
                  }}
                  className="w-full px-2 py-4 outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
                />
                {Email && validateEmail(Email) && (
                  <div className="pr-4">
                    <FaCheck className="text-green-500" />
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className={`relative flex items-center border-2 ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus-within:border-pink-500 rounded-xl transition-all duration-300 bg-white dark:bg-gray-700`}>
                <div className="pl-4 pr-2">
                  <FaLock className={`text-lg ${errors.password ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'} transition-colors`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("Password")}
                  value={Password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full px-2 py-4 outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-4 hover:scale-110 transition-transform"
                  type="button"
                >
                  {showPassword ? (
                    <FaEye className="text-lg text-gray-400 dark:text-gray-500 hover:text-pink-500 transition-colors" />
                  ) : (
                    <FaEyeSlash className="text-lg text-gray-400 dark:text-gray-500 hover:text-pink-500 transition-colors" />
                  )}
                </button>
              </div>
              {Password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t("Password Strength:")}</span>
                    <span className={`text-xs font-semibold ${passwordStrength >= 75 ? 'text-green-600 dark:text-green-400' : passwordStrength >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className={`relative flex items-center border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus-within:border-pink-500 rounded-xl transition-all duration-300 bg-white dark:bg-gray-700`}>
                <div className="pl-4 pr-2">
                  <FaLock className={`text-lg ${errors.confirmPassword ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'} transition-colors`} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("Confirm Password")}
                  value={ConfirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirmPassword: "" });
                  }}
                  className="w-full px-2 py-4 outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
                />
                <button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="pr-4 hover:scale-110 transition-transform"
                  type="button"
                >
                  {showConfirmPassword ? (
                    <FaEye className="text-lg text-gray-400 dark:text-gray-500 hover:text-pink-500 transition-colors" />
                  ) : (
                    <FaEyeSlash className="text-lg text-gray-400 dark:text-gray-500 hover:text-pink-500 transition-colors" />
                  )}
                </button>
                {ConfirmPassword && Password === ConfirmPassword && (
                  <div className="absolute right-14">
                    <FaCheck className="text-green-500" />
                  </div>
                )}
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Bio (Optional) */}
            <div>
              <textarea
                placeholder="Bio (Optional)"
                value={Bio}
                onChange={(e) => setbio(e.target.value)}
                rows="3"
                className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-pink-500 rounded-xl outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-all duration-300"
              />
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <input
                type="text"
                placeholder="Referral Code (Optional)"
                value={ReferralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-pink-500 rounded-xl outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300"
              />
            </div>

            {/* Terms Checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      setErrors({ ...errors, terms: "" });
                    }}
                    className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded cursor-pointer appearance-none checked:bg-gradient-to-r checked:from-pink-500 checked:to-orange-500 checked:border-transparent transition-all"
                  />
                  {termsAccepted && (
                    <FaCheck className="absolute text-white text-xs pointer-events-none" />
                  )}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300 leading-tight">
                  {t('I agree to the')}{" "}
                  <Link to="/terms" className="text-pink-500 font-semibold hover:text-pink-600 dark:hover:text-pink-400">
                    {t('Terms of Service')}
                  </Link>{" "}
                  {t('and')}{" "}
                  <Link to="/privacy" className="text-pink-500 font-semibold hover:text-pink-600 dark:hover:text-pink-400">
                    {t('Privacy Policy')}
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.terms}</p>
              )}
            </div>

            {/* Create Account Button */}
            <button
              onClick={SubmitHandler}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t("Create Account")}...</span>
                </div>
              ) : (
                <>
                  <span>{t("Create Account")}</span>
                  <FaArrowRight className="text-lg" />
                </>
              )}
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {t("Already have an account?")}{" "}
              <Link
                to="/"
                className="font-semibold text-pink-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                {t("Sign In")}
              </Link>
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <Link to="/privacy" className="hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
              {t('Privacy Policy')}
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
              {t('Terms of Service')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
/* jshint ignore:end */
