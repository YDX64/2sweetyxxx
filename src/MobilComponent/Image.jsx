/* jshint esversion: 6 */
/* jshint ignore:start */
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../Context/MyProvider";
import axios from "axios";
import { Formik } from "formik";
import { TodoContext } from "../Context";
import { showTost } from "../showTost";
import { uid } from "uid";

const Imagecom = () => {

  const { demo, setDemo } = useContext(TodoContext);
  const { name, email, password, bio, number, ccode, birthdate, gender, goal, nearby, hobbies, languages, religion, preference, basUrl, longitude, latitude, setLatitude, setLongitude } = useContext(MyContext);
  const navigate = useNavigate();

  const inp1 = useRef();
  const inp2 = useRef();
  const inp3 = useRef();
  const inp4 = useRef();
  const inp5 = useRef();
  const inp6 = useRef();

  const [input1, setInput1] = useState();
  const [input2, setInput2] = useState();
  const [input3, setInput3] = useState();
  const [input4, setInput4] = useState();
  const [input5, setInput5] = useState();
  const [input6, setInput6] = useState();
  const [Error, seterror] = useState(0);

  const [Demo, setdemo] = useState(false);

  const ImageHandler = (id) => {
    if (id === "1") {
      inp1.current.click();
      seterror(Error + 1);
    } else if (id === "2") {
      inp2.current.click();
      seterror(Error + 1);
    } else if (id === "3") {
      inp3.current.click();
      seterror(Error + 1);
    } else if (id === "4") {
      inp4.current.click();
      seterror(Error + 1);
    } else if (id === "5") {
      inp5.current.click();
      seterror(Error + 1);
    } else if (id === "6") {
      inp6.current.click();
      seterror(Error + 1);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLatitude(String(position.coords.latitude));
      setLongitude(String(position.coords.longitude));
    });
  }, []);

  const SubmitHandler = () => {
    if (Error > 2) {
      setdemo(true);
    } else {
      showTost({ title: "Please Select Minimum 3 Images" });
    }
  };

  return (
    <div>
      <Formik
        initialValues={{
          otherpic0: "",
          otherpic1: "",
          otherpic2: "",
        }}
        onSubmit={async (values) => {
          if (Demo) {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);
            formData.append("mobile", number);
            formData.append("ccode", ccode);
            formData.append("birth_date", birthdate);
            formData.append("search_preference", preference);
            formData.append("radius_search", nearby);
            formData.append("relation_goal", goal);
            formData.append("profile_bio", bio ? bio : undefined);
            formData.append("interest", hobbies);
            formData.append("language", languages);
            formData.append("password", password);
            formData.append("gender", gender);
            formData.append("lats", latitude);
            formData.append("longs", longitude);
            formData.append("religion", religion);
            formData.append("size", "3");
            formData.append("otherpic0", values.otherpic0);
            formData.append("otherpic1", values.otherpic1);
            formData.append("otherpic2", values.otherpic2);
            axios
              .post(`${basUrl}reg_user.php`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              })
              .then((res) => {
                if (res.data.Result === "true") {
                  setDemo(demo + "123");
                  localStorage.setItem("UserId", res?.UserLogin?.id || "00");
                  const token = res.data.token || uid(32);
                  localStorage.setItem("token", token);
                  localStorage.setItem(
                    "Register_User",
                    JSON.stringify(res.data.UserLogin)
                  );
                  navigate("/");
                  showTost({ title: res.data.ResponseMsg });
                  setdemo(false);
                } else {
                  showTost({ title: res.data.ResponseMsg });
                }
              });
          }
        }}
      >
        {(props) => (
          <div className="w-[100%] multisteup-wrapper pt-[20px]">
            <div className="container mx-auto">
              <section className="steps step-1 active rounded-[40px] relative">
                <div className="w-[100%] bg-[#EFEDEE]  pt-[30px] z-[999]  pb-[20px] fixed top-[0px] ">
                  <div className="bg-white w-[83%] h-[5px] mx-auto rounded-full">
                    <div className="bg-[rgba(152,14,255,255)]  rounded-full w-[95%] h-[5px] "></div>
                  </div>
                </div>
                <div className="mt-[10px]">
                  <h1 className="text-[28px] max-_430_:text-[27px] font-[600] max-_430_:w-[260px]">
                    Show your best self 📸
                  </h1>
                  <p className="text-[20px] mt-[10px] max-_430_:text-[16px]">
                    Upload up to six of your best photos or <br /> video to make
                    a fantastic first impression. <br />
                    Let your personality shine.
                  </p>
                </div>

                <form
                  onSubmit={props.handleSubmit}
                  className="mt-[20px] w-[80%]"
                >
                  <div>
                    <div className="flex">
                      <div className="w-[65%] relative ">
                        <button
                          onClick={() => ImageHandler("1")}
                          className={`w-[100%] border-[2px] ${input1 ? "" : "border-[rgba(152,14,255,255)]"
                            } h-[210px] max-_430_:h-[170px] p-0 m-0 overflow-hidden rounded-tl-[15px] text-[30px] flex items-center justify-center`}
                        >
                          <input
                            ref={inp1}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              setInput1(file);
                              props.setFieldValue("otherpic0", file);
                            }}
                          />
                          {input1 ? (
                            <img
                              src={URL.createObjectURL(input1)}
                              className="w-full h-full p-0 m-0"
                              alt="Uploaded"
                            />
                          ) : (
                            "+"
                          )}
                        </button>
                        <div className="flex">
                          <button
                            disabled={!input3}
                            onClick={() => ImageHandler("2")}
                            className={`w-[100%] ${input2
                              ? "border-gray-300"
                              : input3
                                ? "border-[rgba(152,14,255,255)]"
                                : ""
                              } border-[2px] h-[105px] max-_430_:h-[85px] overflow-hidden rounded-bl-[15px] flex items-center justify-center`}
                          >
                            <input
                              ref={inp2}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => setInput2(e.target.files[0])}
                            />
                            {input2 ? (
                              <img
                                src={URL.createObjectURL(input2)}
                                className="w-full h-full"
                                alt="Uploaded"
                              />
                            ) : (
                              input3 && "+"
                            )}
                          </button>
                          <button
                            disabled={!input6}
                            onClick={() => ImageHandler("3")}
                            className={`w-[100%] ${input3
                              ? "border-gray-300"
                              : input6
                                ? "border-[rgba(152,14,255,255)]"
                                : ""
                              } border-[2px] h-[105px] max-_430_:h-[85px] flex items-center justify-center`}
                          >
                            <input
                              ref={inp3}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => setInput3(e.target.files[0])}
                            />
                            {input3 ? (
                              <img
                                src={URL.createObjectURL(input3)}
                                className="w-full h-full"
                                alt="Uploaded"
                              />
                            ) : (
                              input6 && "+"
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="w-[35%]">
                        <button
                          disabled={!input1}
                          onClick={() => ImageHandler("4")}
                          className={`w-[100%] border-[2px] ${input4
                            ? "border-gray-300"
                            : input1
                              ? "border-[rgba(152,14,255,255)]"
                              : ""
                            } rounded-tr-[15px] overflow-hidden h-[105px] max-_430_:h-[85px] flex items-center justify-center`}
                        >
                          <input
                            ref={inp4}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              setInput4(file);
                              props.setFieldValue("otherpic1", file);
                            }}
                          />
                          {input4 ? (
                            <img
                              src={URL.createObjectURL(input4)}
                              className="w-full h-full p-0 m-0"
                              alt="Uploaded"
                            />
                          ) : (
                            input1 && "+"
                          )}
                        </button>
                        <button
                          disabled={!input4}
                          onClick={() => ImageHandler("5")}
                          className={`w-[100%] ${input5
                            ? "border-gray-300"
                            : input4
                              ? "border-[rgba(152,14,255,255)]"
                              : ""
                            } border-[2px] h-[105px] max-_430_:h-[85px] flex items-center justify-center`}
                        >
                          <input
                            ref={inp5}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              setInput5(file);
                              props.setFieldValue("otherpic2", file);
                            }}
                          />
                          {input5 ? (
                            <img
                              src={URL.createObjectURL(input5)}
                              className="w-full h-full p-0 m-0"
                              alt="Uploaded"
                            />
                          ) : (
                            input4 && "+"
                          )}
                        </button>
                        <button
                          disabled={!input5}
                          onClick={() => ImageHandler("6")}
                          className={`w-[100%] ${input6
                            ? "border-gray-300"
                            : input5
                              ? "border-[rgba(152,14,255,255)]"
                              : ""
                            } border-[2px] h-[105px] max-_430_:h-[85px] rounded-br-[15px] flex items-center overflow-hidden justify-center`}
                        >
                          <input
                            ref={inp6}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setInput6(e.target.files[0])}
                          />
                          {input6 ? (
                            <img
                              src={URL.createObjectURL(input6)}
                              className="w-full h-full"
                              alt="Uploaded"
                            />
                          ) : (
                            input5 && "+"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{ background: "rgba(152,14,255,255)" }}
                    onClick={SubmitHandler}
                    className="btn btn-w-md nextstep mt-[50px]"
                  >
                    <div className="flex items-center justify-center gap-[10px]">
                      <span className="font-bold text-[1.25rem] text-white">
                        Next
                      </span>
                      <svg
                        className="mx-6"
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
                </form>
              </section>
            </div>
          </div>
        )}
      </Formik>
    </div>
  );
};

export default Imagecom;
/* jshint ignore:end */
