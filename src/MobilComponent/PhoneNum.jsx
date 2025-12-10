/* jshint esversion: 6 */
/* jshint ignore:start */

import React, { useContext, useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../Context/MyProvider";
import axios from "axios";
import { showTost } from "../showTost";
const PhoneNum = () => {

  const { setNumber, setCcode, basUrl } = useContext(MyContext);

  const [value, setValue] = useState();
  const [otpShow, setOtpShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState();
  const [isActive, setIsActive] = useState(false);
  const [checkOtp, setcheckOtp] = useState();
  const [inputValues, setInputValues] = useState(Array(6).fill(''));

  const InputRef = useRef(Array.from({ length: 6 }, () => null));
  const ResendRef = useRef();

  const navigate = useNavigate();

  const SubmitHandler = () => {
    if (value) {
      // Remove spaces from phone number for validation
      const cleanValue = value.replace(/\s/g, '');
      if (cleanValue.length >= 10 && cleanValue.length <= 15) {
        // Extract country code (first 2-4 digits including +)
        const ccodeMatch = cleanValue.match(/^\+\d{1,3}/);
        const Ccode = ccodeMatch ? ccodeMatch[0] : '+91';
        const Number = cleanValue.replace(Ccode, '');
        setCcode(Ccode);
        setNumber(Number);

        axios
          .post(`${basUrl}mobile_check.php`, {
            mobile: Number,
            ccode: Ccode,
          })
          .then((res) => {
            if (res.data.Result === "false") {
              axios.get(`${basUrl}sms_types.php`)
                .then((res) => {
                  if (res.data.otp_auth === "Yes") {
                    setOtpShow(true);
                    if (res.data.SMS_TYPE === "Twilio") {
                      axios.post(`${basUrl}twilio_otp.php`, { mobile: cleanValue.slice(1) })
                        .then((res) => {
                          setcheckOtp(res.data.otp);
                        });
                    } else {
                      axios.post(`${basUrl}msg_otp.php`, { mobile: cleanValue.slice(1) })
                        .then((res) => {
                          setcheckOtp(res.data.otp);
                        });
                    }
                  } else {
                    navigate("/birthdate");
                  }

                });
            } else {
              showTost({ title: res.data.ResponseMsg });
            }
          });
      } else {
        showTost({ title: "Please Enter Valid MobileNumber" });
      }
    } else {
      showTost({ title: "Please Enter MobileNumber" });
    }
  };

  const HandlelChamge = (index, value) => {
    const updatedValues = [...inputValues];
    updatedValues[index] = value;
    setInputValues(updatedValues);
    if (value && !isNaN(value) && index < InputRef.current.length - 1) {
      InputRef.current[index + 1].focus();
    }
  };

  const InputHandle = (index, e) => {
    if (e.key === "Backspace" && index > 0 && !e.target.value) {
      InputRef.current[index - 1].focus();
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;

    const Timer = setTimeout(() => {
      setTimeLeft(prevTimeLeft => {
        if (prevTimeLeft <= 1) {
          ResendRef.current.style.color = "rgba(152,14,255,255)";
          setIsActive(false);
          return 0;
        }
        return prevTimeLeft - 1;
      });
    }, 1000);
    return () => clearTimeout(Timer);

  }, [isActive, timeLeft]);


  const ResendOtpHandler = () => {
    setInputValues(Array(6).fill(''));
    showTost({ title: "Otp Resend Successfully!!" });
    ResendRef.current.style.color = "#970eff60";
    setTimeLeft(30);
    setIsActive(true);
    // Clean the phone number value before sending
    const cleanValue = value ? value.replace(/\s/g, '') : '';
    axios.post(`${basUrl}msg_otp.php`, { mobile: cleanValue.slice(1) })
      .then((res) => {
        setcheckOtp(res.data.otp);
      });
  };


  const CheckOtpHandler = () => {

    if (Number(inputValues.join("")) === checkOtp) {
      showTost({ title: "Otp Match Successfull !!" });
      navigate("/birthdate");
    } else {
      showTost({ title: "Please Enter Valid Otp" });
    }
  };

  return (
    <div>
      <div className="w-[100%] multisteup-wrapper pt-[20px] max-_430_:pt-[0px] Test">
        <div className="container mx-auto">
          {otpShow
            ? <section className="steps step-1 active rounded-[40px] relative">
              <div className="w-[100%] bg-[#EFEDEE]  pt-[30px] z-[999]  pb-[20px] fixed top-[0px] ">
                <div className="bg-white w-[83%] h-[5px] mx-auto rounded-full">
                  <div className="bg-[rgba(152,14,255,255)]  rounded-full w-[18%] h-[5px] "></div>
                </div>
              </div>
              <div className="text-center mt-[10px]">
                <h1 className="text-[28px] max-_430_:text-[26px] font-[600] max-_430_:w-[300px]">
                  Enter Your Otp
                </h1>
              </div>
              <div className="mt-[20px] w-[100%]">
                <div className="flex items-center justify-center gap-[10px]">
                  {inputValues.map((value, index) => (
                    <input
                      key={index}
                      ref={(e) => (InputRef.current[index] = e)}
                      onChange={(e) => HandlelChamge(index, e.target.value)}
                      onKeyDown={(e) => InputHandle(index, e)}
                      value={value}
                      type="text"
                      className="form-control font-[600] input-otpnumber outline-[rgba(152,14,255,255)]"
                      name="otp1"
                      id={`otp${index + 1}`}
                      maxLength="1"
                    />
                  ))}
                </div>
              </div>
              <button disabled={isActive} ref={ResendRef} onClick={ResendOtpHandler} className="mt-[40px] font-[600] text-[16px] text-[rgba(152,14,255,255)]">Resend Otp</button>
              <button
                style={{ background: "rgba(152,14,255,255)" }}
                onClick={CheckOtpHandler}
                class="btn btn-w-md nextstep mt-[30px]"
              >
                <div className="flex items-center justify-center gap-[10px]">
                  <span className="font-bold text-[1.25rem] text-white">
                    Submit
                  </span>
                </div>
              </button>
              <h3 onClick={() => setOtpShow(false)} className="mt-[20px] cursor-pointer">Back</h3>
            </section>
            : <section className="steps step-1 active rounded-[40px] relative ">
              <div className="w-[100%] bg-[#EFEDEE]  pt-[30px] z-[999]  pb-[20px] fixed top-[0px] ">
                <div className="bg-white w-[83%] h-[5px] mx-auto rounded-full">
                  <div className="bg-[rgba(152,14,255,255)]  rounded-full w-[18%] h-[5px] "></div>
                </div>
              </div>
              <div className="text-start mt-[10px]">
                <h1 className="text-[28px] max-_430_:text-[26px] font-[600] max-_430_:w-[300px]">
                  Your GoMeet identity &#128526;
                </h1>
                <p className="text-[20px] mt-[10px] max-_430_:text-[17px] max-_380_:text-[16px]">
                  Add your phone number and your job to tell other what you
                  do for a living.
                </p>
              </div>
              <div className="mt-[20px] w-[100%]">
                <div className="border-gray-300 border-[2px] rounded-[10px] focus-within:border-[rgba(152,14,255,255)]">
                  <PhoneInput
                    className="text-black w-[100%] px-[15px] py-[15px] Demo"
                    international
                    defaultCountry={"IN"}
                    value={value}
                    onChange={setValue}
                    name="phone"
                    inputStule={{ outline: "none" }}
                  />
                </div>
              </div>
              <button
                style={{ background: "rgba(152,14,255,255)" }}
                onClick={SubmitHandler}
                class="btn btn-w-md nextstep mt-[120px]"
              >
                <div className="flex items-center justify-center gap-[10px]">
                  <span className="font-bold text-[1.25rem] text-white">
                    Next
                  </span>
                  <svg
                    class="mx-6"
                    width="19"
                    height="13"
                    viewBox="0 0 19 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.75455 5.73075H15.4523L11.3296 1.60802C11.2552 1.53617 11.1959 1.45022 11.155 1.35519C11.1142 1.26016 11.0927 1.15795 11.0918 1.05453C11.0909 0.951108 11.1106 0.848543 11.1498 0.752818C11.189 0.657094 11.2468 0.570128 11.3199 0.496995C11.3931 0.423862 11.48 0.366026 11.5758 0.326862C11.6715 0.287698 11.7741 0.267991 11.8775 0.268889C11.9809 0.269788 12.0831 0.291275 12.1781 0.332096C12.2732 0.372918 12.3591 0.432257 12.431 0.50665L17.8833 5.95896C18.0293 6.10503 18.1113 6.30311 18.1113 6.50965C18.1113 6.71618 18.0293 6.91427 17.8833 7.06033L12.431 12.5126C12.2841 12.6545 12.0873 12.733 11.8831 12.7313C11.6789 12.7295 11.4835 12.6476 11.3391 12.5032C11.1947 12.3587 11.1128 12.1634 11.111 11.9592C11.1092 11.7549 11.1877 11.5582 11.3296 11.4113L15.4523 7.28855H1.75455C1.54797 7.28855 1.34986 7.20649 1.20378 7.06041C1.05771 6.91434 0.975649 6.71623 0.975649 6.50965C0.975649 6.30307 1.05771 6.10495 1.20378 5.95888C1.34986 5.81281 1.54797 5.73075 1.75455 5.73075Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </button>
            </section>}
        </div>
      </div>
    </div>
  );
};

export default PhoneNum;
/* jshint ignore:end */
