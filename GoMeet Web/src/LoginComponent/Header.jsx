/* jshint esversion: 6 */
/* jshint esversion: 8 */
/* jshint ignore:start */
import React, { useContext, useEffect, useRef, useState } from "react";
import imag3 from "../images/flag/united-kingdom.png";
import Crown from "../Icon/crown-alt.png";
import { Link, useNavigate } from "react-router-dom";
import { BiEditAlt } from "react-icons/bi";
import axios from "axios";
import { MyContext } from "../Context/MyProvider";
import { useTranslation } from "react-i18next";
import { TodoContext } from "../Context";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db, messaging } from "../Users_Chats/Firebase";
import OneSignal from "react-onesignal";
import VideoCall from "../User_Call/Video_call";
import { IoCall } from "react-icons/io5";
import VoiceCall from "../User_Call/Voice_Call";
import { onMessage } from "firebase/messaging";
import { showTost } from "../showTost";
import verify from "../images/icons/verify.png";
import verify1 from "../images/icons/verify-1.png";
import Review from "../images/icons/information.png";
import { IoIosNotificationsOutline } from "react-icons/io";
import LocationImg from "../images/backgrounds/permission.png"
import { LuMessageCircle } from "react-icons/lu";
import Slider from "react-slick";
import { IoMdClose } from "react-icons/io";
import UserChat from "./UserChat";
import SendMessage from "../images/icons/Chat-Icon.svg"
import Keepswiping from "../images/icons/keepswap.svg"

// Use 2Sweety logo from public folder
const imag = "/logo.png";

