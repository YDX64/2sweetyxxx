/* jshint esversion: 6 */
/* jshint esversion: 8 */
/* jshint ignore:start */
import React, { useContext, useEffect, useRef, useState } from "react";
import ShowPassword from "../Icon/eye.svg";
import HidePassword from "../Icon/eye-slash.svg";
import EmailIcon from "../Icon/envelope.svg";
import UblockIcon from "../Icon/unlock.svg";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import CloseIcon from "../Icon/times.svg";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { MyContext } from "../Context/MyProvider";
import { TodoContext } from "../Context";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../Users_Chats/Firebase";
import { showTost } from "../showTost";
import { uid } from "uid";
const Login = () => {

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
  const [fcmToken, setFcmToken] = useState();

  const navigate = useNavigate();

  const Show = useRef();
  const Hide = useRef();
  const inputFocus = useRef();
  const Inputref = useRef(Array.from({ length: 6 }, () => null));

  function myFunction() {
    var x = document.getElementById("input");
    if (x.type === "password") {
      x.type = "text";
      Show.current.style.display = "block";
      Hide.current.style.display = "none";
    } else {
      x.type = "password";
      Hide.current.style.display = "block";
      Show.current.style.display = "none";
    }
  }

  const SigninHandler = () => {
    const Validation = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    if (Email && Password) {
      axios
        .post(`${basUrl}user_login.php`, {
          mobile: Email,
          ccode: "+91",
          password: Password,
        })
        .then((res) => {
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
          }
        });
    } else if (!Validation.test(Email)) {
      showTost({ title: "Please Enter Valid Email" });
    } else if (!Email) {
      showTost({ title: "Please Enter Email" });
    } else if (!Password) {
      showTost({ title: "Please Enter Password" });
    }
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

        axios.post(`${basUrl}mobile_check.php`,
          {
            mobile: Num,
            ccode: Code
          }
        )
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
          axios.post(`${basUrl}forget_password.php`,
            {
              mobile: value.slice(3),
              password: Confirm,
              ccode: value.slice(0, 3)
            }
          )
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
    <div>
      <div>
        <div className="w-[100%] max-_430_:bg-white multisteup-wrapper max-_430_:h-[100vh] relative Test">
          <div className="container mx-auto">
            <section className="steps step-1 active rounded-[40px] relative ">
              <div className="text-start mt-[10px] ">
                <h1 className="text-[28px] max-_430_:text-[26px] font-[600]">
                  Sign in
                </h1>
                <p className="text-[20px] mt-[10px] max-_430_:text-[16px]">
                  Welcome back! Please enter your details.
                </p>
              </div>
              <div className="mt-[20px] w-[100%]">
                <div className="border-[2px] flex items-center gap-[15px] mt-[20px] focus-within:border-[rgba(152,14,255,255)] border-gray-300 px-[15px] py-[15px] rounded-[10px]">
                  <img src={EmailIcon} alt="" className="w-[20px] h-[20px]" />
                  <input
                    className="text-black w-[100%] outline-none"
                    type="Email"
                    placeholder="Email or Mobile Number (Without Contry Code..)"
                    onChange={(e) => setemail(e.target.value)}
                    value={Email}
                  />
                </div>
                <div className="relative">
                  <div className="border-[2px] flex items-center gap-[15px] mt-[20px] focus-within:border-[rgba(152,14,255,255)] border-gray-300 px-[15px] py-[15px] rounded-[10px]">
                    <img
                      src={UblockIcon}
                      alt=""
                      className="w-[20px] h-[20px]"
                    />
                    <input
                      id="input"
                      type="text"
                      className="text-black w-[100%] outline-none"
                      placeholder="Password"
                      onChange={(e) => setpassword(e.target.value)}
                      value={Password}
                    />
                  </div>
                  <button onClick={() => myFunction()}>
                    <img
                      ref={Show}
                      src={ShowPassword}
                      alt="Show"
                      className="w-[25px] h-[25px] absolute top-[18px] right-5"
                    />
                    <img
                      ref={Hide}
                      src={HidePassword}
                      alt="Hide"
                      className="w-[25px] h-[25px] hidden absolute top-[18px] right-5"
                    />
                  </button>
                </div>
                <button
                  onClick={toggleBottomSheet}
                  className="font-[500] text-[16px] no-underline text-black"
                >
                  Forgot password?{" "}
                  <span className="text-[rgba(152,14,255,255)]">Reset it</span>
                </button>
                <button
                  onClick={SigninHandler}
                  className="font-bold text-[18px] rounded-[10px] mt-[20px] text-white py-[10px] w-[100%] bg-[rgba(152,14,255,255)]"
                >
                  Sign In
                </button>
              </div>
              <Link
                to="/register"
                className="pt-[20px] font-[500] text-[16px] no-underline text-black"
              >
                Don't have an Account?{" "}
                <span className="text-[rgba(152,14,255,255)]">Sign Up</span>
              </Link>
              {isVisible && (
                <div onClick={toggleBottomSheet} className="bottom-sheet">
                  <div onClick={(e) => e.stopPropagation()} className="bottom-sheet-content">
                    <div className="bg-white rounded-[20px]">
                      <div className="flex items-center justify-between mb-[15px]">
                        <h1 className="text-[18px] m-0 text-black font-[500]">
                          Enter Number
                        </h1>
                        <img
                          onClick={toggleBottomSheet}
                          src={CloseIcon}
                          alt=""
                          className="cursor-pointer"
                        />
                      </div>
                      <div className="border-gray-300 border-[2px] relative rounded-[10px] focus-within:border-[rgba(152,14,255,255)]">
                        {!value && (
                          <label onClick={() => inputFocus.current.focus()} className="text-[16px] absolute top-[10px] left-[60px] text-gray-400 font-[500]">
                            Mobile Number
                          </label>
                        )}
                        <PhoneInput ref={inputFocus}
                          className="text-black w-[100%] px-[15px] py-[10px] font-[500]"
                          international
                          defaultCountry="IN"
                          value={value}
                          onChange={setValue}
                          inputStyle={{ outline: "none" }}
                        />
                      </div>
                      {otpShow && <div className="mt-[15px]">
                        <h1 className="text-[18px] m-0 text-black font-[500]">
                          Enter Otp
                        </h1>
                        <div className="flex items-center mt-[20px] justify-center gap-[10px]">
                          {
                            Inputref.current.map((ref, index) => {
                              return <input
                                ref={(e) => (Inputref.current[index] = e)}
                                onChange={(e) => HandleChange(index, e.target.value)}
                                onKeyDown={(e) => InputHandler(index, e)}
                                type="text"
                                className="form-control font-[600] input-otpnumber outline-[rgba(152,14,255,255)]"
                                name="otp1"
                                id="otp1"
                                maxlength="1"
                              />
                            })
                          }
                        </div>
                      </div>}
                      {passwordShow && <div className="">
                        <h1 className="text-[18px] mt-[15px] mb-0 text-black font-[500]">
                          Password
                        </h1>
                        <input
                          onChange={(e) => setpassword2(e.target.value)}
                          value={Password2}
                          className="text-black w-[100%] border-[2px] outline-[rgba(152,14,255,255)] border-gray-300 px-[15px] py-[10px] rounded-[10px]"
                          type="text"
                          placeholder="Password"
                        />
                        <h1 className="text-[18px] m-0 text-black font-[500] pt-[15px]">
                          Confirm Password
                        </h1>
                        <input
                          value={Confirm}
                          onChange={(e) => setconfirm(e.target.value)}
                          className="text-black w-[100%] border-[2px] mt-[10px] outline-[rgba(152,14,255,255)] border-gray-300 px-[15px] py-[10px] rounded-[10px]"
                          type="text"
                          placeholder="Confirm"
                        />
                      </div>}
                      <button
                        onClick={otpShow ? OtpCheckHandler : passwordShow ? SubmitHandler : PhoneHandler}
                        className="font-bold text-[18px] rounded-[10px] mt-[20px] text-white py-[10px] w-[100%] bg-[rgba(152,14,255,255)]"
                      >
                        {otpShow ? "Check" : passwordShow ? "Change" : "Continue"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div >

    </div >
  );
};

export default Login;
/* jshint ignore:end */
