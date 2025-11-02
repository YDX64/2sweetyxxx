/* jshint esversion: 6 */
/* jshint esversion: 8 */
/* jshint esversion: 9 */
/* jshint esversion: 11 */
/* jshint ignore:start */
import React, { useContext, useEffect, useRef, useState } from "react";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import CloseIcon from "../Icon/times.svg";
import { HiOutlineLocationMarker } from "react-icons/hi";
import Lottie from "lottie-react";
import DisLike from "../JSON File/dislike.json";
import Like from "../JSON File/like.json";
import { MyContext } from "../Context/MyProvider";
import axios from "axios";
import Crown from "../Icon/crown-alt.png";
import { useTranslation } from "react-i18next";
import UserChat from "./UserChat";
import HeartIcon from "../Icon/heartRed.svg";
import ChatIcon from "../Icon/chat.svg";
import GiftIcon from "../Icon/gift.svg";
import { showTost } from "../showTost";
import CoinIcon from "../images/icons/buycoin-package.png";
import Slider from "react-slick";

const Dashboard = () => {
  const { t } = useTranslation();

  const { basUrl, setProfileId, imageBaseURL, setDetails, setBlockId, setChatId, chatId, setChatUserName, setCurrency } = useContext(MyContext);

  const [api, setApi] = useState([]);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [preference, setPreference] = useState("");
  const [distance, setDistance] = useState(0);
  const [agemin, setAgemin] = useState(16);
  const [agemax, setAgemax] = useState(40);
  const [isVisible, setIsVisible] = useState(false);
  const [giftid, setGiftId] = useState([]);
  const [interestId, setInterestId] = useState([]);
  const [language, setLanguage] = useState([]);
  const [religion, setReligion] = useState("");
  const [relationship, setRelationship] = useState("");
  const [verify, setVerify] = useState("");
  const [close, setClose] = useState([]);
  const [bg, setBg] = useState([]);
  const [gifterror, setGiftError] = useState(0);
  const [like, setLike] = useState([]);
  const [likeDn, setLikeDn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lazyLoading, setLazyLoading] = useState(false);
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [locatio, setLocation] = useState(false);
  const [iconArray, setIconArray] = useState([]);
  const [youCoin, setYouCoin] = useState();
  const [totalPrice, setTotalPrice] = useState(0);
  const [giftReceiverId, setGiftreceiverId] = useState();
  const [giftImg, setGiftImg] = useState([]);
  const [interestList, setInterestList] = useState([]);
  const [languageList, setLanguageList] = useState([]);
  const [religionList, setReligionList] = useState([]);
  const [relationshipList, setRelationshipList] = useState([]);
  const [filterinclude, setFilterinclude] = useState();
  const [directchat, setDirectchat] = useState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(0);
  const [totalCards, setTotalCards] = useState(0);

  const kilometers = Math.floor(distance / 100);
  const centimeters = distance % 100;

  const AGEMIN = Math.max(agemin, 0);
  const AGEMAX = Math.max(agemax, 0);

  const Classadd = useRef();
  const BgDisplay = useRef();

  const min = 1;
  const max = 50000;

  const percent = ((distance - min) / (max - min)) * 100;
  const percentmin = ((agemin - 0) / (100 - 0)) * 100;
  const percentmax = ((agemax - 100) / (0 - 100)) * 100;

  const sliderStyle = {
    background: `linear-gradient(to right, rgba(152,14,255,255) ${percent}%, rgba(199, 197, 197, 0.801) ${percent}%)`,
  };

  var settings2 = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000
  };

  const FilterHandler = () => {
    if (open) {
      Classadd.current.classList.remove("open");
    } else {
      Classadd.current.classList.add("open");
    }
    setOpen(!open);

    if (open2) {
      BgDisplay.current.style.display = "none";
    } else {
      BgDisplay.current.style.display = "block";
    }
    setOpen2(!open2);
  };

  const toggleBottomSheet = (e) => {
    if (e === "GidtSend") {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  };

  const GiftHandler = (id, price, img) => {
    const giftPrice = parseInt(price);

    if (giftid.includes(id)) {
      setGiftId(giftid.filter((el) => el !== id));
      setTotalPrice(totalPrice - giftPrice);
      setGiftError(gifterror - 1);
      setGiftImg(giftImg.filter((el) => el !== img));
    } else {
      if (totalPrice + giftPrice > youCoin) {
        showTost({ title: "insufficient coins in wallet" });
      } else {
        setGiftId([...giftid, id]);
        setTotalPrice(totalPrice + giftPrice);
        setGiftError(gifterror + 1);
        setGiftImg([...giftImg, img]);
      }
    }
  };


  const SednHandler = () => {
    const localData = localStorage.getItem("Register_User");

    if (localData) {
      const userData = JSON.parse(localData);
      if (!gifterror) {
        showTost({ title: "Please Select Gift" });
      } else {

        const img = giftImg.join(';');
        axios.post(`${basUrl}giftbuy.php`,
          {
            sender_id: userData.id,
            coin: totalPrice,
            receiver_id: giftReceiverId,
            gift_img: img
          }
        )
          .then((res) => {
            if (res.data.Result == "true") {
              setGiftId("");
              setGiftError("");
              setTotalPrice("");
              CoinHandler();
              showTost({ title: "Gift Send Successfully!!" });
              setIsVisible(false);
            }
          });
      }
    }
  };

  const InterestMapHandler = (id) => {
    if (interestId.includes(id)) {
      setInterestId(interestId.filter((el) => el !== id));
    } else {
      if (interestId.length > 4) return;
      setInterestId([...interestId, id]);
    }
  };

  const LanguageMapHandler = (id) => {
    if (language.includes(id)) {
      setLanguage(language.filter((el) => el !== id));
    } else {
      if (language.length > 4) return;
      setLanguage([...language, id]);
    }
  };

  const IdHandler = (i, index, name) => {
    const Title = name.replace(/\s+/g, '_');
    const FinalText = Title.toLowerCase();
    navigate(`/detail/${FinalText}`);
    setDetails(i);
    setBlockId(index);
    localStorage.setItem("DetailsId", index);
  };

  const CloseAnimationHandler = (Id, Name) => {
    setClose((e) => [...e, Id]);

    const localData = localStorage.getItem("Register_User");
    const userData = JSON.parse(localData);

    setTimeout(() => {
      setBg((e) => [...e, Name]);
    }, 1600);

    axios.post(`${basUrl}like_dislike.php`, { uid: userData.id, profile_id: Id, action: "UNLIKE" })
      .then((res) => {
        showTost({ title: res.data.ResponseMsg });
      });

  };

  const LikeAnimationHandler = (Id, Name) => {
    const localData = localStorage.getItem("Register_User");
    const userData = JSON.parse(localData);

    setLike((e) => [...e, Id]);
    setTimeout(() => {
      setLikeDn((e) => [...e, Name]);
    }, 1600);

    axios.post(`${basUrl}like_dislike.php`, { uid: userData.id, profile_id: Id, action: "LIKE" })
      .then((res) => {
        showTost({ title: res.data.ResponseMsg });
      });
  };

  const fetchUserData = async () => {
    const localData = localStorage.getItem("Register_User");

    if (localData) {

      const userData = JSON.parse(localData);

      if (currentIndex < 0) {
        setLoading(true);
      } else {
        setLazyLoading(true);
      }

      try {
        const response = await axios.post(`${basUrl}home_data.php`, {
          uid: userData.id,
          lats: latitude,
          longs: longitude,
        });

        if (response.data.Result === "true") {
          if (!localStorage.getItem("FilterData")) {
            if (currentIndex > 0) {
              setApi(prevCards => [
                ...prevCards,
                ...response.data.profilelist.slice(currentIndex, currentIndex + 12),
              ]);
            } else {
              setApi(response.data.profilelist.slice(0, currentIndex + 12));
            }
            setTotalCards(response.data.profilelist.length);
          }

          const profileList = response.data.profilelist;
          const lastProfile = profileList?.length > 0 ? profileList[profileList.length - 1] : null;
          setProfileId(lastProfile ? lastProfile.profile_id : null);

          setCurrency(response.data.currency);
          await setFilterinclude(response.data.filter_include);
          await setDirectchat(response.data.direct_chat);

          localStorage.setItem("Profile_ratio", response.data.profile_percentage);
          localStorage.setItem("PurchaseId", response.data.plan_id);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
        setLazyLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("FilterData")) {
      fetchUserData();
    } else {
      FilterDataGetHandler("");
    }
  }, [currentIndex, currentIndex2]);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.scrollHeight) {
      if (api.length < totalCards) {
        const newIndex = currentIndex + 12;
        if (!localStorage.getItem("FilterData")) {
          setCurrentIndex(newIndex);
        } else {
          setCurrentIndex2(newIndex);
        }
      }
    }
  };

  // Hook to handle scrolling
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);  // Clean up
  }, [handleScroll]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocation(true);
        } else {
          setLocation(false);
        }

      });
    fetchUserData();
    FilterDataGetHandler("");

  }, [longitude, latitude]);

  const CoinHandler = () => {
    const localData = localStorage.getItem("Register_User");

    if (localData) {
      const userData = JSON.parse(localData);
      axios.post(`${basUrl}coin_report.php`, { uid: userData.id })
        .then((res) => {
          setYouCoin(res.data.coin);
        });
    }
  };

  useEffect(() => {
    axios.post(`${basUrl}gift_list.php`)
      .then((res) => {
        setIconArray(res.data.giftlist);
      });

    CoinHandler();
    GetHandler();
  }, []);

  // <<------- Filter Api Call -------->>
  const FilterResetHandler = async (id) => {
    if (id) {
      setLoading(true);
      setApi("");
      setCurrentIndex(0);
      setCurrentIndex2(0);
      setTotalCards(0);
      fetchUserData();
    }
    showTost({ title: "Filter Reset Successfully!!" });
    setDistance(0);
    setAgemin(16);
    setAgemax(40);
    setPreference("");
    setInterestId("");
    setLanguage("");
    setReligion("");
    setRelationship("");
    setVerify("");
    localStorage.setItem("FilterData", "");
  };

  const FilterApplyHandler = async () => {
    const localData = localStorage.getItem("Register_User");

    if (!localData) return;
    const userData = JSON.parse(localData);

    const FilterData = {
      uid: userData.id,
      radius_search: distance === 0 ? 0 : String(distance / 100),
      search_preference: preference || "0",
      lats: latitude,
      longs: longitude,
      minage: String(agemin),
      maxage: String(agemax),
      relation_goal: relationship || "0",
      interest: interestId.length > 0 ? interestId.join(',') : "0",
      religion: religion || "0",
      language: language.length > 0 ? language.join(',') : "0",
      is_verify: verify || "0"
    };

    await localStorage.setItem("FilterData", JSON.stringify(FilterData));


    await setApi("");
    setCurrentIndex(0);
    setTotalCards(0);

    FilterDataGetHandler(1);
  };


  const FilterDataGetHandler = async (id) => {
    try {
      const localData = await localStorage.getItem("Register_User");
      const filterData = await localStorage.getItem("FilterData");

      if (!localData || !filterData) return;

      const userData = JSON.parse(localData);
      const filter = JSON.parse(filterData);

      const filterParams = {
        uid: userData.id,
        radius_search: filter.radius_search,
        search_preference: filter.search_preference,
        lats: latitude,
        longs: longitude,
        minage: filter.minage,
        maxage: filter.maxage,
        relation_goal: filter.relation_goal,
        interest: filter.interest,
        religion: filter.religion,
        language: filter.language,
        is_verify: filter.is_verify
      };

      if (currentIndex2 < 0) {
        setLoading(true);
      } else {
        setLazyLoading(true);
      }

      const response = await axios.post(`${basUrl}filter.php`, filterParams);

      if (response.data.Result === "true") {
        const newProfiles = response.data.profilelist.slice(currentIndex2, currentIndex2 + 12);

        setApi(prevCards => currentIndex2 > 0
          ? [...prevCards, ...newProfiles]
          : newProfiles
        );

        if (id) {
          FilterHandler();
          showTost({ title: response.data.ResponseMsg });
        }

        setTotalCards(response.data.profilelist.length);
        setLoading(false);
        setLazyLoading(false);
      }
    } catch (error) {
      console.error('Error fetching filtered data:', error);
      setLoading(false);
      setLazyLoading(false);
    }
  };

  // <<--------- intrest , Language , Religion , Relation All Api Call ------------>>

  const GetHandler = () => {
    // <<------------- intrest Api Call Hear -------------->>
    axios.post(`${basUrl}interest.php`)
      .then((res) => {
        setInterestList(res.data.interestlist);
      });

    // <<------------- Language Api Call Hear -------------->>
    axios.post(`${basUrl}languagelist.php`)
      .then((res) => {
        setLanguageList(res.data.languagelist);
      });

    // <<------------- Religion Api Call Hear -------------->>
    axios.post(`${basUrl}religionlist.php`)
      .then((res) => {
        setReligionList(res.data.religionlist);
      });

    // <<------------- RelationsipGoal Api Call Hear -------------->>
    axios.post(`${basUrl}goal.php`)
      .then((res) => {
        setRelationshipList(res.data.goallist);
      });

  };

  // <<-------- Users Chat Handler ------------>> 

  const ChatHandler = (UserId, name) => {
    if (directchat === "1") {
      setChatId(UserId);
      sessionStorage.setItem("ChatId",UserId);
      setChatUserName(name);
    } else {
      showTost({ title: "No Direct Chat any User" });
      navigate("/upgrade");
    }
  };

  const ChatCloseHandle = () => {
    setChatId("");
    sessionStorage.setItem("ChatId","");
}

  return (
    <>
      <div className="" style={{ userSelect: 'none', cursor: 'default' }}>
        {loading ? (
          <div className="w-[100%] h-[100vh] ms-[8rem] max-_991_:ms-0 bg-white fixed flex items-center justify-center top-0 left-0 right-0 bottom-0 z-[555]">
            <div>
              <h2 className="">{t('Loading...')}</h2>
            </div>
          </div>
        )
          : api.length > 0 ?
            <div className="main-wrapper bg-[#e5e5e5] dashboard">
              <div className="content-body ">
                <div className="container-fluid my-4">
                  <div className="row">
                    <div className="col-xl-12">
                      <div className="card card-rounded mb-4">
                        <div className="card-body">
                          <div className="person-header d-flex align-items-center justify-content-between">
                            <div className="fw-medium fs-16 px-3">
                              {t("Start Your Search for the Perfect Partner")}
                            </div>
                            {filterinclude == "1" && (localStorage.getItem("FilterData")
                              ? <button
                                onClick={() => FilterResetHandler(1)}
                                className="btn gap-1 df-center text-white "
                                id="toggleFilterBtn"
                                style={{ background: "rgb(152, 14, 255)" }}
                              >
                                <svg
                                  width="15"
                                  height="10"
                                  viewBox="0 0 15 10"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="mx-1"
                                >
                                  <path
                                    d="M6.15855 9.96157H9.3457V8.368H6.15855V9.96157ZM0.581055 0.400146V1.99372H14.9232V0.400146H0.581055ZM2.97141 5.97765H12.5328V4.38407H2.97141V5.97765Z"
                                    fill="white"
                                  ></path>
                                </svg>
                                {t('Reset')}
                              </button>
                              : <button
                                onClick={FilterHandler}
                                className="btn gap-1 df-center text-white"
                                id="toggleFilterBtn"
                                style={{ background: "rgb(152, 14, 255)" }}
                              >
                                <svg
                                  width="15"
                                  height="10"
                                  viewBox="0 0 15 10"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="mx-1"
                                >
                                  <path
                                    d="M6.15855 9.96157H9.3457V8.368H6.15855V9.96157ZM0.581055 0.400146V1.99372H14.9232V0.400146H0.581055ZM2.97141 5.97765H12.5328V4.38407H2.97141V5.97765Z"
                                    fill="white"
                                  ></path>
                                </svg>
                                {t('Filter')}
                              </button>)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-12 py-[20px]">
                      <div className="grid grid-cols-4 card p-[16px] card-rounded grid-transition grid-responsive ">
                        {api.map((el, i) => {
                          return <div
                            key={i}
                            className={`${bg.includes(el.profile_name) ? "hidden" : "block"
                              } ${likeDn.includes(el.profile_name) ? "hidden" : "block"
                              } custom-card cursor-pointer card-rounded-1 relative z-[444] overflow-hidden`}
                          >
                            {close.includes(el.profile_id) && (
                              <Lottie
                                className="w-[100%] absolute top-[120px] right-[0px] z-[777]"
                                key={i}
                                animationData={DisLike}
                                loop={true}
                              />
                            )}
                            {like.includes(el.profile_id) && (
                              <Lottie
                                className="w-[100%] absolute top-[120px] right-[0px] z-[777]"
                                key={i}
                                animationData={Like}
                                loop={true}
                              />
                            )}
                            <div
                              className={`${close?.includes(el?.profile_id) ||
                                like?.includes(el?.profile_id)
                                ? "opacity-0"
                                : "opacity-[1]"
                                } duration-[0.7s] ease-in`}
                            >
                              <div className="position-relative rounded-[3rem] overflow-hidden">
                                <div
                                  className="card-title"
                                  onClick={() => IdHandler(i, el.profile_id, el.profile_name)}
                                >
                                  <div className="Coloreffect">
                                    {el?.profile_images.length > 1
                                      ? <Slider {...settings2} className="w-[100%]">
                                        {
                                          el?.profile_images.map((el, index) => {
                                            return <div key={index}>
                                              <img className="img-fluid HEIGHT w-[100%] object-cover" src={`${imageBaseURL}${el}`} alt="" />
                                            </div>
                                          })
                                        }
                                      </Slider>
                                      : <img
                                        src={`${imageBaseURL}${el?.profile_images[0]}`}
                                        alt="img"
                                        className="img-fluid rounded-[3rem] BEFORE HEIGHT w-[100%] object-cover"
                                      />
                                    }

                                  </div>
                                  <div className="card-content absolute bottom-[2rem] px-[15px] w-[100%] z-[2]">
                                    <div className="flex items-end justify-between gap-2">
                                      <h6 className="fw-semi-bold text-[18px] overflow-ellipsis overflow-hidden whitespace-nowrap mb-1 text-white">
                                        {el.profile_name}, {el.profile_age}
                                      </h6>
                                      <div className="">
                                        {el.is_subscribe === "0" ? "" : <div className="flex items-center gap-[10px]">
                                          <div className="bg-white p-[2px] rounded-full z-[555]">
                                            <img
                                              src={Crown}
                                              style={{ width: "20px", height: "20px" }}
                                              alt="user-avatar"
                                              className="bg-[rgba(152,14,255,255)] rounded-full p-[2px]"
                                            />
                                          </div>
                                          <h1 className="text-[15px] text-white font-[500] m-0">{t('Premium')}</h1>
                                        </div>}
                                        <div className="relative flex items-center justify-center mt-[8px] mb-[8px]">
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
                                              className="stroke-current text-[#fffdfd3f]"
                                              strokeWidth="3"
                                            ></circle>
                                            <circle
                                              cx="18"
                                              cy="18"
                                              r="16"
                                              fill="none"
                                              className="stroke-current text-white dark:text-white"
                                              strokeWidth="3"
                                              strokeDasharray="100"
                                              strokeDashoffset={`${100 - el.match_ratio.toFixed(0)}`}
                                              strokeLinecap="round"
                                            ></circle>
                                          </svg>
                                          <h6 className="m-0 absolute text-white text-[14px] p-[5px]">
                                            {el.match_ratio.toFixed(0)}%
                                          </h6>
                                        </div>
                                        <div className="KM whitespace-nowrap">
                                          <h6 className="m-0 flex items-center justify-center gap-[5px]"><HiOutlineLocationMarker />{el.profile_distance}</h6>
                                        </div>
                                      </div>
                                    </div>
                                    <p className="mb-1 text-[19px] text-start mt-[5px] text-white overflow-ellipsis overflow-hidden whitespace-nowrap">
                                      {el.profile_bio === "undefined" ? "" : el.profile_bio}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="-mt-[25px] max-_430_:-mt-[20px]">
                                <div className="image-action-icon items-center cursor-default">
                                  <button
                                    style={{ width: "3rem", height: "3rem" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      CloseAnimationHandler(el.profile_id, el.profile_name);
                                    }}
                                    className="action-btn avatar avatar-lg rounded-full z-1 bg-black"
                                  >
                                    <RxCross2 className="w-[50px] text-yellow-400" />
                                  </button>
                                  <button
                                    style={{
                                      height: "3.40rem",
                                      width: "3.40rem",
                                      background: "black",
                                    }}
                                    className="action-btn avatar avatar-lg rounded-full z-1"
                                  >
                                    <img src={HeartIcon} alt="Heart icon" className="w-[30px]" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); ChatHandler(el.profile_id, el.profile_name); }}
                                    style={{
                                      height: "3.40rem",
                                      width: "3.40rem",
                                      background: "black",
                                    }}
                                    className="action-btn avatar avatar-lg rounded-full z-1"
                                  >
                                    <img src={ChatIcon} alt="Chat icon" className="w-[30px]" />
                                  </button>
                                  <button
                                    style={{ width: "3rem", height: "3rem" }}
                                    className="action-btn avatar avatar-lg rounded-full z-1 bg-black"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleBottomSheet();
                                      setGiftreceiverId(el.profile_id);
                                    }}
                                  >
                                    <img src={GiftIcon} alt="Gift icon" className="w-[30px]" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        })}
                        {lazyLoading && <div>Loading...</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            : localStorage.getItem("FilterData")
              ? <div className="h-[100vh] ms-[16rem] max-_991_:ms-0 flex justify-center items-center">
                <div className="text-center">
                  <h3>{t('No Any Match Profile...')}</h3>
                  <button onClick={() => FilterResetHandler(1)} className="text-[18px] font-[600] mt-[20px] bg-[rgba(152,14,255,255)] text-white w-[50%] py-[10px] rounded-[10px]">
                    {t('Reset')}
                  </button>
                </div>
              </div>
              :
              <div className="h-[100vh] ms-[16rem] max-_991_:ms-0 flex justify-center items-center">
                <h3>{t('No Any New Profile...')}</h3>
              </div>
        }


        <div ref={Classadd} className="filter-area overflow-y-scroll w-[100%]">
          <div className="filter-content">
            <div className="filter-heading">
              <h3 className="fw-semi-bold mb-0">{t('Filter & Show')}</h3>
              <button onClick={FilterHandler}>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  role="button"
                  className="close-btn"
                >
                  <path
                    d="M11.0245 8.06519L16.3109 2.77875C16.614 2.47564 16.7812 2.07223 16.7812 1.6437C16.7812 1.21517 16.614 0.811761 16.3109 0.508654C16.0078 0.205546 15.6044 0.0383301 15.1759 0.0383301C14.7474 0.0383301 14.3439 0.205546 14.0408 0.508654L8.75439 5.79509L3.46796 0.508654C3.16485 0.205546 2.76144 0.0383301 2.33291 0.0383301C1.90438 0.0383301 1.50097 0.205546 1.19786 0.508654C0.894755 0.811761 0.727539 1.21517 0.727539 1.6437C0.727539 2.07223 0.894755 2.47564 1.19786 2.77875L6.4843 8.06519L1.19786 13.3516C0.894755 13.6547 0.727539 14.0581 0.727539 14.4867C0.727539 14.9152 0.894755 15.3186 1.19786 15.6217C1.50147 15.9248 1.90438 16.092 2.33291 16.092C2.76144 16.092 3.16435 15.9248 3.46796 15.6217L8.75439 10.3353L14.0408 15.6217C14.3444 15.9248 14.7474 16.092 15.1759 16.092C15.6044 16.092 16.0073 15.9248 16.3109 15.6217C16.614 15.3186 16.7812 14.9152 16.7812 14.4867C16.7812 14.0581 16.614 13.6547 16.3109 13.3516L11.0245 8.06519Z"
                    fill="#808080"
                  ></path>
                </svg>
              </button>
            </div>


            <div className="filter-element border-b-[2px] pb-[20px] border-gray-300">
              <div className="">
                <div className="flex justify-between items-center">
                  <h1 className="text-[16px] font-[400] text-black">
                    {t('Distance Range')}
                  </h1>
                  <h1 className="text-[16px] font-[400] text-black">
                    {kilometers}.{centimeters} {t('km')}
                  </h1>
                </div>
                <input
                  style={sliderStyle}
                  type="range"
                  className="Range"
                  min="0"
                  max="50000"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-element border-b-[2px] pb-[20px] border-gray-300">
              <div
                className="range-slider position-relative w-100 pb-3"
                data-role="rangeslider"
              >
                <div className="range-label mb-3">
                  <label className="form-label">{t('Age')}</label>
                  <span id="range-value" className="form-label">
                    {AGEMIN}-{AGEMAX}
                  </span>
                </div>
                <div className="track position-absolute w-100"></div>
                <div
                  style={{ left: percentmin + "%", right: percentmax + "%" }}
                  className="fill position-absolute"
                  id="fill"
                ></div>

                <input
                  type="range"
                  name="ageMin"
                  id="ageMin"
                  value={agemin}
                  onChange={(e) => {
                    const min = e.target.value;
                    min < agemax && setAgemin(min);
                  }}
                  min="0"
                  max="101"
                  className="position-absolute border-0 form-input-range"
                />

                <input
                  type="range"
                  name="ageMax"
                  id="ageMax"
                  value={agemax}
                  onChange={(e) => {
                    const max = e.target.value;
                    max > agemin && setAgemax(max);
                  }}
                  min="0"
                  max="100"
                  className="position-absolute border-0 form-input-range"
                />
              </div>
            </div>

            <div className="filter-element border-b-[2px] pb-[20px] border-gray-300">
              <h6 className="text-[18px] font-[500] max-_430_:text-[16px]">
                {t('Serach Preference')}
              </h6>
              <div className="">
                <ul className="flex flex-wrap items-center gap-[10px]  m-0 p-0">
                  <li
                    onClick={() => setPreference("MALE")}
                    className={`${preference === "MALE" && "Active"
                      } text-[16px] cursor-pointer border-[2px] border-gray-300 rounded-full py-[5px] px-[15px]`}
                  >
                    {t('MALE')}
                  </li>
                  <li
                    onClick={() => setPreference("FEMALE")}
                    className={`${preference === "FEMALE" ? "Active" : "hover:bg-[#ddd]"
                      } text-[16px] cursor-pointer border-[2px] border-gray-300 rounded-full py-[5px] px-[15px]`}
                  >
                    {t('FEMALE')}
                  </li>
                  <li
                    onClick={() => setPreference("Both")}
                    className={`${preference === "Both" ? "Active" : "hover:bg-[#ddd]"
                      } text-[16px] cursor-pointer border-[2px] border-gray-300 rounded-full py-[5px] px-[15px]`}
                  >
                    {t('Both')}
                  </li>
                </ul>
              </div>
            </div>
            {/* <!-- Serach Preference End --> */}

            {/* <!-- Interests Start --> */}
            <div className="filter-element border-b-[2px] pb-[20px] border-gray-300">
              <h6 className="text-[18px] font-[500] max-_430_:text-[16px]">
                {t('Interests')}
              </h6>
              <div className="">
                {interestList.map((el, index) => {
                  return (
                    <button key={index}
                      onClick={() => InterestMapHandler(el.id)}
                      className="inline-block"
                    >
                      <div
                        className={`button text-[16px] max-_430_:text-[14px] px-[13px] py-[5px] border-[2px] border-gray-300 rounded-[50px] mb-[10px] me-[10px] flex items-center gap-[10px] ${interestId.includes(el.id) && "selected"
                          }`}
                      >
                        {t(el.title)}{" "}
                        <img
                          src={imageBaseURL + el.img}
                          alt=""
                          className="w-[20px] h-[20px]"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* <!-- Interests End --> */}

            {/* <!-- Languages Start --> */}
            <div className="filter-element border-b-[2px] pb-[20px] border-gray-300">
              <h6 className="text-[18px] font-[500] max-_430_:text-[16px]">
                {t('Langusges I Know')}
              </h6>
              {languageList.map((el, index) => {
                return (
                  <button key={index}
                    onClick={() => LanguageMapHandler(el.id)}
                    className="inline-block"
                  >
                    <div
                      className={`button text-[16px] px-[13px] py-[5px] border-[2px] gap-[5px] border-gray-300 rounded-[50px] mb-[10px] me-[10px] flex items-cente ${language.includes(el.id) && "selected"
                        }`}
                    >
                      {t(el.title)}{" "}
                    </div>
                  </button>
                );
              })}
            </div>
            {/* <!-- Languages End --> */}

            {/* <!-- Religion Start --> */}
            <div className="filter-element border-b-[2px] pb-[20px] border-gray-300">
              <h6 className="text-[18px] font-[500] max-_430_:text-[16px]">
                {t('Religion')}
              </h6>
              {religionList.map((el, index) => {
                return (
                  <h6 key={index}
                    onClick={() => setReligion(index)}
                    className={`font-[400] text-[16px] inline-block me-[15px] cursor-pointer border-[2px] border-gray-300 rounded-full py-[8px] px-[15px] ${religion === index ? "Active" : "hover:bg-[#ddd]"
                      }`}
                  >
                    {t(el.title)}
                  </h6>
                );
              })}
            </div>
            {/* <!-- Religion End --> */}

            {/* <!-- Relationship Goals Start --> */}
            <div className="filter-element border-b-[2px] pb-[20px] border-gray-300">
              <h6 className="text-[18px] font-[500] max-_430_:text-[16px]">
                {t('Relationship Goals')}
              </h6>
              {relationshipList.map((el, index) => {
                return (
                  <button key={index}
                    onClick={() => setRelationship(index)}
                    className="inline-block"
                  >
                    <div
                      className={`text-[16px] px-[13px] py-[5px] border-[2px] gap-[5px] border-gray-300 rounded-[50px] mb-[10px] me-[10px] flex items-cente ${relationship === index ? "Active" : "hover:bg-[#ddd]"
                        }`}
                    >
                      {t(el.title)}{" "}
                    </div>
                  </button>
                );
              })}
            </div>
            {/* <!-- Relationship Goals End --> */}

            {/* <!-- Verify Profile Goals Start --> */}
            <div className="filter-element">
              <h6 className="text-[18px] font-[500] max-_430_:text-[16px]">
                {t('Verify Profile')}
              </h6>
              <div className="">
                <button
                  onClick={() => setVerify("0")}
                  className={` font-[400] text-[16px] inline-block me-[15px] cursor-pointer border-[2px] border-gray-300 rounded-full py-[5px] px-[15px] ${verify === "0" ? "Active" : "hover:bg-[#ddd]"
                    }`}
                >
                  {t('Unverify')}
                </button>
                <button
                  onClick={() => setVerify("2")}
                  className={` font-[400] text-[16px] inline-block me-[15px] cursor-pointer border-[2px] border-gray-300 rounded-full py-[5px] px-[15px] ${verify === "2" ? "Active" : "hover:bg-[#ddd]"
                    }`}
                >
                  {t('Verify')}
                </button>
              </div>
            </div>
            {/* <!-- Verify Profile Goals End --> */}


            {/* <!-- Apply Btn Start --> */}
            <div className="flex justify-center gap-[15px] mt-[20px]">
              <button onClick={FilterResetHandler} className="text-[18px] font-[600] text-[rgba(152,14,255,255)] bg-[#c67aff6c] w-[40%] py-[10px] rounded-[10px]">
                {t('Reset')}
              </button>
              <button onClick={FilterApplyHandler} className="text-[18px] font-[600] bg-[rgba(152,14,255,255)] text-white w-[40%] py-[10px] rounded-[10px]">
                {t('Apply')}
              </button>
            </div>
            {/* <!-- Apply Btn End --> */}
          </div>
        </div>

        {/* <!-- Overlay Start --> */}
          <div
            ref={BgDisplay}
            onClick={FilterHandler}
            id="overlay"
            class="overlay z-[888]"
          ></div>
        {/* <!-- Overlay End -->
 
         {/* <!-- Scroll To Top Start --> */}
        <button className="scroll-to-top block">
          <svg
            width="16"
            height="10"
            viewBox="0 0 16 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.408 1.23077L14.9362 12.3077C15.1175 12.6154 14.8908 13 14.5282 13H1.47184C1.10916 13 0.882484 12.6154 1.06382 12.3077L7.59199 1.23077C7.77333 0.923077 8.22667 0.923077 8.408 1.23077Z"
              stroke="var(--primary-color)"
              stroke-width="2"
            />
          </svg>
        </button>
        {/* <!-- Scroll To Top End --> */}

        {isVisible && (
          <div onClick={() => toggleBottomSheet('GidtSend')} className="bottom-sheet z-[999]">
            <div onClick={(e) => e.stopPropagation()} className="bottom-sheet-content">
              <div className="flex items-center justify-between">
                <h1 className="text-[18px] m-0 font-[600]">Send Gifts</h1>
                <div className="flex items-center gap-[10px]">
                  <img src={CoinIcon} alt="" className="w-[25px]" />
                  <span className="text-[18px]">{youCoin ? youCoin : "0"}</span>
                  <img
                    onClick={() => toggleBottomSheet('GidtSend')}
                    src={CloseIcon}
                    alt=""
                    className="w-[15px] ms-[15px] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-[20px] mx-auto mt-3 max-_430_:gap-[10px]">
                {iconArray.map((el, i) => {
                  return (
                    <button
                      onClick={() => GiftHandler(el.id, el.price, el.img)}
                      style={{
                        borderColor: giftid.includes(el.id)
                          ? "rgba(152,14,255,255)"
                          : "#D1D5DB",
                      }}
                      className="w-[20%] max-_430_:w-[calc(25%-10px)] border-[2px] flex justify-center py-[5px] rounded-[10px] relative"
                    >
                      <div className="relative">
                        <img
                          src={imageBaseURL + el.img}
                          alt=""
                          className="w-[45px] mx-auto max-_380_:w-[40px] max-_380_:h-[40px] max-_330_:w-[30px] max-_330_:h-[30px]"
                        />
                        <div className="flex items-center justify-center gap-[5px] mt-2">
                          <img
                            src={CoinIcon}
                            alt=""
                            className={`w-[15px] ${el.price === "0" && "hidden text-center"}`}
                          />
                          <span className="text-[14px] font-[500]">
                            {el.price === "0" ? "Free" : el.price}
                          </span>
                        </div>
                        <IoIosCheckmarkCircle
                          style={{
                            display: giftid.includes(el.id) ? "block" : "none",
                          }}
                          className="absolute -top-[15px] -right-[30px] max-_380_:-right-[20px] max-_330_:-right-[10px] w-[25px] h-[25px] text-[rgba(152,14,255,255)] bg-white rounded-full"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => SednHandler()}
                className="font-bold text-[18px] rounded-[10px] mt-[20px] text-white py-[10px] w-[100%] bg-[rgba(152,14,255,255)]"
              >
                {t('Send')}
              </button>
            </div>
          </div>
        )}

        {/* <<------------ Chat Sheet Show ---------->> */}
        {chatId && <div onClick={ChatCloseHandle} className="bottom-sheet z-[999]">
          <div onClick={(e) => e.stopPropagation()} style={{ width: "400px" }} className="bottom-sheet-content">
            <UserChat />
          </div>
        </div>}
      </div>
    </>
  );
};

export default Dashboard;
/* jshint ignore:end */