const Header = () => {

  const Data = useContext(TodoContext);

  const { t, i18n } = useTranslation();

  const { imageBaseURL, basUrl, updateId, callStatus, color, setColor, chatId, setChatId, setCallstatus, setChatUserName, atendCall, setAtendCall, setOnesignalAppId, setAgoraAppId, setOnesignalKey } = useContext(MyContext);

  const navigate = useNavigate();

  const [user, setUser] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [isVisible3, setIsVisible3] = useState(false);
  const [input, SetInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [imageSelect, setImageSelect] = useState();
  const [profileimageshow, setProfileImageShow] = useState(false);
  const [isverify, setIsVerify] = useState("");
  const [list, setList] = useState([]);
  const [packageId, setPackageId] = useState();
  const [img, setImg] = useState(imag3);
  const [language, setLanguage] = useState("English");
  const [notification, setNotification] = useState();
  const [callType, setCallType] = useState('');
  const [callTime, setCallTime] = useState(0);
  const [callCheck, setCallcheck] = useState();
  const [callProPic, setCallProPic] = useState();
  const [locationError, setLocationError] = useState(false);
  const [likeMatch, setLikeMatch] = useState(false);
  const [totalLiked, setTotalLiked] = useState([]);
  const [myData, setMyData] = useState();
  const [showChat, setShowChat] = useState(false);
  const languageData = [
    { title: "English", img: require("../images/flag/united-kingdom.png"), id: "en" },
    { title: "Swedish", img: require("../images/flag/united-kingdom.png"), id: "sv" },
    { title: "Norwegian", img: require("../images/flag/united-kingdom.png"), id: "no" },
    { title: "Finnish", img: require("../images/flag/united-kingdom.png"), id: "fi" },
    { title: "Danish", img: require("../images/flag/united-kingdom.png"), id: "da" },
    { title: "Turkish", img: require("../images/flag/united-kingdom.png"), id: "tr" },
    { title: "Arabic", img: require("../images/flag/arabic.png"), id: "ar" },
    { title: "Chinese", img: require("../images/flag/united-kingdom.png"), id: "zh" },
    { title: "French", img: require("../images/flag/spain.png"), id: "fr" },
    { title: "German", img: require("../images/flag/united-kingdom.png"), id: "de" },
    { title: "Russian", img: require("../images/flag/united-kingdom.png"), id: "ru" }
  ];

  const newProfile = user && user.profile_pic;

  const Left = useRef();
  const Display = useRef();
  const Display2 = useRef();
  const BgDisplay2 = useRef();
  const InputRef = useRef();
  const ProfileRef = useRef();
  const Arrow = useRef();

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };


  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    sessionStorage.setItem("I18", lang);
  };

  const SelectLanuguageHandler = (img, name) => {
    setImg(img);
    setLanguage(name);
    const Data = {
      Name: name,
      img: img
    };
    sessionStorage.setItem("Language", JSON.stringify(Data));
  };

  const SlidBarHAndler = () => {
    if (window.innerWidth < 992) {
      if (isVisible) {
        Left.current.style.left = "-350px";
        BgDisplay2.current.style.display = "none";
      } else {
        Left.current.style.left = "0px";
        BgDisplay2.current.style.display = "block";
      }
      setIsVisible(!isVisible);
    }
  };

  const ShowHAndler = () => {
    if (isVisible2) {
      Display.current.style.display = "none";
      Display2.current.style.display = "none";
      Arrow.current.classList.add("arrow");
    } else {
      Display.current.style.display = "block";
      Display2.current.style.display = "block";
      Arrow.current.classList.remove("arrow");
    }
    setIsVisible2(!isVisible2);
  };

  const toggleBottomSheet = (e) => {
    if (e.target.id === 'Verify') {
      setIsVisible3(false);
    } else {
      setIsVisible3(true);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      setLoading(false);
      document.body.style.overflow = "auto";
    }, 2000);

    const RegisterData = localStorage.getItem("Register_User");
    if (RegisterData) {
      const UserData = JSON.parse(RegisterData);
      setUser(UserData);
      setIsVerify(UserData.is_verify);
      const Id = sessionStorage.getItem("Icon-Color");
      setColor(Id ? Id : "Home");
      if (UserData.identity_picture) {
        SetInput(imageBaseURL + UserData.identity_picture);
      }
      const ID = localStorage.getItem("PurchaseId");
      if (UserData.plan_id > 0) {
        setPackageId(UserData.plan_id);
      } else {
        setPackageId(ID);
      }
    }
    ApiHandler();

  }, [updateId]);

  useEffect(() => {
    sessionStorage.setItem("Loding", loading);
  }, [loading]);

  useEffect(() => {
    const Data = sessionStorage.getItem("Language");
    if (Data) {
      const Json = JSON.parse(Data);
      setImg(Json.img);
      setLanguage(Json.Name);
    }

    const Lan = sessionStorage.getItem("I18");
    if (Lan) {
      i18n.changeLanguage(Lan);
    }

    firebaseAddDataHandle();
    OneSignalHandle();
    NotificationGetHandle();
    GetKeyHandle();
  }, []);

  const firebaseAddDataHandle = () => {
    const RegisterData = localStorage.getItem("Register_User");
    if (RegisterData) {
      const data = JSON.parse(RegisterData);
      const userRef = doc(db, "datingUser", data.id);

      getDoc(userRef)
        .then((docSnapshot) => {
          if (docSnapshot.exists()) {
          } else {
            const Pro_Pic = data.profile_pic || null;
            setDoc(userRef, {
              email: data.email,
              isOnline: true,
              name: data.name,
              number: data.mobile,
              uid: data.id,
              pro_pic: Pro_Pic,
            });
          }
        })
        .catch((error) => {
        });
    }
  };

  const ProfileHandler = (e) => {
    if (e.target.id === 'EditPhoto') {
      setProfileImageShow(false);
    } else {
      setProfileImageShow(true);
    }
  };

  const SelectHandler = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSelect(reader.result.split(",")[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const PhotoHandler = () => {
    if (imageSelect) {

      const RegisterData = localStorage.getItem("Register_User");
      const UserData = JSON.parse(RegisterData);

      axios
        .post(`${basUrl}pro_image.php`, { uid: UserData.id, img: imageSelect })
        .then((res) => {
          if (res.data.Result === "true") {
            localStorage.setItem(
              "Register_User",
              JSON.stringify(res.data.UserLogin)
            );
            showTost({ title: res.data.ResponseMsg });
            setProfileImageShow(false);

            const userRef = doc(db, "datingUser", UserData.id);
            updateDoc(userRef, {
              pro_pic: res.data.UserLogin.profile_pic,
            });
            window.location.href = '/';
          }
        });
    } else {
      showTost({ title: "Please Uplode Photo" });
    }
  };

  const ColorHandler = (Id) => {
    setColor(Id);
    sessionStorage.setItem("Icon-Color", Id);
  };

  const InputHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      SetInput(`data:image/png;base64,${reader.result.split(",")[1]}`);
    };
    reader.readAsDataURL(file);
  };

  const VerificationHandler = () => {
    if (!input) {
      showTost({ title: "Uplode Photo!!" });
    } else {
      const RegisterData = localStorage.getItem("Register_User");
      const parsedData = JSON.parse(RegisterData);
      if (parsedData.identity_picture) {
        showTost({ title: "Verification Under Review!!" });
      } else {
        axios.post(`${basUrl}identity_doc.php`, { uid: parsedData.id, img: input })
          .then((res) => {
            if (res.data.Result === "true") {
              localStorage.setItem(
                "Register_User",
                JSON.stringify(res.data.UserLogin)
              );
              showTost({ title: res.data.ResponseMsg });
              setIsVisible3(false);
              navigate("/")
            }
          });
      }
    }
  };

  const ApiHandler = () => {
    axios.post(`${basUrl}pagelist.php`)
      .then((res) => {
        setList(res.data.pagelist);
      });
  };

  // OneSignal Notification Show
  const OneSignalHandle = () => {
    const UserData = localStorage.getItem("Register_User");

    if (UserData) {
      const UserId = JSON.parse(UserData);

      OneSignal.init({
        appId: process.env.REACT_APP_ONESIGNAL_APP_ID || "94b2b6c5-fabb-4454-a2b7-75cf75b84789",
        notifyButton: {
          enable: true,
        },
      })
        .then(() => {
          OneSignal.User.addTags({
            "user_id": UserId.id,
          }).then(function (tagsSent) {
          });
        })
        .catch((error) => {
          console.error("Error initializing OneSignal:", error);
        });

      OneSignal.Notifications.addEventListener('foregroundWillDisplay', handleNotificationReceived);

      return () => {
        OneSignal.Notifications.removeEventListener('foregroundWillDisplay', handleNotificationReceived);
      };
    }
  };

  const handleNotificationReceived = (notification) => {
    OneSignalNotificationHandle(notification.notification);

  };

  const OneSignalNotificationHandle = async (payload) => {
    if (payload.additionalData === undefined) return;

    if (payload.additionalData.Audio || payload.additionalData.vcId) {
      if (payload.additionalData.Audio) {
        await setCallType("Audio_Call");
      } else {
        await setCallType("Video_Call");
      }
      setNotification(payload.additionalData);
      setCallProPic(payload.additionalData.popic);
      setAtendCall(true);
    }
  };

  const LogOutHandler = () => {
    showTost({ title: "Logout Successfully!!" });

    const userRef = doc(db, "datingUser", user.id);

    updateDoc(userRef, {
      isOnline: false,
    });

    navigate("/Home");
    Data.setDemo(Data.demo + 1);
    localStorage.clear();
  };


  // Get User Token Or Notification For Firebase
  const NotificationGetHandle = () => {
    onMessage(messaging, (payload) => {
      firebaseNotificationGet(payload);
    });
  };

  // Firebase Notification Get Handle
  const firebaseNotificationGet = async (payload) => {
    if (payload.data.Audio || payload.data.vcId) {
      if (payload.data.Audio) {
        await setCallType("Audio_Call");
      } else {
        await setCallType("Video_Call");
      }
      setNotification(payload.data);
      setCallProPic(payload.data.propic);
      setAtendCall(true);
    }
  };

  const CallAnsuserHandler = async () => {
    setCallstatus(true);
  };

  const leaveCallHandler = async () => {
    const Data = localStorage.getItem("Register_User");
    setAtendCall(false);

    if (notification.id && Data) {
      const receiverId = JSON.parse(Data);

      const chatRoomId1 = `${notification.id}_${receiverId.id}`;
      const chatRoomId2 = `${receiverId.id}_${notification.id}`;

      const userRef1 = doc(db, "chat_rooms", chatRoomId1);
      const userRef2 = doc(db, "chat_rooms", chatRoomId2);

      // Reference to the 'isVoiceCall' subcollection within the document
      const isVcDocRef1 = doc(userRef1, "isVcAvailable", chatRoomId1);
      const isVcDocRef2 = doc(userRef2, "isVcAvailable", chatRoomId2);

      try {
        // Check if the document exists before updating it
        const docSnap1 = await getDoc(isVcDocRef1);
        if (docSnap1.exists()) {
          // Document exists, so update it
          if (notification.Audio) {
            await updateDoc(isVcDocRef1, { Audio: false });
          } else {
            await updateDoc(isVcDocRef1, { isVc: false });
          }
        }

        const docSnap2 = await getDoc(isVcDocRef2);
        if (docSnap2.exists()) {
          // Document exists, so update it
          if (notification.Audio) {
            await updateDoc(chatRoomId2, { Audio: false });
          } else {
            await updateDoc(chatRoomId2, { isVc: false });
          }
        }
      } catch (error) {
        console.error("Error updating collections: ", error);
      }
    }
  };

  useEffect(() => {
    if (!atendCall) return;

    const Data = localStorage.getItem("Register_User");

    if (Data) {

      const Id = notification.Audio || notification.vcId;

      const userRef = doc(db, "chat_rooms", Id);

      const isVcCollectionRef = collection(userRef, "isVcAvailable");

      const getVoiceCallStatus = async () => {
        try {
          const querySnapshot = await getDocs(isVcCollectionRef);

          if (!querySnapshot.empty) {
            var isVoiceCall;
            querySnapshot.forEach(doc => {
              const messageData = doc.data();
              if (notification.Audio) {
                isVoiceCall = messageData.Audio;
              } else {
                isVoiceCall = messageData.isVc;
              }
              if (isVoiceCall === false) {
                setAtendCall(false);
                setCallstatus(false);
                setCallTime("");
              } else {
                setCallcheck(isVoiceCall);
              }
            });
          }
        } catch (error) {
          
        }
      };
      getVoiceCallStatus();
    }
  }, [callCheck, callTime]);

  useEffect(() => {
    if (atendCall) {
      const intervalId = setInterval(() => {
        setCallTime((prevTime) => prevTime + 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [atendCall]);

  const GetKeyHandle = () => {
    axios.post(`${basUrl}sms_type.php`)
      .then((res) => {
        setAgoraAppId(res.data.agora_app_id);
        setOnesignalAppId(res.data.one_key);
        setOnesignalKey(res.data.one_hash);
      })
      .catch((error) => {
      })
  }

  useEffect(() => {
    // Check if geolocation is available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = String(position.coords.latitude);
          const long = String(position.coords.longitude);

          const HomeDataGetHandle = async () => {
            const localData = localStorage.getItem("Register_User");

            if (localData) {
              const userData = JSON.parse(localData);
              setMyData({
                name: userData.name,
                pro_pic: userData.profile_pic
              })
              try {
                const response = await axios.post(`${basUrl}home_data.php`, {
                  uid: userData.id,
                  lats: lat,
                  longs: long,
                });

                if (response.data.Result === "true") {
                  setTotalLiked(response.data.totalliked);
                  if (response.data.totalliked.length > 0) {
                    setLikeMatch(true);
                  }
                }
              } catch (error) {
                console.error("Error fetching user data:", error);
              }
            }
          }

          HomeDataGetHandle();
          setLocationError(false);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setLocationError(true);
          } else {
            setLocationError(true);
          }
        }
      );
    } else {
      setLocationError(true);
    }
  }, []);

  const SendMessageHandle = (id, name) => {
    const page = sessionStorage.getItem("Icon-Color");
    if (page !== "Home") {
      setShowChat(true);
    }
    setChatId(id);
    setChatUserName(name);
  };

  const KeepSwipingHandle = () => {
    ProfileViewHandle();
    navigate("/");
    ColorHandler("Home");
  };

  const ProfileViewHandle = async () => {
    const localData = localStorage.getItem("Register_User");

    if (localData) {
      const userData = JSON.parse(localData);

      try {
        for (let i = 0; i < totalLiked.length; i++) {
          const res = await axios.post(`${basUrl}profile_view.php`, {
            "uid": userData.id,
            "profile_id": totalLiked[i].profile_id
          });

          if (res.data.Result === "true") {
            setLikeMatch(false);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const ChatCloseHandle = () => {
    setChatId("");
    sessionStorage.setItem("ChatId", "");
  }

  return (
    <div style={{ userSelect: "none", cursor: "default" }}>
      <header className="header-wrapper">
        <div className="main-header-container border-b-[1px] container-fluid px-md-4 px-3 h-[75px]">
          <div className="header-content-left">
            {/* Logo - visible on larger screens */}
            <div className="header-element d-none d-lg-block">
              <Link to="/" onClick={() => ColorHandler("Home")} className="d-flex align-items-center">
                <img
                  src={imag}
                  alt="2Sweety Logo"
                  className="h-[50px] w-auto object-contain"
                  style={{ maxHeight: '50px' }}
                />
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <div className="header-element">
              <button
                onClick={SlidBarHAndler}
                className="btn sidemenu-toggle d-lg-none p-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="20"
                  height="20"
                >
                  <path d="M12 3V7H3V3H12ZM16 17V21H3V17H16ZM22 10V14H3V10H22Z"></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="header-content-right">
            <div className="header-element d-md-none d-none search-icon">
              <div className="header-link">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.2934 10.7265C12.9169 10.3499 11.7297 9.47339 10.5511 8.79473C10.5384 8.81388 10.5256 8.83302 10.5128 8.8543C11.8425 6.71194 11.5808 3.85902 9.71926 1.99749C7.54925 -0.170388 4.03256 -0.170388 1.86255 1.99749C-0.30746 4.16963 -0.305333 7.68419 1.86255 9.85422C3.70706 11.6966 6.52169 11.9753 8.65766 10.6861C9.27249 11.754 10.1682 13.0071 10.5915 13.4305C11.3361 14.1751 12.5488 14.173 13.2934 13.4284C14.038 12.6816 14.038 11.4732 13.2934 10.7265ZM8.25559 8.39051C6.89401 9.74996 4.68996 9.74996 3.32839 8.38838C1.96894 7.02894 1.96682 4.82489 3.32839 3.46331C4.68784 2.10387 6.89401 2.10387 8.25346 3.46331C9.61504 4.82489 9.61503 7.03106 8.25559 8.39051Z"
                    fill="#999999"
                  ></path>
                </svg>
              </div>
            </div>

            <div className="header-element">
              <Link onClick={() => ColorHandler("Upgrade")}
                to="/upgrade"
                style={{ background: "#ec4899" }}
                className="btn text-white gap-1 df-center"
              >
                <svg
                  width="20"
                  height="15"
                  viewBox="0 0 20 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.1965 12.3945L17.8358 13.959C17.762 14.2782 17.4779 14.5039 17.1502 14.5039H3.08775C2.7601 14.5039 2.47603 14.2782 2.40221 13.959L2.0415 12.3945H18.1965Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M19.9447 4.81846L18.5209 10.9884H1.71619L0.292359 4.81846C0.229781 4.54635 0.333843 4.26228 0.55814 4.09564C0.78314 3.929 1.08478 3.91142 1.32665 4.04994L5.67829 6.53689L9.53282 0.7551C9.65868 0.566662 9.8668 0.449944 10.0925 0.441506C10.3203 0.431662 10.5348 0.534319 10.6733 0.712912L15.1937 6.52494L18.8689 4.07525C19.1087 3.91635 19.4216 3.91775 19.6585 4.08158C19.8962 4.24541 20.0087 4.53791 19.9447 4.81846Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span className="fs-13 d-sm-block d-none">{t('Upgrade Now')}</span>
              </Link>
            </div>
            <div onClick={() => ColorHandler("Notification")} className="flex items-center">
              <Link to="/notification" >
                <IoIosNotificationsOutline className="text-[25px] text-black" />
              </Link>
            </div>
            <div className="header-element">
              <div className="dropdown">
                <button
                  onClick={ShowHAndler}
                  className="btn dropdown-toggle d-flex align-items-center gap-1"
                  type="button"
                  id="dropdownMenuButton1"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <img src={img} alt="Language" className="rounded-circle" width="24" height="24" />
                  <span className="mb-0 fs-16">{language}</span>
                  <svg ref={Arrow}
                    className="arrow duration-[0.2s]"
                    id="dropdown-arrow"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 14.5l5-5 5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <ul
                  ref={Display}
                  className="dropdown-menu z-[888] "
                  aria-labelledby="dropdownMenuButton1"
                >
                  {
                    languageData.map((el) => {
                      return <li onClick={() => { changeLanguage(el.id); SelectLanuguageHandler(el.img, el.title); ShowHAndler(); }} className="cursor-pointer">
                        <div className="dropdown-item py-2">
                          <div className="flex items-center gap-[5px]">
                            <img
                              src={el.img}
                              alt={el.title}
                              className="rounded-circle"
                            />
                            <span>{el.title}</span>
                          </div>
                        </div>
                      </li>
                    })
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      <aside ref={Left} className="app-sidebar sticky" id="sidebar">
        <div className="sidebar-header df-center position-relative">
          <button onClick={() => { ColorHandler("Home"); SlidBarHAndler() }}>
            <Link to="/" className="flex justify-center">
              <img src={imag} alt="logo" className="w-[75%]" />
            </Link>
          </button>
          <button
            onClick={SlidBarHAndler}
            className="btn-close-sidebar d-lg-none text-[#ec4899]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              width="28"
              height="28"
            >
              <path
                d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm79 143c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
                fill="currentColor"
              ></path>
            </svg>
          </button>
        </div>

        <div className="main-sidebar scroll-container" id="sidebar-scroll">
          <div className="text-right">
            <div className="rounded-full py-[2px] px-[7px] bg-[#ec4899] inline-block ">
              <button
                onClick={ProfileHandler}
                className="text-end text-white flex items-center"
              >
                {t('Edit')} <BiEditAlt className="ms-1" />
              </button>
            </div>
          </div>
          <div className="login-user-profile df-center flex-column mt-3">
            {packageId > 0 && <div className="bg-white p-[3px] rounded-full -mb-[20px] z-[555]">
              <img
                src={Crown}
                style={{ width: "25px", height: "25px" }}
                alt="user-avatar"
                className="bg-[#ec4899] rounded-full p-[2px]"
              />
            </div>}
            <div className="relative size-40 w-[114px]">
              <svg
                className="size-full -rotate-90"
                viewBox="0 0 36 36"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-current text-transparent"
                  stroke-width="2"
                ></circle>
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-current text-[#ec4899] dark:text-[#ec4899]"
                  stroke-width="2"
                  stroke-dasharray="100"
                  stroke-dashoffset={100 - localStorage.getItem("Profile_ratio")}
                  stroke-linecap="round"
                ></circle>
              </svg>
              <div
                onClick={ProfileHandler}
                className="absolute top-[66px] cursor-pointer start-[66px] transform -translate-y-1/2 -translate-x-1/2 w-full h-full"
              >
                {newProfile ? (
                  <img
                    src={`${imageBaseURL}${newProfile}`}
                    alt="User Avatar"
                    className="mb-3 rounded-circle bg-center"
                  />
                ) : (
                  <div className="bg-gray-300 rounded-circle w-[6rem] h-[6rem] flex justify-center items-center text-[32px] font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-white py-[2px] px-[4px] rounded-full -mt-[20px] z-[777]">
              <span className="bg-[#ec4899] text-white rounded-full px-[5px]">
                {localStorage.getItem("Profile_ratio") + '%'}
              </span>
            </div>
            <h3 className="fw-semi-bold flex items-center gap-[5px] m-0">
              {user?.name}
              <button onClick={toggleBottomSheet}>
                {isverify === "1"
                  ? <div className="tooltip pt-[5px]">
                    <img src={Review} style={{ width: "30px", height: "30px" }} alt="" />
                    <span className="tooltiptext -bottom-[35px] left-[8px] whitespace-nowrap">{t('Under Review')}</span>
                  </div>
                  : isverify === "2"
                    ? <div className="tooltip pt-[5px]">
                      <img src={verify} style={{ width: "30px", height: "30px" }} alt="" />
                      <span className="tooltiptext  -bottom-[35px] left-[10px] whitespace-nowrap">{t('Is Verify')}</span>
                    </div>
                    : <div className="tooltip pt-[5px]">
                      <img src={verify1} style={{ width: "30px", height: "30px" }} alt="" />
                      <span className="tooltiptext -bottom-[35px] -left-[10px] whitespace-nowrap">{t('Upload Photo')}</span>
                    </div>
                }
              </button>{" "}
            </h3>
            <p className="text-gray">{user?.email} </p>
          </div>
          <hr />

          <div className="sidebar-content">
            <nav className="navbar navbar-expand-lg navbar-light p-0">
              <div className="container-fluid px-0">
                <div className="navbar-collapse" id="navbarNav">
                  <ul className="navbar-nav flex-column mb-2 mb-lg-0">

                    <li onClick={() => { ColorHandler("Home"); SlidBarHAndler() }} className="Hover">
                      <Link
                        to="/"
                        className="nav-link"
                        aria-current="page"
                      >
                        <svg
                          className=""
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            style={{
                              fill: color === "Home" && "#ec4899",
                            }}
                            d="M16 19.75H11.75V14.5C11.75 13.535 10.965 12.75 10 12.75C9.035 12.75 8.25 13.535 8.25 14.5V19.75H4C1.582 19.75 0.25 18.418 0.25 16V9.65004C0.25 7.52704 0.835992 6.93401 1.79199 6.14101L7.91199 1.01003C9.12099 -0.00497067 10.879 -0.00497067 12.088 1.01003L18.208 6.14101C19.164 6.93401 19.75 7.52804 19.75 9.65004V16C19.75 18.418 18.418 19.75 16 19.75ZM13.25 18.25H16C17.577 18.25 18.25 17.577 18.25 16V9.65004C18.25 8.12404 17.998 7.91506 17.251 7.29506L11.125 2.15908C10.473 1.61308 9.527 1.61308 8.875 2.15908L2.74902 7.29506C2.00202 7.91506 1.75 8.12404 1.75 9.65004V16C1.75 17.577 2.423 18.25 4 18.25H6.75V14.5C6.75 12.708 8.208 11.25 10 11.25C11.792 11.25 13.25 12.708 13.25 14.5V18.25Z"
                            fill="#25314C"
                          />
                        </svg>
                        <span
                          style={{
                            color: color === "Home" && "#ec4899",
                          }}
                        >
                          Home
                        </span>
                      </Link>
                    </li>
                    <li onClick={() => { ColorHandler("Explore"); SlidBarHAndler() }} className="Hover">
                      <Link to="/explore" className="nav-link">
                        <svg
                          width="20"
                          height="19"
                          viewBox="0 0 20 19"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            style={{
                              fill:
                                color === "Explore" && "#ec4899",
                            }}
                            d="M9.99997 18.75C9.89397 18.75 9.78793 18.728 9.68893 18.683C9.36193 18.534 1.66598 14.965 0.431976 8.609C-0.0450242 6.15 0.433982 3.75098 1.71298 2.19298C2.74798 0.930984 4.23594 0.259967 6.01694 0.250967C6.02594 0.250967 6.03494 0.250967 6.04294 0.250967C8.07494 0.250967 9.31399 1.408 9.99899 2.393C10.687 1.404 11.9359 0.241967 13.9809 0.250967C15.7629 0.259967 17.2519 0.930984 18.2879 2.19298C19.5649 3.74998 20.0429 6.14898 19.5649 8.60998C18.3329 14.966 10.6359 18.536 10.3089 18.684C10.2119 18.728 10.106 18.75 9.99997 18.75ZM6.04196 1.74999C6.03596 1.74999 6.03099 1.74999 6.02499 1.74999C4.68699 1.75599 3.62702 2.22497 2.87302 3.14397C1.87402 4.36097 1.513 6.29699 1.905 8.32299C2.86 13.247 8.59297 16.447 9.99997 17.165C11.407 16.447 17.14 13.247 18.094 8.32299C18.488 6.29599 18.127 4.35997 17.13 3.14397C16.376 2.22597 15.3159 1.75797 13.9749 1.75097C13.9689 1.75097 13.963 1.75097 13.958 1.75097C11.586 1.75097 10.745 4.12799 10.711 4.22899C10.607 4.53199 10.3209 4.73797 10.0009 4.73797C9.99895 4.73797 9.99792 4.73797 9.99692 4.73797C9.67592 4.73697 9.38993 4.53198 9.28793 4.22698C9.25493 4.12698 8.41296 1.74999 6.04196 1.74999Z"
                            fill="#25314C"
                          />
                        </svg>
                        <span
                          style={{
                            color:
                              color === "Explore" && "#ec4899",
                          }}
                        >
                          Explore
                        </span>
                      </Link>
                    </li>
                    <li onClick={() => { ColorHandler("Settings"); SlidBarHAndler() }} className="Hover">
                      <Link to="/profile" className="nav-link">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            style={{
                              fill:
                                color === "Settings" && "#ec4899",
                            }}
                            d="M10 6.25C7.93202 6.25 6.25001 7.932 6.25001 10C6.25001 12.068 7.93202 13.75 10 13.75C12.068 13.75 13.75 12.068 13.75 10C13.75 7.932 12.068 6.25 10 6.25ZM10 12.25C8.75902 12.25 7.75001 11.241 7.75001 10C7.75001 8.759 8.75902 7.75 10 7.75C11.241 7.75 12.25 8.759 12.25 10C12.25 11.241 11.241 12.25 10 12.25ZM19.208 11.953C18.514 11.551 18.082 10.803 18.081 10C18.08 9.199 18.509 8.45201 19.212 8.04501C19.727 7.74601 19.903 7.08299 19.605 6.56699L17.933 3.681C17.635 3.166 16.972 2.98901 16.456 3.28601C15.757 3.68901 14.888 3.68901 14.187 3.28201C13.496 2.88101 13.066 2.13601 13.066 1.33701C13.066 0.738006 12.578 0.251007 11.979 0.251007H8.024C7.424 0.251007 6.93703 0.738006 6.93703 1.33701C6.93703 2.13601 6.50701 2.881 5.81401 3.284C5.11501 3.689 4.24702 3.68999 3.54802 3.28699C3.03102 2.98899 2.36903 3.16701 2.07103 3.68201L0.397018 6.57101C0.0990181 7.08601 0.276005 7.74799 0.796005 8.04999C1.489 8.45099 1.92102 9.19799 1.92302 9.99899C1.92502 10.801 1.49501 11.55 0.793014 11.957C0.543014 12.102 0.363016 12.335 0.289016 12.615C0.215016 12.894 0.253025 13.185 0.398025 13.436L2.06902 16.32C2.36702 16.836 3.03002 17.015 3.54802 16.716C4.24702 16.313 5.11402 16.314 5.80302 16.713L5.80501 16.714C5.80801 16.716 5.81102 16.718 5.81502 16.72C6.50602 17.121 6.93501 17.866 6.93401 18.666C6.93401 19.265 7.421 19.752 8.02 19.752H11.979C12.578 19.752 13.065 19.265 13.065 18.667C13.065 17.867 13.495 17.122 14.189 16.719C14.887 16.314 15.755 16.312 16.455 16.716C16.971 17.014 17.633 16.837 17.932 16.322L19.606 13.433C19.903 12.916 19.726 12.253 19.208 11.953ZM16.831 15.227C15.741 14.752 14.476 14.817 13.434 15.42C12.401 16.019 11.719 17.078 11.587 18.25H8.41002C8.28002 17.078 7.596 16.017 6.563 15.419C5.523 14.816 4.25602 14.752 3.16902 15.227L1.89302 13.024C2.84802 12.321 3.425 11.193 3.42101 9.99301C3.418 8.80101 2.84201 7.681 1.89201 6.978L3.16902 4.77399C4.25702 5.24799 5.52402 5.18399 6.56602 4.57999C7.59802 3.98199 8.28 2.92201 8.412 1.75101H11.587C11.718 2.92301 12.401 3.982 13.436 4.582C14.475 5.185 15.742 5.24899 16.831 4.77499L18.108 6.978C17.155 7.68 16.579 8.806 16.581 10.004C16.582 11.198 17.158 12.32 18.109 13.025L16.831 15.227Z"
                            fill="#25314C"
                          />
                        </svg>
                        <span
                          style={{
                            color:
                              color === "Settings" && "#ec4899",
                          }}
                        >
                          Settings
                        </span>
                      </Link>
                    </li>
                    <li onClick={() => { ColorHandler("Wallet"); SlidBarHAndler() }} className="Hover">
                      <Link to="/wallet" className="nav-link">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            style={{
                              fill:
                                color === "Wallet" && "#ec4899",
                            }}
                            d="M16.75 4.297V4C16.75 1.582 15.418 0.25 13 0.25H3C1.483 0.25 0.25 1.483 0.25 3V16C0.25 18.418 1.582 19.75 4 19.75H16C18.418 19.75 19.75 18.418 19.75 16V8C19.75 5.845 18.692 4.553 16.75 4.297ZM18.25 13.75H14.5C13.535 13.75 12.75 12.965 12.75 12C12.75 11.035 13.535 10.25 14.5 10.25H18.25V13.75ZM3 1.75H13C14.577 1.75 15.25 2.423 15.25 4V4.25H3C2.311 4.25 1.75 3.689 1.75 3C1.75 2.311 2.311 1.75 3 1.75ZM16 18.25H4C2.423 18.25 1.75 17.577 1.75 16V5.44897C2.125 5.64097 2.55 5.75 3 5.75H16C17.577 5.75 18.25 6.423 18.25 8V8.75H14.5C12.708 8.75 11.25 10.208 11.25 12C11.25 13.792 12.708 15.25 14.5 15.25H18.25V16C18.25 17.577 17.577 18.25 16 18.25ZM15.01 11H15.02C15.573 11 16.02 11.448 16.02 12C16.02 12.552 15.573 13 15.02 13C14.468 13 14.015 12.552 14.015 12C14.015 11.448 14.458 11 15.01 11Z"
                            fill="#25314C"
                          />
                        </svg>
                        <span
                          style={{
                            color: color === "Wallet" && "#ec4899",
                          }}
                        >
                          Wallet
                        </span>
                      </Link>
                    </li>
                    <li onClick={() => { ColorHandler("BuyCoin"); SlidBarHAndler() }} className="Hover">
                      <Link to="/buycoin" className="nav-link">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 22 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            style={{
                              fill:
                                color === "BuyCoin" && "#ec4899",
                            }}
                            d="M6.66693 12.0481L6.66694 12.0481C8.26631 12.5047 9.49467 13.733 9.95192 15.3331L10.4713 17.1511C10.5387 17.3872 10.7543 17.55 11 17.55C11.2457 17.55 11.4613 17.3872 11.5287 17.1511L11.4807 17.1373L11.5287 17.1511L12.0481 15.3331C12.5053 13.733 13.733 12.5053 15.3331 12.0481L17.1511 11.5287C17.3872 11.4613 17.55 11.2457 17.55 11C17.55 10.7543 17.3872 10.5387 17.1511 10.4713L17.1373 10.5193L17.1511 10.4713L15.3331 9.95192L15.3331 9.95192C13.7337 9.49533 12.5053 8.26699 12.0481 6.66693C12.0481 6.66693 12.0481 6.66693 12.0481 6.66693L11.5287 4.84894L11.4807 4.86267L11.5287 4.84893C11.4613 4.61282 11.2457 4.45 11 4.45C10.7543 4.45 10.5387 4.61282 10.4713 4.84893L10.5193 4.86267L10.4713 4.84894L9.95192 6.66693C9.95192 6.66693 9.95192 6.66693 9.95192 6.66693C9.49467 8.26698 8.26698 9.49467 6.66693 9.95192C6.66693 9.95192 6.66693 9.95192 6.66693 9.95192L4.84894 10.4713L4.86267 10.5193L4.84893 10.4713C4.61282 10.5387 4.45 10.7543 4.45 11C4.45 11.2457 4.61282 11.4613 4.84893 11.5287L4.86267 11.4807L4.84894 11.5287L6.66693 12.0481ZM14.9991 11.0002C13.0582 11.5672 11.5675 13.0581 11.0007 14.999C10.4339 13.0581 8.9426 11.5666 7.00243 11.0002C8.94265 10.4331 10.4329 8.94275 10.9998 7.00242C11.567 8.94313 13.0587 10.4343 14.9991 11.0002Z"
                            fill="#25314C"
                            stroke="#25314C"
                            stroke-width="0.1"
                          />
                          <rect
                            style={{
                              stroke:
                                color === "BuyCoin" && "#ec4899",
                            }}
                            className="ttt"
                            x="0.75"
                            y="0.75"
                            width="20.5"
                            height="20.5"
                            rx="10.25"
                            stroke="#25314C"
                            stroke-width="1.5"
                          />
                        </svg>
                        <span
                          style={{
                            color:
                              color === "BuyCoin" && "#ec4899",
                          }}
                        >
                          Buy Coin
                        </span>
                      </Link>
                    </li>
                    <li onClick={() => { ColorHandler("Account"); SlidBarHAndler() }} className="Hover">
                      <Link to="/blockUser" className="nav-link">
                        <svg
                          width="20"
                          height="22"
                          viewBox="0 0 20 22"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            style={{
                              fill:
                                color === "Account" && "#ec4899",
                            }}
                            d="M10 21.7501C9.92 21.7501 9.83994 21.7371 9.76294 21.7111C8.17394 21.1811 0.25 18.1221 0.25 9.88805V4.00012C0.25 3.64312 0.502027 3.33401 0.853027 3.26501C5.73303 2.28901 7.46305 1.43111 9.65405 0.344109C9.86505 0.239109 10.145 0.225193 10.356 0.330193C12.517 1.41919 14.2239 2.28001 19.1479 3.26501C19.4989 3.33501 19.751 3.64312 19.751 4.00012V9.88903C19.751 18.123 11.827 21.182 10.238 21.712C10.16 21.737 10.08 21.7501 10 21.7501ZM1.75 4.61218V9.88805C1.75 16.7531 8.168 19.5482 10 20.2052C11.832 19.5482 18.25 16.7521 18.25 9.88805V4.61218C13.829 3.68718 11.9699 2.81901 10.0149 1.83801C7.93789 2.86501 6.135 3.69618 1.75 4.61218ZM9.54199 13.5301L13.542 9.53014C13.835 9.23714 13.835 8.76211 13.542 8.46911C13.249 8.17611 12.774 8.17611 12.481 8.46911L9.01099 11.9391L7.54102 10.4691C7.24802 10.1761 6.77298 10.1761 6.47998 10.4691C6.18698 10.7621 6.18698 11.2371 6.47998 11.5301L8.47998 13.5301C8.62598 13.6761 8.81801 13.7501 9.01001 13.7501C9.20201 13.7501 9.39599 13.6771 9.54199 13.5301Z"
                            fill="#25314C"
                          />
                        </svg>
                        <span
                          style={{
                            color:
                              color === "Account" && "#ec4899",
                          }}
                        >
                          Account & Security
                        </span>
                      </Link>
                    </li>
                    <li onClick={() => { ColorHandler("Chat"); SlidBarHAndler() }} className="Hover">
                      <Link to="/chat" className="nav-link">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path style={{
                            fill:
                              color === "Chat" && "#ec4899",
                          }} d="M3.85693 21.75C3.71193 21.75 3.57111 21.748 3.43311 21.743C2.93311 21.731 2.49497 21.411 2.32397 20.928C2.15197 20.442 2.29408 19.9131 2.68408 19.5811C3.61608 18.8291 3.98892 17.997 4.13892 17.426C2.90192 15.947 2.24902 14.08 2.24902 12.001C2.24902 6.84798 6.25902 3.25 11.999 3.25C17.739 3.25 21.749 6.84898 21.749 12.001C21.749 17.153 17.739 20.752 11.999 20.752C10.812 20.752 9.67398 20.591 8.60498 20.2729C7.24198 21.4599 5.36393 21.75 3.85693 21.75ZM3.47803 20.243C3.48003 20.243 3.48189 20.243 3.48389 20.243C3.48089 20.244 3.47903 20.244 3.47803 20.243ZM12 4.75C7.143 4.75 3.75 7.73198 3.75 12.001C3.75 13.837 4.35498 15.463 5.50098 16.703C5.65598 16.871 5.72692 17.101 5.69092 17.328C5.52292 18.399 4.99511 19.412 4.18311 20.243C5.34311 20.201 6.90304 19.934 7.86304 18.91C8.06404 18.694 8.37603 18.617 8.65503 18.714C9.69003 19.072 10.815 19.2531 12 19.2531C16.857 19.2531 20.25 16.271 20.25 12.002C20.25 7.73295 16.857 4.75 12 4.75ZM13.02 12C13.02 11.448 12.573 11 12.02 11H12.01C11.458 11 11.0149 11.448 11.0149 12C11.0149 12.552 11.468 13 12.02 13C12.572 13 13.02 12.552 13.02 12ZM17.02 12C17.02 11.448 16.573 11 16.02 11H16.01C15.458 11 15.0149 11.448 15.0149 12C15.0149 12.552 15.468 13 16.02 13C16.572 13 17.02 12.552 17.02 12ZM9.02002 12C9.02002 11.448 8.57302 11 8.02002 11H8.01001C7.45801 11 7.01489 11.448 7.01489 12C7.01489 12.552 7.46802 13 8.02002 13C8.57202 13 9.02002 12.552 9.02002 12Z" fill="#25314C" />
                        </svg>
                        <span
                          style={{
                            color:
                              color === "Chat" && "#ec4899",
                          }}
                        >
                          {t('User Chat')}
                        </span>
                      </Link>
                    </li>
                    {
                      list.map((item, index) => {
                        const Title = item.title.replace(/\s+/g, '_');
                        const FinalText = Title.toLowerCase();

                        return <li key={index} onClick={() => { ColorHandler(item.title); SlidBarHAndler(); }} className="Hover">
                          <Link to={`/page/${FinalText}`} className="nav-link">
                            <svg
                              width="18"
                              height="20"
                              viewBox="0 0 18 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                style={{
                                  fill: color === item.title && "#ec4899",
                                }}
                                d="M14 2.25H13.73C13.633 0.996 12.821 0.25 11.5 0.25H6.5C5.179 0.25 4.36702 0.996 4.27002 2.25H4C1.582 2.25 0.25 3.582 0.25 6V16C0.25 18.418 1.582 19.75 4 19.75H14C16.418 19.75 17.75 18.418 17.75 16V6C17.75 3.582 16.418 2.25 14 2.25ZM5.75 2.5C5.75 1.911 5.911 1.75 6.5 1.75H11.5C12.089 1.75 12.25 1.911 12.25 2.5V3.5C12.25 4.089 12.089 4.25 11.5 4.25H6.5C5.911 4.25 5.75 4.089 5.75 3.5V2.5ZM16.25 16C16.25 17.577 15.577 18.25 14 18.25H4C2.423 18.25 1.75 17.577 1.75 16V6C1.75 4.423 2.423 3.75 4 3.75H4.27002C4.36702 5.004 5.179 5.75 6.5 5.75H11.5C12.821 5.75 13.633 5.004 13.73 3.75H14C15.577 3.75 16.25 4.423 16.25 6V16ZM12.75 10C12.75 10.414 12.414 10.75 12 10.75H6C5.586 10.75 5.25 10.414 5.25 10C5.25 9.586 5.586 9.25 6 9.25H12C12.414 9.25 12.75 9.586 12.75 10ZM10.75 14C10.75 14.414 10.414 14.75 10 14.75H6C5.586 14.75 5.25 14.414 5.25 14C5.25 13.586 5.586 13.25 6 13.25H10C10.414 13.25 10.75 13.586 10.75 14Z"
                                fill="#25314C"
                              />
                            </svg>
                            <span
                              style={{
                                color: color === item.title && "#ec4899",
                              }}
                            >
                              {item.title}
                            </span>
                          </Link>
                        </li>
                      })
                    }
                    <li className="Hover">
                      <Link onClick={LogOutHandler} to='/' className="nav-link">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.75 15V16C13.75 18.418 12.418 19.75 10 19.75H4C1.582 19.75 0.25 18.418 0.25 16V4C0.25 1.582 1.582 0.25 4 0.25H10C12.418 0.25 13.75 1.582 13.75 4V5C13.75 5.414 13.414 5.75 13 5.75C12.586 5.75 12.25 5.414 12.25 5V4C12.25 2.423 11.577 1.75 10 1.75H4C2.423 1.75 1.75 2.423 1.75 4V16C1.75 17.577 2.423 18.25 4 18.25H10C11.577 18.25 12.25 17.577 12.25 16V15C12.25 14.586 12.586 14.25 13 14.25C13.414 14.25 13.75 14.586 13.75 15ZM19.692 10.287C19.768 10.104 19.768 9.89699 19.692 9.71399C19.654 9.62199 19.599 9.539 19.53 9.47L16.53 6.47C16.237 6.177 15.762 6.177 15.469 6.47C15.176 6.763 15.176 7.23801 15.469 7.53101L17.189 9.25101H6C5.586 9.25101 5.25 9.58701 5.25 10.001C5.25 10.415 5.586 10.751 6 10.751H17.189L15.469 12.471C15.176 12.764 15.176 13.239 15.469 13.532C15.615 13.678 15.807 13.752 15.999 13.752C16.191 13.752 16.383 13.679 16.529 13.532L19.529 10.532C19.599 10.461 19.654 10.378 19.692 10.287Z"
                            fill="#25314C"
                          />
                        </svg>
                        <span>Log Out</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
          </div>
          {packageId > 0
            ? <div onClick={() => { ColorHandler(""); SlidBarHAndler() }} className="mx-[10px] px-[10px] py-[10px] rounded-[10px] bg-[#ec4899] mt-[20px]">
              <Link to="/upgrade">
                <div className="flex items-center">
                  <h6 className="text-white Demo">{t("You're Activated Membersip")}</h6>
                  <button className="bg-white text-[#ec4899] px-[10px] py-[3px] rounded-[10px] font-[500]">
                    {t('Active')}
                  </button>
                </div>
                <h6 className="TITLE font-[400] text-white">
                  {t('Enjoy premium and match anyway')}
                </h6>
              </Link>
            </div>
            : <div onClick={() => { ColorHandler(""); SlidBarHAndler() }} className="mx-[10px] px-[10px] py-[10px] rounded-[10px] bg-[#ec4899] mt-[20px]">
              <Link to="/upgrade">
                <div className="flex items-center">
                  <h6 className="text-white Demo">{t("Join Our Membership Today!")}</h6>
                  <button className="bg-white text-[#ec4899] px-[10px] py-[3px] rounded-[10px] font-[500]">
                    {t('Go')}
                  </button>
                </div>
                <h6 className="TITLE font-[400] text-white">
                  {t('Checkout GoMeet Premium..')}
                </h6>
              </Link>
            </div>}
        </div>
      </aside>

      {isVisible3 && (
        <div onClick={toggleBottomSheet} id="Verify" className="px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
          <div onClick={(e) => e.stopPropagation()} className="w-[25%] max-_430_:w-[100%] max-_768_:w-[80%] max-_1030_:w-[45%] max-_1500_:w-[30%] bg-white rounded-[15px] px-[15px] py-[10px]">
            <div className="flex flex-col justify-center items-center text-center">
              <div
                onClick={() => InputRef.current.click()}
                className="w-[138px] cursor-pointer border-2 border-dotted p-2 border-gray-400 rounded-full"
              >
                <div className="bg-gray-200 flex items-center justify-center h-[115px] rounded-full">
                  {input ? (
                    <img
                      src={input}
                      className="w-full h-full rounded-full object-cover"
                      alt=""
                    />
                  ) : (
                    <h2 className="m-0 font-medium text-3xl">+</h2>
                  )}
                  <input disabled={input && true}
                    ref={InputRef}
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && InputHandler(e)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <h3>{t('Verification Under')} <br /> {t('Review')}</h3>
                <p className="font-medium text-lg">
                  {t('We are currently reviewing your')} <br /> {t('selfies and will get back to you')} <br /> {t("shortly!")}
                </p>
              </div>
              <button
                onClick={VerificationHandler}
                className="font-medium text-lg bg-[#980EFF] text-white w-[60%] max-w-[75%] rounded-lg py-2 my-4"
              >
                {t('Upload')}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="w-[100%] h-[100vh] bg-white fixed flex items-center justify-center top-0 left-0 right-0 bottom-0 z-[9999]">
          <div className="">
            <h2 className="">{t('Loading...')}</h2>
          </div>
        </div>
      )}

      {/* Profile photot add section  */}
      {profileimageshow && (
        <div onClick={ProfileHandler} id="EditPhoto" className="px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
          <div onClick={(e) => e.stopPropagation()} className="w-[25%] max-_430_:w-[100%] max-_768_:w-[80%] max-_1030_:w-[40%] max-_1500_:w-[30%] bg-white rounded-[15px] px-[15px] py-[10px]">
            <div className="flex flex-col justify-center items-center text-center">
              <div
                onClick={() => ProfileRef.current.click()}
                className="w-[138px] cursor-pointer border-[2px] border-dotted p-[10px] border-gray-400 rounded-full"
              >
                <div className="bg-[#e5e5e5] flex items-center justify-center h-[115px] rounded-full">
                  {imageSelect ? (
                    <img
                      src={`data:image/png;base64,${imageSelect}`}
                      className="w-[100%] h-[100%] rounded-full object-center"
                      alt=""
                    />
                  ) : (
                    <h2 className="m-0 font-[400] text-[30px]">+</h2>
                  )}
                  <input
                    ref={ProfileRef}
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(e) => SelectHandler(e)}
                  />
                </div>
              </div>
              <div className="mt-[15px]">
                <h3>{t('Add Your Favorite Photo')}</h3>
              </div>
              <button
                onClick={PhotoHandler}
                className="font-[500] text-[18px] bg-[#980EFF] text-white w-[60%] max-_430_:w-[75%] rounded-[10px] py-[8px] my-[15px]"
              >
                {t('Add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* <!-- Overlay Start --> */}
      <div
        ref={BgDisplay2}
        onClick={SlidBarHAndler}
        id="overlay"
        class="overlay z-[777] duration-[1s]"
      ></div>
      {/* <!-- Overlay End --> */}

      <div
        ref={Display2}
        onClick={ShowHAndler}
        id="overlay"
        class="fixed top-0 left-0 right-0 bottom-0 hidden z-[333] duration-[1s]"
      ></div>

      {atendCall && <div className="px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
        <div onClick={(e) => e.stopPropagation()} className="w-[20%] max-_430_:w-[100%]  max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] rounded-[15px]">
          <div className="flex items-end justify-center" style={{
            backgroundImage: `url(${imageBaseURL + callProPic})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "500px",
            width: "100%",
          }}>
            <div className="mb-[15px] text-center">
              <h2 className="text-white m-0">{notification.name}</h2>
              {callType === "Audio_Call"
                ? <h6 className="text-white mb-2">In Coming Audio Call ...</h6>
                : <h6 className="text-white mb-2">In Coming Video Call ...</h6>
              }
              <div className=" flex gap-[20px] justify-center">
                <button onClick={CallAnsuserHandler}><IoCall className="bg-green-500 text-white w-[45px] h-[45px] p-[10px] rounded-full" /></button>
                <button onClick={leaveCallHandler} ><IoCall className="bg-red-500 text-white w-[45px] h-[45px] p-[10px] rounded-full rotate-[135deg]" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>}

      {callStatus && <div className="px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
        <div onClick={(e) => e.stopPropagation()} className="w-[20%] max-_430_:w-[100%]  max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] rounded-[15px]">
          {callType === "Audio_Call"
            ? <VoiceCall Id={notification.id} name={notification.name} channelname={notification.Audio} img={imageBaseURL + callProPic} />
            : <VideoCall channelname={notification.vcId} Id={notification.id} img={imageBaseURL + callProPic} />
          }
        </div>
      </div>}

      {locationError && (
        <div className="px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
          <div className="w-[25%] max-_430_:w-[100%] max-_768_:w-[75%] max-_1030_:w-[35%] max-_1500_:w-[25%] bg-white rounded-[15px] px-[15px] py-[10px]">
            <div className="">
              <h2 className="m-0 text-center">{t('Enable Location Services')}</h2>
              <img src={LocationImg} alt="" />
              <div className="my-3">
                <div className="flex gap-[10px]">
                  <span className="text-[18px]">1.</span>
                  <h6>To provide accurate services, please enable your location.</h6>
                </div>
                <div className="flex gap-[5px]">
                  <span className="text-[18px]">2.</span>
                  <h6> Allow location access when prompted. If not prompted, enable it in your browser settings.</h6>
                </div>
                <h6>🔄 Refresh the page after enabling.</h6>
              </div>
              <button className="bg-[#980EFF] text-white w-[100%] rounded-[5px] py-[5px] mt-2 font-[500]">Enable Now</button>
            </div>
          </div>
        </div>
      )}

      {likeMatch && <div className="px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
        <div onClick={(e) => e.stopPropagation()} className="w-[25%] relative likeMatch bg-white max-_430_:w-[100%] p-[20px] max-_580_:w-[60%] max-_768_:w-[60%] max-_991_:w-[60%] max-_1030_:w-[50%] max-_1500_:w-[40%] rounded-[15px]">
          <button onClick={ProfileViewHandle} className="absolute -right-[8px] -top-[8px] bg-[#980EFF] p-[2px] rounded-full">< IoMdClose className="text-[22px] text-white" /></button>
          {totalLiked.length > 1
            ? <Slider {...settings}>
              {
                totalLiked?.map((item) => {
                  return <div>
                    <h3 className="text-center text-[#980EFF] text-[20px]">You and <span className="text-[#9000ffb2]">{item.profile_name}</span> liked each other!</h3>
                    <div className="flex items-center justify-center gap-2 mt-[50px]">
                      <div className="text-center w-[165px] max-_430_:w-[135px]">
                        <img src={imageBaseURL + item.profile_images[0]} className="h-[200px] max-_430_:h-[180px] w-[150px] mx-auto z-[1] object-cover likematchleft border-[6px] border-[#980EFF]" alt="" />
                        <h4 className="mt-[8px] overflow-ellipsis overflow-hidden whitespace-nowrap">{item.profile_name}</h4>
                      </div>
                      <div className="absolute flex items-center justify-center mt-[8px] p-[8px] rounded-full mb-[8px] bg-[#501368] z-[2]">
                        <svg
                          className="size-full w-[50px] -rotate-90"
                          viewBox="0 0 36 36"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-current text-[#e7cdfab9]"
                            strokeWidth="3"
                          ></circle>
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            className="stroke-current text-[#a32aff] dark:text-[#ac41ff]"
                            strokeWidth="3"
                            strokeDasharray="100"
                            strokeDashoffset={100 - item.match_ratio.toFixed(0)}
                            strokeLinecap="round"
                          ></circle>
                        </svg>
                        <h6 className="m-0 absolute text-white text-[14px] p-[5px]">
                          {item.match_ratio.toFixed(0)}%
                        </h6>
                      </div>
                      <div className="text-center w-[165px] max-_430_:w-[135px]">
                        <img src={imageBaseURL + myData.pro_pic} className="h-[200px] max-_430_:h-[180px] w-[150px] mx-auto z-[1] object-cover likematchright" alt="" />
                        <h4 className="mt-[8px] overflow-ellipsis overflow-hidden whitespace-nowrap ">{myData.name}</h4>
                      </div>
                    </div>
                    <button onClick={() => SendMessageHandle(item.profile_id, item.profile_name)} className="likeMatchButton mt-[30px] mx-auto">
                      <img src={SendMessage} alt="" />
                      <h6 className="m-0">Send a message</h6>
                    </button>
                    <button onClick={KeepSwipingHandle} className="likeMatchButton mt-[10px] mx-auto">
                      <img src={Keepswiping} alt="" />
                      <h6 className="m-0">Keep Swiping</h6>
                    </button>
                  </div>
                })
              }
            </Slider>
            : totalLiked?.map((item) => {
              return <div>
                <h3 className="text-center text-[#980EFF] text-[20px]">You and <span className="text-[#9000ffb2]">{item.profile_name}</span> liked each other!</h3>
                <div className="flex items-center justify-center gap-2 mt-[50px]">
                  <div className="text-center w-[165px] max-_430_:w-[135px]">
                    <img src={imageBaseURL + item.profile_images[0]} className="h-[200px] max-_430_:h-[180px] w-[150px] mx-auto z-[1] object-cover likematchleft border-[6px] border-[#980EFF]" alt="" />
                    <h4 className="mt-[8px] overflow-ellipsis overflow-hidden whitespace-nowrap">{item.profile_name}</h4>
                  </div>
                  <div className="absolute flex items-center justify-center mt-[8px] p-[8px] rounded-full mb-[8px] bg-[#501368] z-[2]">
                    <svg
                      className="size-full w-[50px] -rotate-90"
                      viewBox="0 0 36 36"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-current text-[#e7cdfab9]"
                        strokeWidth="3"
                      ></circle>
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-current text-[#a32aff] dark:text-[#ac41ff]"
                        strokeWidth="3"
                        strokeDasharray="100"
                        strokeDashoffset={100 - item.match_ratio.toFixed(0)}
                        strokeLinecap="round"
                      ></circle>
                    </svg>
                    <h6 className="m-0 absolute text-white text-[14px] p-[5px]">
                      {item.match_ratio.toFixed(0)}%
                    </h6>
                  </div>
                  <div className="text-center w-[165px] max-_430_:w-[135px]">
                    <img src={imageBaseURL + myData.pro_pic} className="h-[200px] max-_430_:h-[180px] w-[150px] mx-auto z-[1] object-cover likematchright" alt="" />
                    <h4 className="mt-[8px] overflow-ellipsis overflow-hidden whitespace-nowrap ">{myData.name}</h4>
                  </div>
                </div>
                <button onClick={() => SendMessageHandle(item.profile_id, item.profile_name)} className="likeMatchButton mt-[30px] mx-auto">
                  <img src={SendMessage} alt="" />
                  <h6 className="m-0">Send a message</h6>
                </button>
                <button onClick={KeepSwipingHandle} className="likeMatchButton mt-[10px] mx-auto">
                  <img src={Keepswiping} alt="" />
                  <h6 className="m-0">Keep Swiping</h6>
                </button>
              </div>
            })
          }
        </div>
      </div>}
      {/* <<------------ Chat Sheet Show ---------->> */}
      {(chatId && showChat) && <div onClick={ChatCloseHandle} className="bottom-sheet z-[999]">
        <div onClick={(e) => e.stopPropagation()} style={{ width: "400px" }} className="bottom-sheet-content">
          <UserChat />
        </div>
      </div>}
    </div>
  );
};
export default Header;
/* jshint ignore:end */
