/* jshint esversion: 6 */
/* jshint ignore:start */
import React, { useContext, useEffect, useState } from "react";
import Dott from "../Icon/more-vertical.svg";
import HidePassword from "../Icon/eye-slash.svg";
import flag from "../Icon/flag-triangle.svg";
import plus from "../Icon/plus.svg";
import Bell from "../Icon/bell-slash.svg";
import BlockIcon from '../Icon/block.gif';
import Setting from "../Icon/settings.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import CloseIcon from "../Icon/times.svg";
import { IoIosCheckmarkCircle } from "react-icons/io";
import axios from "axios";
import { MyContext } from "../Context/MyProvider";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { useTranslation } from "react-i18next";
import UserChat from "./UserChat";
import { showTost } from "../showTost";
import CoinIcon from "../images/icons/buycoin-package.png";
import verify from "../images/icons/verify.png";
import verify1 from "../images/icons/verify-1.png";
import Review from "../images/icons/information.png";
export const ReportComment = ["Harassment", "inappropriate Content", "Violation of Terms", "Threats", "Castfishing", "Unwanted Advances", "Unsolicited Explicit Content", "Privacy Concerns", "Scam or Spam", "Unwanted Advances"];

const Detail = () => {

  const { t } = useTranslation();

  const { basUrl, imageBaseURL, setChatUserName, setChatId, chatId } = useContext(MyContext);

  const [options, setOption] = useState(false);
  const [report, setReport] = useState(false);
  const [dot, setDot] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [giftid, setGiftId] = useState([]);
  const [gifterror, setGiftError] = useState(0);
  const [api, setApi] = useState([]);
  const [imageData, setImageData] = useState([]);
  const [isverify, setIsVerify] = useState();
  const [comment, setComment] = useState();
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [giftList, setGiftList] = useState([]);
  const [yourCoin, setYourCoin] = useState();
  const [totalPrice, setTotalPrice] = useState(0);
  const [giftImg, setGiftImg] = useState([]);
  const [giftReceiverId, setGiftreceiverId] = useState();
  const [loding, setLoding] = useState(true);
  const [iconDis, setIconDis] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  // useEffect(() => {
  //   const favicon = document.querySelector('link[rel="icon"]');

  //   if (location.pathname.includes('detail')) {
  //     favicon.href = FaviconIcon ;
  //   }
  // }, [location]);

  const toggleBottomSheet = (e) => {
    if (e.target.id === 'BlockSection') {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  };

  const SendReportHamdler = (id) => {
    if (dot) {
      const UserData = localStorage.getItem("Register_User");

      const UserId = JSON.parse(UserData);

      axios.post(`${basUrl}report.php`,
        {
          uid: UserId.id,
          reporter_id: id,
          comment: comment
        }
      )
        .then((res) => {
          if (res.data.Result === "true") {
            showTost({ title: res.data.ResponseMsg });
            setReport(false);
          }
        });
    } else {
      showTost({ title: "Something Went Wrong!" });
    }
  };

  const ReportToggle = (e) => {
    if (e === 'ReportSection') {
      setReport(false);
    } else {
      setReport(true);
    }
  };

  const BlockHandler = () => {
    const Local = localStorage.getItem("Register_User");
    if (Local) {
      const UserId = JSON.parse(Local);

      axios.post(`${basUrl}profile_block.php`, { uid: UserId.id, profile_id: api.profile_id })
        .then((res) => {
          if (res.data.Result === "true") {
            const Id = sessionStorage.getItem("Icon-Color");
            if (Id === "Explore") {
              navigate("/explore");
            } else {
              navigate("/");
            }
            showTost({ title: res.data.ResponseMsg });
            setIsVisible(false);
          } else {
            showTost({ title: res.data.ResponseMsg });
            setIsVisible(false);
          }
        });
    }
  };

  const toggleBottomSheet2 = (e) => {
    if (e === 'GiftSection') {
      setIsVisible2(false);
    } else {
      setIsVisible2(true);
    }
  };

  const GiftHandler = (id, price, img) => {
    const GiftCoin = parseInt(price);
    if (giftid.includes(id)) {
      setGiftId(giftid.filter((el) => el !== id));
      setGiftImg(giftImg.filter((el) => el !== img));
      setTotalPrice(totalPrice - GiftCoin);
      setGiftError(gifterror - 1);
    } else {
      if (totalPrice + GiftCoin > yourCoin) {
        showTost({ title: "insufficient coins in wallet" });
      } else {
        setGiftId([...giftid, id]);
        setTotalPrice(totalPrice + GiftCoin);
        setGiftError(gifterror + 1);
        setGiftImg([...giftImg, img]);
      }
    }
  };

  const SednHandler = () => {
    if (!gifterror) {
      showTost({ title: "Please Select Gift" });
    } else {
      GiftSendHandler();
    }
  };

  const DetailsHandler = () => {

    setLoding(true);
    const Local = localStorage.getItem("Register_User");
    if (Local) {
      const UserData = JSON.parse(Local);
      const Id = localStorage.getItem("DetailsId");

      axios
        .post(`${basUrl}profile_info.php`, {
          uid: UserData.id,
          profile_id: Id,
          lats: latitude,
          longs: longitude,
        })
        .then((res) => {
          setApi(res.data && res.data.profileinfo);
          setImageData(res.data && res.data.profileinfo ? res.data.profileinfo.profile_images : undefined);
          setIsVerify(res.data && res.data.profileinfo ? res.data.profileinfo.is_verify : undefined);
          setGiftreceiverId(res.data && res.data.profileinfo ? res.data.profileinfo.profile_id : undefined);
          setLoding(false);
        });
    }
  };

  const CoinHandler = () => {
    const localData = localStorage.getItem("Register_User");

    if (localData) {
      const userData = JSON.parse(localData);
      axios.post(`${basUrl}coin_report.php`, { uid: userData.id })
        .then((res) => {
          setYourCoin(res.data.coin);
        });
    }
  };

  const GetGiftListHandle = () => {
    axios.post(`${basUrl}gift_list.php`)
      .then((res) => {
        setGiftList(res.data.giftlist);
      });
  };


  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = String(position.coords.latitude);
        const long = String(position.coords.longitude);
        setLatitude(lat);
        setLongitude(long);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          // Handle permission denied error (if needed)
        }
      }
    );

    const Page = sessionStorage.getItem("Icon-Color");

    if (Page === "Explore") {
      const ExploreId = sessionStorage.getItem("Explore");
      if (ExploreId === "Like" || ExploreId === "Favorite") {
        setIconDis(["1", "2"]);
      } else if (ExploreId === "Passed") {
        setIconDis(["1"]);
      }
    }

    GetGiftListHandle();
    DetailsHandler();
    CoinHandler();
  }, [latitude, longitude]);



  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000
  };

  const NavigateHandler = () => {
    const Id = sessionStorage.getItem("Icon-Color");
    if (Id === "Explore") {
      navigate("/explore");
      localStorage.setItem("DetailsId", "");
    } else {
      navigate("/");
      localStorage.setItem("DetailsId", "");
    }
  };

  const ProfileLikeHandler = (id) => {
    const Local = localStorage.getItem("Register_User");
    if (id && Local) {

      const UserData = JSON.parse(Local);

      axios.post(`${basUrl}like_dislike.php`,
        {
          uid: UserData.id,
          profile_id: id,
          action: "LIKE"
        })
        .then((res) => {
          if (res.data.Result === "true") {
            showTost({ title: res.data.ResponseMsg });
            const Page = sessionStorage.getItem("Icon-Color");

            if (Page === "Home") {
              navigate("/");
            } else {
              navigate("/explore");
            }
          }
        });
    }
  };

  const ProfileUnLikeHandler = (id) => {
    const Local = localStorage.getItem("Register_User");
    if (id && Local) {
      const UserData = JSON.parse(Local);

      axios.post(`${basUrl}like_dislike.php`,
        {
          uid: UserData.id,
          profile_id: id,
          action: "UNLIKE"
        })
        .then((res) => {
          if (res.data.Result === "true") {
            NavigateHandler();
            showTost({ title: res.data.ResponseMsg });
          }
        });

    }
  };

  const GiftSendHandler = () => {
    const localData = localStorage.getItem("Register_User");

    if (localData) {
      const userData = JSON.parse(localData);

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
          if (res.data.Result === "true") {
            setGiftId("");
            setGiftError("");
            setTotalPrice("");
            CoinHandler();
            showTost({ title: res.data.ResponseMsg });
            setIsVisible2(false);
          }
        });
    }
  };

  // Chat Section Handler 
  const ChatHandler = (UserId, name) => {
    setChatId(UserId);
    setChatUserName(name);
  };

  return (
    <div className="outline-none bg-[#e5e5e5] main-wrapper">
      {/* <!-- Main Content Start --> */}
      {!loding ?
        <div
          onClick={() => options && setOption(!options)}
          className="content-body relative"
        >
          <div className="container mw-lg-100 pt-2 pb-4 px-sm-4 px-3">
            <div className="">
              <button onClick={NavigateHandler} className="bg-[white] w-[30px] max-_430_:-mt-[0px] mb-[10px] h-[30px] rounded-full p-[6px] flex justify-center items-center z-[555]">
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.7501 8.00002C19.7501 8.41402 19.4141 8.75002 19.0001 8.75002H2.81115L8.53112 14.47C8.82412 14.763 8.82412 15.238 8.53112 15.531C8.38512 15.677 8.19309 15.751 8.00109 15.751C7.80909 15.751 7.61706 15.678 7.47106 15.531L0.471062 8.53103C0.402063 8.46203 0.347197 8.37913 0.309197 8.28713C0.233197 8.10413 0.233197 7.89713 0.309197 7.71413C0.347197 7.62213 0.402063 7.53899 0.471062 7.46999L7.47106 0.469994C7.76406 0.176994 8.2391 0.176994 8.5321 0.469994C8.8251 0.762994 8.8251 1.23803 8.5321 1.53103L2.81213 7.251H19.0001C19.4141 7.25 19.7501 7.58602 19.7501 8.00002Z" fill="#25314C" />
                </svg>
              </button>
            </div>
            <div className="card card-rounded-2">
              <div className="card-body p-lg-4 p-sm-3">
                <div className="row p-lg-3 p-sm-2 items-center">
                  <div className="col-xxl-5">
                    <div className="user-images-slider">
                      <div className="swiper-container images-slider overflow-hidden relative">
                        <button className="absolute p-3 hidden max-_430_:block right-[5px] z-[555]" onClick={() => setOption(!options)}>
                          <svg width="6" height="20" viewBox="0 0 4 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path className="fill-white" d="M2.02002 3.5C1.19102 3.5 0.515015 2.829 0.515015 2C0.515015 1.171 1.18201 0.5 2.01001 0.5H2.02002C2.84902 0.5 3.52002 1.171 3.52002 2C3.52002 2.829 2.84902 3.5 2.02002 3.5ZM3.52002 10C3.52002 9.171 2.84902 8.5 2.02002 8.5H2.01001C1.18201 8.5 0.515015 9.171 0.515015 10C0.515015 10.829 1.19102 11.5 2.02002 11.5C2.84902 11.5 3.52002 10.829 3.52002 10ZM3.52002 18C3.52002 17.171 2.84902 16.5 2.02002 16.5H2.01001C1.18201 16.5 0.515015 17.171 0.515015 18C0.515015 18.829 1.19102 19.5 2.02002 19.5C2.84902 19.5 3.52002 18.829 3.52002 18Z" fill="#25314C" />
                          </svg>
                        </button>
                        {options && (
                          <div className="bg-white m-0 px-[5px] py-[5px] hidden max-_430_:block rounded-[5px] absolute top-[45px] right-[18px] z-[888]">
                            <button onClick={toggleBottomSheet} className="py-[5px] px-[10px] flex items-center gap-[10px] font-[600]">
                              <img src={HidePassword} style={{ height: "100%" }} alt="" /> {t('Block')}
                            </button>
                            <div className="border-[1px] border-gray-300"></div>
                            <button onClick={ReportToggle} className="py-[5px] px-[10px] flex items-center gap-[10px] font-[600]">
                              <img src={flag} alt="" style={{ height: "100%" }} />
                              {t('Report')}
                            </button>
                          </div>
                        )}
                        {imageData?.length > 1
                          ? <Slider {...settings}>
                            {
                              imageData.map((el, index) => {
                                return <div key={index}>
                                  <img className="rounded-[1rem] relative" src={`${imageBaseURL}${el}`} alt="" />
                                </div>
                              })
                            }
                          </Slider>
                          : imageData?.map((el) => {
                            return <div>
                              <img className="rounded-[1rem]" src={`${imageBaseURL}${el}`} alt="" />
                            </div>
                          })
                        }
                        <div className="absolute bottom-10 max-_1445_:bottom-16 max-_430_:hidden flex items-center justify-center w-[100%] gap-[10px]">
                          <div className=" flex items-center gap-[10px] px-[8px] py-[6px] rounded-[50px] bg-black">
                            {iconDis?.includes("1") ? "" : <button onClick={() => ProfileUnLikeHandler(api.profile_id)} className="action-btn avatar avatar-lg rounded-full z-1 bg-white" >
                              <RxCross2 className="w-[50px] text-black" />
                            </button>}
                            <button onClick={() => ChatHandler(api.profile_id, api.profile_name)} className="action-btn avatar avatar-lg rounded-full z-1 bg-white">
                              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M3.33398 20.0247C3.33398 11.2449 10.3507 3.33301 20.034 3.33301C29.5007 3.33301 36.6673 11.0947 36.6673 19.9746C36.6673 30.2734 28.2673 36.6663 20.0007 36.6663C17.2673 36.6663 14.234 35.9319 11.8007 34.4964C10.9507 33.979 10.234 33.5951 9.31732 33.8955L5.95065 34.897C5.10065 35.1641 4.33398 34.4964 4.58398 33.5951L5.70065 29.8561C5.88398 29.3387 5.85065 28.7879 5.58398 28.3539C4.15065 25.7166 3.33398 22.8289 3.33398 20.0247ZM17.834 20.0247C17.834 21.2098 18.784 22.1612 19.9673 22.1779C21.1507 22.1779 22.1007 21.2098 22.1007 20.0414C22.1007 18.8563 21.1507 17.9049 19.9673 17.9049C18.8007 17.8882 17.834 18.8563 17.834 20.0247ZM25.5173 20.0414C25.5173 21.2098 26.4673 22.1779 27.6507 22.1779C28.834 22.1779 29.784 21.2098 29.784 20.0414C29.784 18.8563 28.834 17.9049 27.6507 17.9049C26.4673 17.9049 25.5173 18.8563 25.5173 20.0414ZM12.284 22.1779C11.1173 22.1779 10.1507 21.2098 10.1507 20.0414C10.1507 18.8563 11.1007 17.9049 12.284 17.9049C13.4673 17.9049 14.4173 18.8563 14.4173 20.0414C14.4173 21.2098 13.4673 22.1612 12.284 22.1779Z" fill="#000000" />
                              </svg>
                            </button>
                            {iconDis?.includes("2") ? "" : <button onClick={() => ProfileLikeHandler(api.profile_id)} className="action-btn avatar avatar-lg rounded-full z-1 bg-red-500">
                              <svg width="40" height="41" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M26.4154 4.7698C27.4671 4.7698 28.5171 4.91813 29.5154 5.25313C35.6671 7.25313 37.8837 14.0031 36.0321 19.9031C34.9821 22.9181 33.2654 25.6698 31.0171 27.9181C27.7987 31.0348 24.2671 33.8015 20.4654 36.1848L20.0487 36.4365L19.6154 36.1681C15.8004 33.8015 12.2487 31.0348 9.00039 27.9015C6.76706 25.6531 5.04873 22.9181 3.98206 19.9031C2.09873 14.0031 4.31539 7.25313 10.5337 5.21813C11.0171 5.05146 11.5154 4.9348 12.0154 4.8698H12.2154C12.6837 4.80146 13.1487 4.7698 13.6154 4.7698H13.7987C14.8487 4.80146 15.8654 4.9848 16.8504 5.3198H16.9487C17.0154 5.35146 17.0654 5.38646 17.0987 5.41813C17.4671 5.53646 17.8154 5.6698 18.1487 5.85313L18.7821 6.13646C18.9351 6.21808 19.1069 6.3428 19.2553 6.45058C19.3494 6.51887 19.4341 6.58037 19.4987 6.6198C19.5259 6.63585 19.5536 6.65198 19.5814 6.66825C19.7243 6.75167 19.8732 6.83857 19.9987 6.9348C21.8504 5.5198 24.0987 4.75313 26.4154 4.7698ZM30.8487 16.7698C31.5321 16.7515 32.1154 16.2031 32.1654 15.5015V15.3031C32.2154 12.9681 30.8004 10.8531 28.6487 10.0365C27.9654 9.80146 27.2154 10.1698 26.9654 10.8698C26.7321 11.5698 27.0987 12.3365 27.7987 12.5848C28.8671 12.9848 29.5821 14.0365 29.5821 15.2015V15.2531C29.5504 15.6348 29.6654 16.0031 29.8987 16.2865C30.1321 16.5698 30.4821 16.7348 30.8487 16.7698Z" fill="#FFFFFF" />
                                <defs>
                                  <linearGradient id="paint0_linear_1606_27736" x1="36.6657" y1="36.4365" x2="-2.66883" y2="24.4315" gradientUnits="userSpaceOnUse">
                                    <stop stop-color="#FF0025" />
                                    <stop offset="1" stop-color="#FF6B81" />
                                  </linearGradient>
                                </defs>
                              </svg>
                            </button>}
                            <button className="action-btn avatar avatar-lg rounded-full z-1 bg-white" onClick={(e) => { e.stopPropagation(); toggleBottomSheet2(); }} >
                              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.16675 22.4997H18.75V34.4997C18.75 34.7764 18.5266 34.9997 18.2499 34.9997H11.6667C8.33333 34.9997 6.66667 33.333 6.66667 29.9997V22.9997C6.66667 22.723 6.89008 22.4997 7.16675 22.4997ZM32.8333 22.4997H21.25V34.4997C21.25 34.7764 21.4734 34.9997 21.7501 34.9997H28.3333C31.6667 34.9997 33.3333 33.333 33.3333 29.9997V22.9997C33.3333 22.723 33.1099 22.4997 32.8333 22.4997ZM35 14.1664V19.4997C35 19.7764 34.7766 19.9997 34.4999 19.9997H21.25V14.1664H18.75V19.9997H5.50008C5.22341 19.9997 5 19.7764 5 19.4997V14.1664C5 12.7864 6.12 11.6664 7.5 11.6664H9.2749C8.74324 10.6364 8.54502 9.40801 9.01835 8.07301C9.49002 6.74301 10.5666 5.64139 11.9132 5.21972C13.7766 4.63639 15.6933 5.24634 16.8667 6.67134C16.92 6.73634 18.795 9.23132 20.0016 10.8346C21.2066 9.23132 23.08 6.74133 23.125 6.68467C24.3067 5.248 26.2066 4.64298 28.065 5.20965C29.365 5.60798 30.4216 6.63803 30.9216 7.90303C31.475 9.30303 31.2817 10.5914 30.7284 11.6647H32.5033C33.8799 11.6664 35 12.7864 35 14.1664ZM17.4967 11.6664C16.3684 10.1664 15.005 8.35299 14.9133 8.23465C14.5317 7.76965 13.9633 7.49969 13.3333 7.49969C12.185 7.49969 11.25 8.43469 11.25 9.58302C11.25 10.7314 12.185 11.6664 13.3333 11.6664H17.4967ZM28.75 9.58302C28.75 8.43469 27.815 7.49969 26.6667 7.49969C26.0367 7.49969 25.4682 7.76964 25.0649 8.2613C24.9866 8.36464 23.6283 10.1697 22.5033 11.6664H26.6667C27.815 11.6664 28.75 10.7314 28.75 9.58302Z" fill="#000000" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="hidden max-_430_:block z-[777] relative">
                          <div className="fixed bottom-5 left-0 flex items-center justify-center w-[99%] gap-[10px]">
                            <div className="flex gap-[1rem] rounded-full px-[5px] items-center bg-black py-[5px]">
                              {iconDis?.includes("1") ? "" : <button onClick={() => ProfileUnLikeHandler(api.profile_id)} className="action-btn avatar avatar-lg rounded-full z-1 bg-white" >
                                <RxCross2 className="w-[50px] text-black" />
                              </button>}
                              <button onClick={() => ChatHandler(api.profile_id, api.profile_name)} className="action-btn avatar avatar-lg rounded-full z-1 bg-white">
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M3.33398 20.0247C3.33398 11.2449 10.3507 3.33301 20.034 3.33301C29.5007 3.33301 36.6673 11.0947 36.6673 19.9746C36.6673 30.2734 28.2673 36.6663 20.0007 36.6663C17.2673 36.6663 14.234 35.9319 11.8007 34.4964C10.9507 33.979 10.234 33.5951 9.31732 33.8955L5.95065 34.897C5.10065 35.1641 4.33398 34.4964 4.58398 33.5951L5.70065 29.8561C5.88398 29.3387 5.85065 28.7879 5.58398 28.3539C4.15065 25.7166 3.33398 22.8289 3.33398 20.0247ZM17.834 20.0247C17.834 21.2098 18.784 22.1612 19.9673 22.1779C21.1507 22.1779 22.1007 21.2098 22.1007 20.0414C22.1007 18.8563 21.1507 17.9049 19.9673 17.9049C18.8007 17.8882 17.834 18.8563 17.834 20.0247ZM25.5173 20.0414C25.5173 21.2098 26.4673 22.1779 27.6507 22.1779C28.834 22.1779 29.784 21.2098 29.784 20.0414C29.784 18.8563 28.834 17.9049 27.6507 17.9049C26.4673 17.9049 25.5173 18.8563 25.5173 20.0414ZM12.284 22.1779C11.1173 22.1779 10.1507 21.2098 10.1507 20.0414C10.1507 18.8563 11.1007 17.9049 12.284 17.9049C13.4673 17.9049 14.4173 18.8563 14.4173 20.0414C14.4173 21.2098 13.4673 22.1612 12.284 22.1779Z" fill="#000000" />
                                </svg>
                              </button>
                              {iconDis?.includes("2") ? "" : <button onClick={() => ProfileLikeHandler(api.profile_id)} className="action-btn avatar avatar-lg rounded-full z-1 bg-red-500">
                                <svg width="40" height="41" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fill-rule="evenodd" clip-rule="evenodd" d="M26.4154 4.7698C27.4671 4.7698 28.5171 4.91813 29.5154 5.25313C35.6671 7.25313 37.8837 14.0031 36.0321 19.9031C34.9821 22.9181 33.2654 25.6698 31.0171 27.9181C27.7987 31.0348 24.2671 33.8015 20.4654 36.1848L20.0487 36.4365L19.6154 36.1681C15.8004 33.8015 12.2487 31.0348 9.00039 27.9015C6.76706 25.6531 5.04873 22.9181 3.98206 19.9031C2.09873 14.0031 4.31539 7.25313 10.5337 5.21813C11.0171 5.05146 11.5154 4.9348 12.0154 4.8698H12.2154C12.6837 4.80146 13.1487 4.7698 13.6154 4.7698H13.7987C14.8487 4.80146 15.8654 4.9848 16.8504 5.3198H16.9487C17.0154 5.35146 17.0654 5.38646 17.0987 5.41813C17.4671 5.53646 17.8154 5.6698 18.1487 5.85313L18.7821 6.13646C18.9351 6.21808 19.1069 6.3428 19.2553 6.45058C19.3494 6.51887 19.4341 6.58037 19.4987 6.6198C19.5259 6.63585 19.5536 6.65198 19.5814 6.66825C19.7243 6.75167 19.8732 6.83857 19.9987 6.9348C21.8504 5.5198 24.0987 4.75313 26.4154 4.7698ZM30.8487 16.7698C31.5321 16.7515 32.1154 16.2031 32.1654 15.5015V15.3031C32.2154 12.9681 30.8004 10.8531 28.6487 10.0365C27.9654 9.80146 27.2154 10.1698 26.9654 10.8698C26.7321 11.5698 27.0987 12.3365 27.7987 12.5848C28.8671 12.9848 29.5821 14.0365 29.5821 15.2015V15.2531C29.5504 15.6348 29.6654 16.0031 29.8987 16.2865C30.1321 16.5698 30.4821 16.7348 30.8487 16.7698Z" fill="#FFFFFF" />
                                  <defs>
                                    <linearGradient id="paint0_linear_1606_27736" x1="36.6657" y1="36.4365" x2="-2.66883" y2="24.4315" gradientUnits="userSpaceOnUse">
                                      <stop stop-color="#FF0025" />
                                      <stop offset="1" stop-color="#FF6B81" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                              </button>}
                              <button className="action-btn avatar avatar-lg rounded-full z-1 bg-white" onClick={(e) => { e.stopPropagation(); toggleBottomSheet2(); }} >
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M7.16675 22.4997H18.75V34.4997C18.75 34.7764 18.5266 34.9997 18.2499 34.9997H11.6667C8.33333 34.9997 6.66667 33.333 6.66667 29.9997V22.9997C6.66667 22.723 6.89008 22.4997 7.16675 22.4997ZM32.8333 22.4997H21.25V34.4997C21.25 34.7764 21.4734 34.9997 21.7501 34.9997H28.3333C31.6667 34.9997 33.3333 33.333 33.3333 29.9997V22.9997C33.3333 22.723 33.1099 22.4997 32.8333 22.4997ZM35 14.1664V19.4997C35 19.7764 34.7766 19.9997 34.4999 19.9997H21.25V14.1664H18.75V19.9997H5.50008C5.22341 19.9997 5 19.7764 5 19.4997V14.1664C5 12.7864 6.12 11.6664 7.5 11.6664H9.2749C8.74324 10.6364 8.54502 9.40801 9.01835 8.07301C9.49002 6.74301 10.5666 5.64139 11.9132 5.21972C13.7766 4.63639 15.6933 5.24634 16.8667 6.67134C16.92 6.73634 18.795 9.23132 20.0016 10.8346C21.2066 9.23132 23.08 6.74133 23.125 6.68467C24.3067 5.248 26.2066 4.64298 28.065 5.20965C29.365 5.60798 30.4216 6.63803 30.9216 7.90303C31.475 9.30303 31.2817 10.5914 30.7284 11.6647H32.5033C33.8799 11.6664 35 12.7864 35 14.1664ZM17.4967 11.6664C16.3684 10.1664 15.005 8.35299 14.9133 8.23465C14.5317 7.76965 13.9633 7.49969 13.3333 7.49969C12.185 7.49969 11.25 8.43469 11.25 9.58302C11.25 10.7314 12.185 11.6664 13.3333 11.6664H17.4967ZM28.75 9.58302C28.75 8.43469 27.815 7.49969 26.6667 7.49969C26.0367 7.49969 25.4682 7.76964 25.0649 8.2613C24.9866 8.36464 23.6283 10.1697 22.5033 11.6664H26.6667C27.815 11.6664 28.75 10.7314 28.75 9.58302Z" fill="#000000" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xxl-7">
                    <div className="user-profile">
                      <div className="border-bottom d-sm-flex align-items-cneter px-sm-2 py-4 px-1">
                        <div className="d-flex items-center flex-fill gap-[10px]">
                          <h3 className="mb-0">{api?.profile_name} ({api?.profile_age})</h3>
                          {isverify === "1"
                            ? <div className="tooltip cursor-pointer">
                              <img src={Review} style={{ width: "30px", height: "30px" }} alt="" />
                              <span className="tooltiptext whitespace-nowrap -bottom-[35px] left-[8px]">{t('Under Review')}</span>
                            </div>
                            : isverify === "2"
                              ? <div className="tooltip cursor-pointer">
                                <img src={verify} style={{ width: "30px", height: "30px" }} alt="" />
                                <span className="tooltiptext whitespace-nowrap -bottom-[35px] left-[10px]">{t('Is Verify')}</span>
                              </div>
                              : <div className="tooltip cursor-pointer">
                                <img src={verify1} style={{ width: "30px", height: "30px" }} alt="" />
                                <span className="tooltiptext whitespace-nowrap -bottom-[35px] -left-[10px]">{t('Unverified')}</span>
                              </div>
                          }
                        </div>
                        <div className="flex items-center gap-[5px] max-_580_:mt-[15px] z-[111]">
                          <svg
                            className="svg-gradient"
                            width="15"
                            height="18"
                            viewBox="0 0 15 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path style={{ fill: "rgba(152,14,255,255)" }}
                              d="M12.201 1.72304C11.4404 1.10344 10.5568 0.65271 9.60864 0.400784C8.66052 0.148858 7.66965 0.101496 6.70182 0.261844C5.734 0.422192 4.81135 0.786581 3.99514 1.33082C3.17892 1.87506 2.48782 2.58669 1.9677 3.41849C1.44758 4.25028 1.11034 5.18319 0.978386 6.1553C0.84643 7.1274 0.922767 8.11646 1.20233 9.0568C1.4819 9.99714 1.95829 10.8673 2.59989 11.6094C3.24149 12.3515 4.03361 12.9487 4.92367 13.3612L6.51275 16.5394C6.63596 16.7857 6.82531 16.9928 7.0596 17.1376C7.29388 17.2824 7.56385 17.359 7.83925 17.359C8.11465 17.359 8.38462 17.2824 8.6189 17.1376C8.85318 16.9928 9.04253 16.7857 9.16574 16.5394L10.7674 13.3622C11.8299 12.8664 12.7489 12.1086 13.4381 11.1601C14.1274 10.2115 14.5642 9.10335 14.7075 7.93965C14.8509 6.77594 14.696 5.59489 14.2576 4.50746C13.8191 3.42002 13.1115 2.46188 12.201 1.72304ZM7.83925 10.0614C7.25267 10.0614 6.67927 9.88746 6.19155 9.56157C5.70383 9.23569 5.3237 8.7725 5.09923 8.23057C4.87475 7.68865 4.81602 7.09233 4.93046 6.51703C5.04489 5.94172 5.32735 5.41327 5.74213 4.9985C6.1569 4.58373 6.68535 4.30126 7.26065 4.18683C7.83596 4.07239 8.43228 4.13113 8.9742 4.3556C9.51613 4.58007 9.97932 4.9602 10.3052 5.44792C10.6311 5.93564 10.805 6.50904 10.805 7.09562C10.805 7.88219 10.4925 8.63653 9.93635 9.19272C9.38016 9.74891 8.62582 10.0614 7.83925 10.0614Z"
                              fill="url(#paint0_linear_72_680)"
                            ></path>
                          </svg>
                          <div className="flex items-center gap-[10px] relative">
                            <span className="fs-16 text-gray">{api?.profile_distance} from you</span>
                            <button onClick={() => setOption(!options)}>
                              <img
                                src={Dott}
                                className="w-[20px] h-[20px] max-_430_:hidden"
                                alt=""
                              />
                            </button>
                            {options && (
                              <div className="bg-gray-200 m-0 px-[5px] max-_430_:hidden rounded-[5px] absolute top-[35px] right-[10px]">
                                <button onClick={toggleBottomSheet} className="py-[5px] px-[10px] flex items-center gap-[10px] font-[600]">
                                  <img src={HidePassword} alt="" /> {t("Block")}
                                </button>
                                <div className="border-[1px] border-gray-300 "></div>
                                <button onClick={ReportToggle} className="py-[5px] px-[10px] flex items-center gap-[10px] font-[600]">
                                  <img src={flag} alt="" />
                                  {t("Report")}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {api?.profile_bio === "undefined" || api?.profile_bio === "" ? "" : <div className="px-sm-2 py-4 px-1 border-bottom">
                        <h6 className="fw-semi-bold mb-2">{t("Bio")} : <span className="fs-15 font-[400]">{api?.profile_bio}</span></h6>
                      </div>}
                      <div className="border-bottom px-sm-2 py-4 px-1 user-interests">
                        <h6 className="fw-semi-bold mb-2">{t('Interests')}:</h6>
                        <div className="d-flex flex-wrap list-group-items round-style">
                          {api?.interest_list?.map((item, index) => {
                            return <div key={index} className="list-item d-flex align-items-center justify-content-center py-2 px-3 fw-medium">
                              <span>{item?.title}</span>
                              <img
                                src={imageBaseURL + item?.img}
                                alt="english"
                                className="rounded-circle lang-tag-icon"
                              />
                            </div>
                          })}
                        </div>
                      </div>
                      <div className="border-bottom px-sm-2 py-4 px-1">
                        <h6 className="fw-semi-bold mb-2">{t("Languages")}:</h6>
                        <div className="d-flex flex-wrap list-group-items round-style">
                          {
                            api?.language_list?.map((item, index) => {
                              return <div key={index} className="list-item d-flex align-items-center justify-content-center py-2 px-3 fw-medium">
                                <img
                                  src={imageBaseURL + item?.img}
                                  alt="english"
                                  className="rounded-circle lang-tag-icon"
                                />
                                <span>{item?.title}</span>
                              </div>
                            })
                          }

                        </div>
                      </div>
                      <div className="border-bottom px-sm-2 py-4 px-1">
                        <h6 className="fw-semi-bold mb-2">{t("Relationship Goals")}:</h6>
                        <div className="d-flex flex-wrap list-group-items round-style">
                          <div className="list-item d-flex align-items-center justify-content-center py-2 px-3 fw-medium">
                            {api?.relation_title}
                          </div>
                        </div>
                      </div>
                      <div className=" px-sm-2 py-4 px-1">
                        <h6 className="fw-semi-bold mb-2">{t('Religion')}:</h6>
                        <div className="d-flex flex-wrap list-group-items round-style">
                          <div className="list-item d-flex align-items-center justify-content-center py-2 px-3 fw-medium">
                            {api?.religion_title}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> :
        <div className="w-[100%] h-[100vh] ms-[8rem] max-_991_:ms-0 bg-white fixed flex items-center justify-center top-0 left-0 right-0 bottom-0 z-[555]">
          <div className="">
            <h2 className="">{t('Loading...')}</h2>
          </div>
        </div>}
      {/* <!-- Main Content End --> */}

      {/* <----------- Block Section ---------------> */}
      {isVisible && <div onClick={toggleBottomSheet} id="BlockSection" className=" px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
        <div onClick={(e) => e.stopPropagation()} className="w-[20%] max-_430_:w-[100%] max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] bg-white rounded-[15px] p-[15px]">
          <div className="flex flex-col justify-center items-center text-center">
            <img src={BlockIcon} alt="" className="w-[30%]" />
            <h4 className="m-0">{t('Blocking')} {api?.profile_name}</h4>
            <p className="mt-[20px] leading-[18px] text-[15px] pb-[15px]">
              {t('Please tell us why you are blocking')} <br /> {t("Acchcuu. Don't worry we won't tell them..")}
            </p>
            <div className="flex items-center border-t-[2px] pt-[10px] gap-[15px]">
              <div className="">
                <div className="flex items-center gap-[15px]">
                  <img src={plus} alt="" />
                  <p className="text-start leading-[18px] font-[500]">
                    {t("They will not be able to find your profile and send you messages.")}
                  </p>
                </div>
                <div className="flex items-center gap-[10px] mt-[15px]">
                  <img src={Bell} alt="" />
                  <p className="text-start leading-[18px] font-[500]">
                    {t('They will not be notified if you block them.')}
                  </p>
                </div>
                <div className="flex items-center gap-[10px] mt-[15px]">
                  <img src={Setting} alt="" />
                  <p className="text-start leading-[18px] font-[500]">
                    {t('You can unblock them anytime in Settings.')}
                  </p>
                </div>
                <div className="flex justify-center gap-[20px] mt-[25px]">
                  <button onClick={toggleBottomSheet} id="BlockSection" className="text-[16px] text-[rgba(152,14,255,255)] h-[40px] max-h-[40px] border-[2px] border-[rgba(152,14,255,255)] rounded-full px-[25px]">
                    {t('Cancel')}
                  </button>
                  <button onClick={BlockHandler} className="text-[16px
                     ] text-white border-[2px] bg-[rgba(152,14,255,255)] rounded-full px-[25px] py-[8px]">
                    {t('Yes, Block')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>}

      {/* <----------- Report Section ---------------> */}
      {report && <div onClick={() => ReportToggle('ReportSection')} className="px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
        <div onClick={(e) => e.stopPropagation()} className="w-[20%] max-_430_:w-[100%] max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] bg-white rounded-[15px] p-[15px]">
          <div className="flex flex-col justify-center items-center text-center">
            <div className="">
              <h3 className="m-0 font-[500]">{t('Reporting')} {api?.profile_name}</h3>
              <p className="leading-[18px] mt-[10px] font-[400] text-[16px]">{t("Pelease tell us why you are reporting")} <br /> {api?.profile_name}. {t("Don't worry we won't tell them")}</p>
              <h6 className=" text-start mt-[10px] font-[500] text-[18px]">{t("Why did you rport this user?")}</h6>
              <div className="ps-[10px]">
                {
                  ReportComment.map((item, index) => {
                    return <button key={index} onClick={() => { setDot(index); setComment(item); }} className="flex items-center gap-[35px] my-[15px]">
                      <div className="dot">
                        <span style={{ background: dot === index && "#980EFF" }} className="w-[100%] h-[100%] block rounded-full duration-[0.9s]"></span>
                      </div>
                      <h6 className="m-0 font-[400]">{item}</h6>
                    </button>
                  })
                }
                <button onClick={() => SendReportHamdler(api.profile_id)} className="w-[100%] bg-[#980EFF] text-white rounded-full text-[18px] py-[8px] mt  -[20px]">{t("Continue")}</button>
              </div>
            </div>
          </div>
        </div>
      </div>}

      {/* <----------- Gift Section ---------------> */}
      {isVisible2 && (
        <div onClick={() => toggleBottomSheet2("GiftSection")} className="bottom-sheet z-[999]">
          <div onClick={(e) => e.stopPropagation()} className="bottom-sheet-content">
            <div className="flex items-center justify-between">
              <h1 className="text-[18px] m-0 font-[600]">{t('Send Gifts')}</h1>
              <div className="flex items-center gap-[10px]">
                <img src={CoinIcon} alt="" className="w-[25px]" />
                <span className="text-[18px]">{yourCoin}</span>
                <img
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBottomSheet2("GiftSection");
                  }}
                  src={CloseIcon}
                  alt=""
                  className="w-[15px] ms-[15px] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-[20px] mx-auto mt-3 max-_430_:gap-[10px]">
              {giftList.map((el, i) => (
                <button
                  key={el.Id}
                  onClick={() => GiftHandler(el.id, el.price, el.img)}
                  style={{
                    borderColor: giftid.includes(el.id) ? "rgba(152,14,255,255)" : "#D1D5DB",
                  }}
                  className="w-[20%] max-_430_:w-[calc(25%-10px)] border-[2px] flex justify-center py-[5px] rounded-[10px]"
                >
                  <div className="relative">
                    <img
                      src={imageBaseURL + el.img}
                      alt=""
                      className="w-[45px] h-[45px] mx-auto max-_380_:w-[40px] max-_380_:h-[40px] max-_330_:w-[30px] max-_330_:h-[30px]"
                    />
                    <div className="flex items-center justify-center gap-[5px] mt-2">
                      <img
                        src={CoinIcon}
                        alt=""
                        className={`w-[15px] ${el.price === "0" && "hidden text-center"}`}
                      />
                      <span className="text-[14px] font-[500]"> {el.price === "0" ? "Free" : el.price}</span>
                    </div>
                    <IoIosCheckmarkCircle
                      style={{
                        display: giftid.includes(el.id) ? "block" : "none",
                      }}
                      className="absolute -top-[15px] -right-[30px] max-_380_:-right-[20px] max-_330_:-right-[10px] w-[25px] h-[25px] text-[rgba(152,14,255,255)] bg-white rounded-full"
                    />
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={SednHandler}
              className="font-bold text-[18px] rounded-[10px] mt-[20px] text-white py-[10px] w-[100%] bg-[rgba(152,14,255,255)]"
            >
              Send
            </button>
          </div>
        </div>

      )}

      {/* <<------------ Chat Show ---------->> */}
      {chatId && <div onClick={() => setChatId("")} className="bottom-sheet z-[999]">
        <div onClick={(e) => e.stopPropagation()} style={{ width: "400px" }} className="bottom-sheet-content">
          <UserChat />
        </div>
      </div>
      }
    </div>

  );
};

export default Detail;
/* jshint ignore:end */
