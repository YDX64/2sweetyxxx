/* jshint esversion: 6 */
/* jshint esversion: 8 */
/* jshint ignore:start */
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaGoogle, FaApple, FaFacebook, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaCheck, FaArrowRight } from "react-icons/fa";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { MyContext } from "../Context/MyProvider";
import { TodoContext } from "../Context";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../Users_Chats/Firebase";
import { showTost } from "../showTost";
import { uid } from "uid";
import { useTranslation } from 'react-i18next';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import FacebookLogin from '@greatsumini/react-facebook-login';
import AppleSignin from 'react-apple-signin-auth';

const Login = () => {
  const { t } = useTranslation();
  const Data = useContext(TodoContext);
  const { basUrl, setToastShow } = useContext(MyContext);

  const [Email, setemail] = useState("");
  const [Password, setpassword] = useState("");
  const [Confirm, setconfirm] = useState();
  const [Password2, setpassword2] = useState();
  const [isVisible, setIsVisible] = useState(false);
  const [value, setValue] = useState();
  const [otpValue, setOtpValue] = useState([]);
  const [checkOtp, setChechOtp] = useState();
  const [passwordShow, setPasswordShow] = useState(false);
  const [otpShow, setOtpShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();
  const inputFocus = useRef();
  const Inputref = useRef(Array.from({ length: 6 }, () => null));

  // Check if social login credentials are configured
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const facebookAppId = process.env.REACT_APP_FACEBOOK_APP_ID;
  const appleClientId = process.env.REACT_APP_APPLE_CLIENT_ID;

  const isGoogleConfigured = googleClientId && googleClientId !== 'your_google_client_id_here.apps.googleusercontent.com';
  const isFacebookConfigured = facebookAppId && facebookAppId !== 'your_facebook_app_id_here';
  const isAppleConfigured = appleClientId && appleClientId !== 'com.2sweety.web';

  // Custom Google Login with useGoogleLogin hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        // Get user info from Google
        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        
        const userData = userInfoResponse.data;
        const googleData = {
          email: userData.email,
          name: userData.name,
          profile_pic: userData.picture,
          social_id: userData.sub,
          auth_type: 'google'
        };

        // Try to login with social_login_v2.php
        const response = await axios.post(`${basUrl}social_login_v2.php`, googleData);

        if (response.data.Result === "true") {
          showTost({ title: response.data.ResponseMsg });
          UserAddHandler(response.data.UserLogin);
          Data.setDemo(Data.demo + "123");
          const token = response.data.token || uid(32);
          localStorage.setItem("token", token);
          localStorage.setItem("UserId", response.data.UserLogin.id);
          localStorage.setItem("Register_User", JSON.stringify(response.data.UserLogin));
          setTimeout(() => navigate("/"), 500);
        } else if (response.data.ResponseCode === "201") {
          showTost({ title: "Please complete your registration" });
          localStorage.setItem("social_signup_data", JSON.stringify(googleData));
          setTimeout(() => navigate("/register"), 1000);
        } else {
          showTost({ title: response.data.ResponseMsg });
        }
      } catch (error) {
        console.error('Google login error:', error);
        showTost({ title: "Google login failed. Please try again." });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      showTost({ title: "Google login cancelled" });
    }
  });

  // Google OAuth Login Handler (legacy for credential-based login)
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const decoded = jwtDecode(credentialResponse.credential);
      
      const googleData = {
        email: decoded.email,
        name: decoded.name,
        profile_pic: decoded.picture,
        social_id: decoded.sub,
        auth_type: 'google'
      };

      // Try to login with social_login_v2.php
      const response = await axios.post(`${basUrl}social_login_v2.php`, googleData);

      if (response.data.Result === "true") {
        // Successful login
        showTost({ title: response.data.ResponseMsg });
        UserAddHandler(response.data.UserLogin);
        Data.setDemo(Data.demo + "123");
        const token = response.data.token || uid(32);
        localStorage.setItem("token", token);
        localStorage.setItem("UserId", response.data.UserLogin.id);
        localStorage.setItem("Register_User", JSON.stringify(response.data.UserLogin));
        setTimeout(() => navigate("/"), 500);
      } else if (response.data.ResponseCode === "201") {
        // Need to register - redirect to registration with pre-filled data
        showTost({ title: "Please complete your registration" });
        localStorage.setItem("social_signup_data", JSON.stringify(googleData));
        setTimeout(() => navigate("/register"), 1000);
      } else {
        showTost({ title: response.data.ResponseMsg });
      }
    } catch (error) {
      console.error('Google login error:', error);
      showTost({ title: "Google login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    showTost({ title: "Google login cancelled" });
  };

  // Facebook Login Handler
  const handleFacebookLogin = async (response) => {
    try {
      setIsLoading(true);
      
      if (response.accessToken) {
        // Get user data from Facebook
        const fbResponse = await axios.get(
          `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${response.accessToken}`
        );

        const facebookData = {
          email: fbResponse.data.email,
          name: fbResponse.data.name,
          profile_pic: fbResponse.data.picture?.data?.url || '',
          social_id: fbResponse.data.id,
          auth_type: 'facebook'
        };

        // Try to login
        const loginResponse = await axios.post(`${basUrl}social_login_v2.php`, facebookData);

        if (loginResponse.data.Result === "true") {
          showTost({ title: loginResponse.data.ResponseMsg });
          UserAddHandler(loginResponse.data.UserLogin);
          Data.setDemo(Data.demo + "123");
          const token = loginResponse.data.token || uid(32);
          localStorage.setItem("token", token);
          localStorage.setItem("UserId", loginResponse.data.UserLogin.id);
          localStorage.setItem("Register_User", JSON.stringify(loginResponse.data.UserLogin));
          setTimeout(() => navigate("/"), 500);
        } else if (loginResponse.data.ResponseCode === "201") {
          showTost({ title: "Please complete your registration" });
          localStorage.setItem("social_signup_data", JSON.stringify(facebookData));
          setTimeout(() => navigate("/register"), 1000);
        } else {
          showTost({ title: loginResponse.data.ResponseMsg });
        }
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      showTost({ title: "Facebook login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Apple Sign In Handler
  const handleAppleLogin = async (response) => {
    try {
      setIsLoading(true);
      
      if (response.authorization) {
        const appleData = {
          email: response.user?.email || '',
          name: response.user?.name ? `${response.user.name.firstName} ${response.user.name.lastName}` : 'Apple User',
          social_id: response.authorization.id_token,
          auth_type: 'apple'
        };

        const loginResponse = await axios.post(`${basUrl}social_login_v2.php`, appleData);

        if (loginResponse.data.Result === "true") {
          showTost({ title: loginResponse.data.ResponseMsg });
          UserAddHandler(loginResponse.data.UserLogin);
          Data.setDemo(Data.demo + "123");
          const token = loginResponse.data.token || uid(32);
          localStorage.setItem("token", token);
          localStorage.setItem("UserId", loginResponse.data.UserLogin.id);
          localStorage.setItem("Register_User", JSON.stringify(loginResponse.data.UserLogin));
          setTimeout(() => navigate("/"), 500);
        } else if (loginResponse.data.ResponseCode === "201") {
          showTost({ title: "Please complete your registration" });
          localStorage.setItem("social_signup_data", JSON.stringify(appleData));
          setTimeout(() => navigate("/register"), 1000);
        } else {
          showTost({ title: loginResponse.data.ResponseMsg });
        }
      }
    } catch (error) {
      console.error('Apple login error:', error);
      showTost({ title: "Apple login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email) => {
    const Validation = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    return Validation.test(email);
  };

  const SigninHandler = () => {
    // Reset errors
    setEmailError("");
    setPasswordError("");

    // Validation
    if (!Email) {
      setEmailError(t("Email is required"));
      showTost({ title: t("Email is required") });
      return;
    }

    if (!validateEmail(Email)) {
      setEmailError(t("Please enter a valid email"));
      showTost({ title: t("Please enter a valid email") });
      return;
    }

    if (!Password) {
      setPasswordError(t("Password is required"));
      showTost({ title: t("Password is required") });
      return;
    }

    setIsLoading(true);

    axios
      .post(`${basUrl}user_login.php`, {
        mobile: Email,
        ccode: "+91",
        password: Password,
      })
      .then((res) => {
        setIsLoading(false);
        if (res.data.Result === "true") {
          setToastShow(true);
          showTost({ title: res.data.ResponseMsg });
          UserAddHandler(res.data.UserLogin);
          Data.setDemo(Data.demo + "123");
          const token = res.data.token || uid(32);
          localStorage.setItem("token", token);
          localStorage.setItem("UserId", res.data.UserLogin.id);
          localStorage.setItem("Register_User", JSON.stringify(res.data.UserLogin));
          setTimeout(() => {
            navigate("/");
          }, 500);
        } else {
          showTost({ title: res.data.ResponseMsg });
          setPasswordError(res.data.ResponseMsg);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        showTost({ title: "Login failed. Please try again." });
      });
  };

  const toggleBottomSheet = () => {
    setIsVisible(!isVisible);
    setOtpShow(false);
    setValue("");
  };

  const PhoneHandler = () => {
    if (value) {
      if (value.length === 13) {
        const Num = value.slice(3);
        const Code = value.slice(0, 3);

        axios.post(`${basUrl}mobile_check.php`, {
          mobile: Num,
          ccode: Code
        })
          .then((res) => {
            if (res.data.Result === "true") {
              showTost({ title: res.data.ResponseMsg });
            } else {
              axios.post(`${basUrl}sms_type.php`)
                .then((res) => {
                  if (res.data.Result === "true") {
                    if (res.data.otp_auth === "Yes") {
                      if (res.data.SMS_TYPE === "Msg91") {
                        axios.post(`${basUrl}msg_otp.php`, { mobile: Num })
                          .then((res) => {
                            showTost({ title: res.data.ResponseMsg });
                            setChechOtp(res.data.otp);
                          });
                      }
                      setOtpShow(true);
                    } else {
                      setPasswordShow(true);
                    }
                  }
                });
            }
          });
      } else {
        showTost({ title: "Please Enter Valid MobileNumber" });
      }
    } else {
      showTost({ title: "Please Enter MobileNumber" });
    }
  };

  const OtpCheckHandler = () => {
    if (checkOtp === otpValue.join('')) {
      showTost({ title: "Otp Match Successfully" });
      setOtpShow(false);
      setPasswordShow(true);
    } else {
      showTost({ title: "Invalid Otp" });
    }
  };

  const SubmitHandler = () => {
    if (Password2) {
      if (Confirm) {
        if (Password2 === Confirm) {
          axios.post(`${basUrl}forget_password.php`, {
            mobile: value.slice(3),
            password: Confirm,
            ccode: value.slice(0, 3)
          })
            .then((res) => {
              if (res.data.Result === "true") {
                showTost({ title: res.data.ResponseMsg });
                toggleBottomSheet();
                setValue('');
                setOtpValue('');
                setpassword2("");
                setconfirm("");
                setPasswordShow(false);
              }
            });
        } else {
          showTost({ title: "Not Match Password" });
        }
      } else {
        showTost({ title: "Please Enter Confrim Password" });
      }
    } else {
      showTost({ title: "Please Enter Password" });
    }
  };

  const HandleChange = (index, value) => {
    const Otp = [...otpValue];
    Otp[index] = value;
    setOtpValue(Otp);

    if (value && !isNaN(value) && index < Inputref.current.length - 1) {
      Inputref.current[index + 1].focus();
    }
  };

  const InputHandler = (index, e) => {
    if (e.key === "Backspace" && index > 0 && !e.target.value) {
      Inputref.current[index - 1].focus();
    }
  };

  const UserAddHandler = (data) => {
    const userRef = doc(db, "datingUser", data.id);
    getDoc(userRef)
      .then((docSnapshot) => {
        if (docSnapshot.exists()) {
          updateDoc(userRef, {
            isOnline: true,
          });
        } else {
          const Pro_Pic = data.profile_pic;
          setDoc(userRef, {
            email: data.email,
            isOnline: true,
            name: data.name,
            number: data.mobile,
            uid: data.id,
            pro_pic: Pro_Pic ? Pro_Pic : "null",
          })
        }
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 dark:text-white">
              {t("Sign in to")}{" "}
              <span className="bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 bg-clip-text text-transparent">
                2Sweety
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{t("Find your perfect match today")}</p>
          </div>

          {/* Social Login Buttons - FIRST */}
          <div className="space-y-3 mb-6">
            {/* Google Login - Custom styled button */}
            {isGoogleConfigured ? (
              <button
                onClick={() => googleLogin()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaGoogle className="text-xl text-red-500" />
                <span>{t("Continue with Google")}</span>
              </button>
            ) : (
              <button
                onClick={() => showTost({ title: "Google login is not configured. Please use email/password login." })}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
              >
                <FaGoogle className="text-xl text-gray-400" />
                <span>{t("Continue with Google")} (Not Configured)</span>
              </button>
            )}

            {/* Apple Sign In */}
            {isAppleConfigured ? (
              <AppleSignin
                authOptions={{
                  clientId: process.env.REACT_APP_APPLE_CLIENT_ID || 'com.2sweety.web',
                  scope: 'email name',
                  redirectURI: window.location.origin,
                  usePopup: true,
                }}
                onSuccess={handleAppleLogin}
                onError={(error) => console.error('Apple login error:', error)}
                render={(props) => (
                  <button
                    {...props}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-black dark:bg-gray-900 border-2 border-black dark:border-gray-800 rounded-xl font-semibold text-white hover:bg-gray-900 dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <FaApple className="text-xl" />
                    <span>{t("Continue with Apple")}</span>
                  </button>
                )}
              />
            ) : (
              <button
                onClick={() => showTost({ title: "Apple login is not configured. Please use email/password login." })}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gray-700 dark:bg-gray-800 border-2 border-gray-600 dark:border-gray-700 rounded-xl font-semibold text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
              >
                <FaApple className="text-xl text-gray-400" />
                <span>{t("Continue with Apple")} (Not Configured)</span>
              </button>
            )}

            {/* Facebook Login */}
            {isFacebookConfigured ? (
              <FacebookLogin
                appId={process.env.REACT_APP_FACEBOOK_APP_ID || ""}
                onSuccess={handleFacebookLogin}
                onFail={(error) => console.error('Facebook login error:', error)}
                render={({ onClick }) => (
                  <button
                    onClick={onClick}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#1877f2] dark:bg-[#166fe5] border-2 border-[#1877f2] dark:border-[#166fe5] rounded-xl font-semibold text-white hover:bg-[#166fe5] dark:hover:bg-[#1559c7] hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <FaFacebook className="text-xl" />
                    <span>{t("Continue with Facebook")}</span>
                  </button>
                )}
              />
            ) : (
              <button
                onClick={() => showTost({ title: "Facebook login is not configured. Please use email/password login." })}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gray-300 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600 rounded-xl font-semibold text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-60"
              >
                <FaFacebook className="text-xl text-gray-400" />
                <span>{t("Continue with Facebook")} (Not Configured)</span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center my-8">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm font-medium">
              {t("or")}
            </span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Email/Password Form */}
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <div className={`relative flex items-center border-2 ${emailError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus-within:border-pink-500 rounded-xl transition-all duration-300 bg-white dark:bg-gray-700`}>
                <div className="pl-4 pr-2">
                  <FaEnvelope className={`text-lg ${emailError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'} transition-colors`} />
                </div>
                <input
                  type="email"
                  placeholder={t("Email")}
                  value={Email}
                  onChange={(e) => {
                    setemail(e.target.value);
                    setEmailError("");
                  }}
                  className="w-full px-2 py-4 outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
                />
                {Email && validateEmail(Email) && (
                  <div className="pr-4">
                    <FaCheck className="text-green-500" />
                  </div>
                )}
              </div>
              {emailError && (
                <p className="text-red-500 text-xs mt-1 ml-1">{emailError}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className={`relative flex items-center border-2 ${passwordError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus-within:border-pink-500 rounded-xl transition-all duration-300 bg-white dark:bg-gray-700`}>
                <div className="pl-4 pr-2">
                  <FaLock className={`text-lg ${passwordError ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'} transition-colors`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("Password")}
                  value={Password}
                  onChange={(e) => {
                    setpassword(e.target.value);
                    setPasswordError("");
                  }}
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
              {passwordError && (
                <p className="text-red-500 text-xs mt-1 ml-1">{passwordError}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                onClick={toggleBottomSheet}
                className="text-sm font-semibold text-pink-500 hover:text-pink-600 transition-colors"
              >
                {t("Forgot password?")}
              </button>
            </div>

            {/* Sign In Button */}
            <button
              onClick={SigninHandler}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t("Sign In")}...</span>
                </div>
              ) : (
                t("Sign In")
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {t("Don't have an account?")}{" "}
              <Link
                to="/register"
                className="font-semibold text-pink-500 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                {t("Sign up")}
              </Link>
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {isVisible && (
          <div
            onClick={toggleBottomSheet}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 shadow-2xl transform transition-all duration-300 animate-slideUp"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Reset Password</h2>
                <button
                  onClick={toggleBottomSheet}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-2xl text-gray-600 dark:text-gray-400">×</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl focus-within:border-pink-500 transition-all duration-300">
                  {!value && (
                    <label
                      onClick={() => inputFocus.current.focus()}
                      className="absolute mt-3 ml-16 text-gray-400 dark:text-gray-500 pointer-events-none"
                    >
                      Mobile Number
                    </label>
                  )}
                  <PhoneInput
                    ref={inputFocus}
                    className="px-4 py-3 w-full dark:text-gray-100"
                    international
                    defaultCountry="IN"
                    value={value}
                    onChange={setValue}
                  />
                </div>

                {otpShow && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Enter OTP</h3>
                    <div className="flex justify-center gap-2">
                      {Inputref.current.map((ref, index) => (
                        <input
                          key={index}
                          ref={(e) => (Inputref.current[index] = e)}
                          onChange={(e) => HandleChange(index, e.target.value)}
                          onKeyDown={(e) => InputHandler(index, e)}
                          type="text"
                          maxLength="1"
                          className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg focus:border-pink-500 outline-none transition-all"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {passwordShow && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={Password2}
                        onChange={(e) => setpassword2(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:border-pink-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={Confirm}
                        onChange={(e) => setconfirm(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:border-pink-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={
                    otpShow
                      ? OtpCheckHandler
                      : passwordShow
                      ? SubmitHandler
                      : PhoneHandler
                  }
                  className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                >
                  {otpShow ? "Verify OTP" : passwordShow ? "Reset Password" : "Send OTP"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
/* jshint ignore:end */
