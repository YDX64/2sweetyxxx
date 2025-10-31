/* jshint esversion: 6 */
/* jshint esversion: 8 */
/* jshint ignore:start */
import React, { useContext, useEffect, useState } from "react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";
import { MyContext } from "../Context/MyProvider";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { showTost } from "../showTost";
const Favorites = () => {

  const { t } = useTranslation();

  const { basUrl, imageBaseURL } = useContext(MyContext);
  const naviget = useNavigate();

  const [showPage, setShowPage] = useState();
  const [favourite, setFavourite] = useState([]);
  const [newMatch, setNewMatch] = useState([]);
  const [likeMe, setLikeMe] = useState([]);
  const [passed, setPassed] = useState([]);
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(0);
  const [currentIndex3, setCurrentIndex3] = useState(0);
  const [currentIndex4, setCurrentIndex4] = useState(0);

  const [totalCards, setTotalCards] = useState(0);
  const [totalCards2, setTotalCards2] = useState(0);
  const [totalCards3, setTotalCards3] = useState(0);
  const [totalCards4, setTotalCards4] = useState(0);

  const ShowPageHandler = (el) => {
    sessionStorage.setItem("Explore", el);
    setShowPage(el);
  };

  useEffect(() => {
    if (sessionStorage.getItem("Explore")) {
      setShowPage(sessionStorage.getItem("Explore"));
    } else {
      setShowPage("Match");
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = String(position.coords.latitude);
        const long = String(position.coords.longitude);

        setLatitude(lat);
        setLongitude(long);

        NewMatchHandler(lat, long);
        LikeMeHandler(lat, long);
        FavouritrHandler(lat, long);
        PassedHandler(lat, long);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          console.error("Permission denied for geolocation.");
        }
      }
    );

  }, []);

  const fetchData = async (url, params, setCards, setTotalCards, currentIndex) => {
    try {
      const localData = localStorage.getItem("Register_User");
      const userData = JSON.parse(localData);

      const response = await axios.post(url, {
        uid: userData.id,
        lats: params.lat,
        longs: params.long
      });

      if (response.data.Result === "true") {
        const dataList = response.data[params.listName];

        if (currentIndex === 0) {
          setCards(dataList.slice(0, 12));
        } else {
          setCards(prevCards => [
            ...prevCards,
            ...dataList.slice(currentIndex, currentIndex + 12)
          ]);
        }
        setTotalCards(dataList.length);
      }
    } catch (error) {
      console.error(`Error fetching ${params.listName}:`, error);
    }
  };

  const NewMatchHandler = (lat, long) => {
    fetchData(`${basUrl}new_match.php`, { lat, long, listName: "profilelist" }, setNewMatch, setTotalCards, currentIndex, setCurrentIndex);
  };

  const FavouritrHandler = (lat, long) => {
    fetchData(`${basUrl}favourite.php`, { lat, long, listName: "favlist" }, setFavourite, setTotalCards2, currentIndex2, setCurrentIndex2);
  };

  const LikeMeHandler = (lat, long) => {
    fetchData(`${basUrl}like_me.php`, { lat, long, listName: "likemelist" }, setLikeMe, setTotalCards3, currentIndex3, setCurrentIndex3);
  };

  const PassedHandler = (lat, long) => {
    fetchData(`${basUrl}passed.php`, { lat, long, listName: "passedlist" }, setPassed, setTotalCards4, currentIndex4, setCurrentIndex4);
  };

  useEffect(() => {
    if (showPage === "Match") NewMatchHandler(latitude, longitude);
  }, [currentIndex]);

  useEffect(() => {
    if (showPage === "Favorite") FavouritrHandler(latitude, longitude);
  }, [currentIndex2]);

  useEffect(() => {
    if (showPage === "Like") LikeMeHandler(latitude, longitude);
  }, [currentIndex3]);

  useEffect(() => {
    if (showPage === "Passed") PassedHandler(latitude, longitude);
  }, [currentIndex4]);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.scrollHeight) {

      if (showPage === "Match" && newMatch.length < totalCards) {
        setCurrentIndex(prevIndex => prevIndex + 12);
      } else if (showPage === "Favorite" && favourite.length < totalCards2) {
        setCurrentIndex2(prevIndex => prevIndex + 12);
      } else if (showPage === "Like" && likeMe.length < totalCards3) {
        setCurrentIndex3(prevIndex => prevIndex + 12);
      } else if (showPage === "Passed" && passed.length < totalCards4) {
        setCurrentIndex4(prevIndex => prevIndex + 12);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);


  const DetailsHandler = (profile_id, name) => {
    const Title = name.replace(/\s+/g, '_');
    const FinalText = Title.toLowerCase();
    naviget(`/detail/${FinalText}`);
    localStorage.setItem("DetailsId", profile_id);
  };

  const UserLikeHandler = (Id) => {
    const localData = localStorage.getItem("Register_User");
    const userData = JSON.parse(localData);

    axios.post(`${basUrl}like_dislike.php`, { uid: userData.id, profile_id: Id, action: "LIKE" })
      .then((res) => {
        showTost({ title: res.data.ResponseMsg });
        LikeMeHandler(latitude, longitude);
        FavouritrHandler(latitude, longitude);
      });
  };

  const UserUnLikeHandler = (Id) => {
    const localData = localStorage.getItem("Register_User");
    const userData = JSON.parse(localData);

    axios.post(`${basUrl}like_dislike.php`, { uid: userData.id, profile_id: Id, action: "UNLIKE" })
      .then((res) => {
        showTost({ title: res.data.ResponseMsg });
        LikeMeHandler(latitude, longitude);
        PassedHandler(latitude, longitude);
      });
  };

  return (
    <div className="bg-[#e5e5e5] main-wrapper-history">
      <div className="content-body">
        <div className="container-fluid py-4 px-sm-4 px-3">
          <div className="row">
            <div className="col-xl-12 max-_1030_:sticky top-[70px] max-_1030_:z-[555] bg-[#e5e5e5] ">
              <div className="card card-rounded my-[20px] max-_430_:my-3">
                <div className="py-[20px] px-[20px] max-_430_:py-[10px] max-_430_:px-[0px] scroll-container2 mx-[10px]">
                  <div className="flex items-center gap-[20px] w-[100%]">
                    <button
                      onClick={() => ShowPageHandler("Match")}
                      style={{
                        color: showPage === "Match" ? "white" : "rgba(152,14,255,255)",
                        background: showPage === "Match"
                          ? "rgba(152,14,255,255)"
                          : "#970eff31",
                      }}
                      className="inline-block p-[15px] max-_430_:p-[10px] rounded-[30px]"
                    >
                      <div className="flex justify-around whitespace-nowrap items-center gap-[6px] ">
                        <svg width="25" height="25" viewBox="0 0 40 41" fill="" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M26.4154 4.7698C27.4671 4.7698 28.5171 4.91813 29.5154 5.25313C35.6671 7.25313 37.8837 14.0031 36.0321 19.9031C34.9821 22.9181 33.2654 25.6698 31.0171 27.9181C27.7987 31.0348 24.2671 33.8015 20.4654 36.1848L20.0487 36.4365L19.6154 36.1681C15.8004 33.8015 12.2487 31.0348 9.00039 27.9015C6.76706 25.6531 5.04873 22.9181 3.98206 19.9031C2.09873 14.0031 4.31539 7.25313 10.5337 5.21813C11.0171 5.05146 11.5154 4.9348 12.0154 4.8698H12.2154C12.6837 4.80146 13.1487 4.7698 13.6154 4.7698H13.7987C14.8487 4.80146 15.8654 4.9848 16.8504 5.3198H16.9487C17.0154 5.35146 17.0654 5.38646 17.0987 5.41813C17.4671 5.53646 17.8154 5.6698 18.1487 5.85313L18.7821 6.13646C18.9351 6.21808 19.1069 6.3428 19.2553 6.45058C19.3494 6.51887 19.4341 6.58037 19.4987 6.6198C19.5259 6.63585 19.5536 6.65198 19.5814 6.66825C19.7243 6.75167 19.8732 6.83857 19.9987 6.9348C21.8504 5.5198 24.0987 4.75313 26.4154 4.7698ZM30.8487 16.7698C31.5321 16.7515 32.1154 16.2031 32.1654 15.5015V15.3031C32.2154 12.9681 30.8004 10.8531 28.6487 10.0365C27.9654 9.80146 27.2154 10.1698 26.9654 10.8698C26.7321 11.5698 27.0987 12.3365 27.7987 12.5848C28.8671 12.9848 29.5821 14.0365 29.5821 15.2015V15.2531C29.5504 15.6348 29.6654 16.0031 29.8987 16.2865C30.1321 16.5698 30.4821 16.7348 30.8487 16.7698Z"
                            fill={showPage === "Match" ? "white" : "#970eff31"} stroke="rgba(152,14,255,255)" stroke-width="2" />
                        </svg>
                        <h6 className="m-0 inline-block text-[18px] font-[400] max-_430_:text-[16px]">
                          {t('New Match')}
                        </h6>
                      </div>
                    </button>

                    <button
                      onClick={() => ShowPageHandler("Like")}
                      style={{
                        color: showPage === "Like" ? "white" : "rgba(152,14,255,255)",
                        background: showPage === "Like"
                          ? "rgba(152,14,255,255)"
                          : "#970eff31",
                      }}
                      className="inline-block p-[15px] max-_430_:p-[10px] rounded-[30px]"
                    >
                      <div className="flex justify-around whitespace-nowrap items-center gap-[6px]">
                        <svg width="25" height="25" viewBox="0 0 40 41" fill="" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M26.4154 4.7698C27.4671 4.7698 28.5171 4.91813 29.5154 5.25313C35.6671 7.25313 37.8837 14.0031 36.0321 19.9031C34.9821 22.9181 33.2654 25.6698 31.0171 27.9181C27.7987 31.0348 24.2671 33.8015 20.4654 36.1848L20.0487 36.4365L19.6154 36.1681C15.8004 33.8015 12.2487 31.0348 9.00039 27.9015C6.76706 25.6531 5.04873 22.9181 3.98206 19.9031C2.09873 14.0031 4.31539 7.25313 10.5337 5.21813C11.0171 5.05146 11.5154 4.9348 12.0154 4.8698H12.2154C12.6837 4.80146 13.1487 4.7698 13.6154 4.7698H13.7987C14.8487 4.80146 15.8654 4.9848 16.8504 5.3198H16.9487C17.0154 5.35146 17.0654 5.38646 17.0987 5.41813C17.4671 5.53646 17.8154 5.6698 18.1487 5.85313L18.7821 6.13646C18.9351 6.21808 19.1069 6.3428 19.2553 6.45058C19.3494 6.51887 19.4341 6.58037 19.4987 6.6198C19.5259 6.63585 19.5536 6.65198 19.5814 6.66825C19.7243 6.75167 19.8732 6.83857 19.9987 6.9348C21.8504 5.5198 24.0987 4.75313 26.4154 4.7698ZM30.8487 16.7698C31.5321 16.7515 32.1154 16.2031 32.1654 15.5015V15.3031C32.2154 12.9681 30.8004 10.8531 28.6487 10.0365C27.9654 9.80146 27.2154 10.1698 26.9654 10.8698C26.7321 11.5698 27.0987 12.3365 27.7987 12.5848C28.8671 12.9848 29.5821 14.0365 29.5821 15.2015V15.2531C29.5504 15.6348 29.6654 16.0031 29.8987 16.2865C30.1321 16.5698 30.4821 16.7348 30.8487 16.7698Z"
                            fill={showPage === "Like" ? "white" : "#970eff31"} stroke="rgba(152,14,255,255)" stroke-width="2" />
                        </svg>
                        <h6 className="m-0 inline-block text-[18px] font-[400] max-_430_:text-[16px]">
                          {t('Like Me')}
                        </h6>
                      </div>
                    </button>

                    <button
                      onClick={() => ShowPageHandler("Favorite")}
                      style={{
                        color: showPage === "Favorite" ? "white" : "rgba(152,14,255,255)",
                        background: showPage === "Favorite"
                          ? "rgba(152,14,255,255)"
                          : "#970eff31",
                      }}
                      className="inline-block p-[15px] max-_430_:p-[10px] rounded-[30px]"
                    >
                      <div className="flex justify-around whitespace-nowrap items-center gap-[7px]">
                        <svg width="25" height="25" viewBox="0 0 40 41" fill="" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M26.4154 4.7698C27.4671 4.7698 28.5171 4.91813 29.5154 5.25313C35.6671 7.25313 37.8837 14.0031 36.0321 19.9031C34.9821 22.9181 33.2654 25.6698 31.0171 27.9181C27.7987 31.0348 24.2671 33.8015 20.4654 36.1848L20.0487 36.4365L19.6154 36.1681C15.8004 33.8015 12.2487 31.0348 9.00039 27.9015C6.76706 25.6531 5.04873 22.9181 3.98206 19.9031C2.09873 14.0031 4.31539 7.25313 10.5337 5.21813C11.0171 5.05146 11.5154 4.9348 12.0154 4.8698H12.2154C12.6837 4.80146 13.1487 4.7698 13.6154 4.7698H13.7987C14.8487 4.80146 15.8654 4.9848 16.8504 5.3198H16.9487C17.0154 5.35146 17.0654 5.38646 17.0987 5.41813C17.4671 5.53646 17.8154 5.6698 18.1487 5.85313L18.7821 6.13646C18.9351 6.21808 19.1069 6.3428 19.2553 6.45058C19.3494 6.51887 19.4341 6.58037 19.4987 6.6198C19.5259 6.63585 19.5536 6.65198 19.5814 6.66825C19.7243 6.75167 19.8732 6.83857 19.9987 6.9348C21.8504 5.5198 24.0987 4.75313 26.4154 4.7698ZM30.8487 16.7698C31.5321 16.7515 32.1154 16.2031 32.1654 15.5015V15.3031C32.2154 12.9681 30.8004 10.8531 28.6487 10.0365C27.9654 9.80146 27.2154 10.1698 26.9654 10.8698C26.7321 11.5698 27.0987 12.3365 27.7987 12.5848C28.8671 12.9848 29.5821 14.0365 29.5821 15.2015V15.2531C29.5504 15.6348 29.6654 16.0031 29.8987 16.2865C30.1321 16.5698 30.4821 16.7348 30.8487 16.7698Z"
                            fill={showPage === "Favorite" ? "white" : "#970eff31"} stroke="rgba(152,14,255,255)" stroke-width="2" />
                        </svg>
                        <h6 className="m-0 inline-block text-[18px] font-[400] max-_430_:text-[16px]">
                          {t('Favourite')}
                        </h6>
                      </div>
                    </button>

                    <button
                      onClick={() => ShowPageHandler("Passed")}
                      style={{
                        color: showPage === "Passed" ? "white" : "rgba(152,14,255,255)",
                        background: showPage === "Passed"
                          ? "rgba(152,14,255,255)"
                          : "#970eff31",
                      }}
                      className="inline-block p-[15px] max-_430_:p-[10px] rounded-[30px]"
                    >
                      <div className="flex justify-around whitespace-nowrap items-center gap-[7px]">
                        <svg width="25" height="25" viewBox="0 0 40 41" fill="" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M26.4154 4.7698C27.4671 4.7698 28.5171 4.91813 29.5154 5.25313C35.6671 7.25313 37.8837 14.0031 36.0321 19.9031C34.9821 22.9181 33.2654 25.6698 31.0171 27.9181C27.7987 31.0348 24.2671 33.8015 20.4654 36.1848L20.0487 36.4365L19.6154 36.1681C15.8004 33.8015 12.2487 31.0348 9.00039 27.9015C6.76706 25.6531 5.04873 22.9181 3.98206 19.9031C2.09873 14.0031 4.31539 7.25313 10.5337 5.21813C11.0171 5.05146 11.5154 4.9348 12.0154 4.8698H12.2154C12.6837 4.80146 13.1487 4.7698 13.6154 4.7698H13.7987C14.8487 4.80146 15.8654 4.9848 16.8504 5.3198H16.9487C17.0154 5.35146 17.0654 5.38646 17.0987 5.41813C17.4671 5.53646 17.8154 5.6698 18.1487 5.85313L18.7821 6.13646C18.9351 6.21808 19.1069 6.3428 19.2553 6.45058C19.3494 6.51887 19.4341 6.58037 19.4987 6.6198C19.5259 6.63585 19.5536 6.65198 19.5814 6.66825C19.7243 6.75167 19.8732 6.83857 19.9987 6.9348C21.8504 5.5198 24.0987 4.75313 26.4154 4.7698ZM30.8487 16.7698C31.5321 16.7515 32.1154 16.2031 32.1654 15.5015V15.3031C32.2154 12.9681 30.8004 10.8531 28.6487 10.0365C27.9654 9.80146 27.2154 10.1698 26.9654 10.8698C26.7321 11.5698 27.0987 12.3365 27.7987 12.5848C28.8671 12.9848 29.5821 14.0365 29.5821 15.2015V15.2531C29.5504 15.6348 29.6654 16.0031 29.8987 16.2865C30.1321 16.5698 30.4821 16.7348 30.8487 16.7698Z"
                            fill={showPage === "Passed" ? "white" : "#970eff31"} stroke="rgba(152,14,255,255)" stroke-width="2" />
                        </svg>
                        <h6 className="m-0 inline-block text-[18px] font-[400] max-_430_:text-[16px]">
                          {t('Passed')}
                        </h6>
                      </div>
                    </button>

                  </div>
                </div>
              </div>
            </div>

           
          </div>
        </div>
      </div>

    </div>
  );
};

export default Favorites;
/* jshint ignore:end */