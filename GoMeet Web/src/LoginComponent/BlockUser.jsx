/* jshint esversion: 6 */
/* jshint esversion: 8 */
/* jshint esversion: 9 */
/* jshint ignore:start */

import React, { useContext, useEffect, useState, useCallback } from 'react';
import { MyContext } from '../Context/MyProvider';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { showTost } from "../showTost";

const BlockUser = () => {
  const { t } = useTranslation();

  const { basUrl, imageBaseURL } = useContext(MyContext);

  const [index, setIndex] = useState([]);
  const [homeData, setHomeData] = useState([]);
  const [blockid, setBlockId] = useState();
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();

  const BlockListUserHandler = useCallback(() => {
    const localData = localStorage.getItem("Register_User");

    if (localData) {
      const userData = JSON.parse(localData);
      axios.post(`${basUrl}blocklist.php`, {
        uid: userData.id,
        lats: latitude,
        longs: longitude,
      })
        .then((res) => {
          if (res.data.Result === "true") {
            setHomeData(res.data.blocklist);
            setBlockId(res.data.blocklist.length);
          } else {
            setBlockId(0);
          }
        });
    }
  }, [basUrl, latitude, longitude]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = String(position.coords.latitude);
        const long = String(position.coords.longitude);
        setLatitude(lat);
        setLongitude(long);
        BlockListUserHandler();
      });
  }, [latitude, longitude, BlockListUserHandler]);

  const UnBlockHandler = (ProfileId, i) => {
    setIndex([...index, ProfileId]);

    setTimeout(() => {
      BlockListUserHandler();
      setBlockId(homeData.length);
    }, 1000);

    const localData = localStorage.getItem("Register_User");

    if (localData) {
      const userId = JSON.parse(localData);
      axios.post(`${basUrl}unblock.php`,
        {
          uid: userId.id,
          profile_id: ProfileId
        })
        .then((res) => {
          if (res.data.Result === "true") {
            showTost({ title: res.data.ResponseMsg });
          }
        });
    }
  };

  return (
    <div className='bg-[#e5e5e5] main-wrapper-history'>
      <div className="content-body">
        <div className="container-fluid py-[20px] px-sm-4 px-3 max-_380_:py-0 max-_380_:pt-[20px]">
          <div className="row">
            <div className="col-xl-12">
              <div className="card card-rounded mb-4">
                <div className="card-body">
                  <div className="person-header px-[16px] max-_380_:px-0">
                    <div className="fw-medium fs-16 ">
                      {t('Blocked Users') + ` (${blockid ? blockid : 0})`}
                    </div>
                    <p className='text-gray-500'>{t('The people you blocked are displayed here..')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={`col-xl-12 max-_430_:bg-[#e5e5e5] max-_430_:py-4`}>
              {blockid > 0 &&
                homeData ? (<div className="grid grid-cols-4 grid-transition  grid-responsive card p-[16px] card-rounded">
                  {homeData?.map((el, i) => {
                    return <div
                      key={el.Id}
                      className={`${index.includes(el?.profile_id) ? "opacity-[0]" : "opacity-[1]"} custom-card card-rounded-1 relative z-[444] duration-[0.5s]`}
                    >
                      <div>
                        <div className="position-relative">
                          <div className="card-title">
                            <div className="card-img relative HEIGHT">
                              <div className=" flex justify-center w-[100%] absolute">
                                <h6 className="m-0 text-white font-[400] text-[14px] bg-[rgba(152,14,255,255)] p-2 rounded-b-[15px]">{el.match_ratio.toFixed(0)}% Match</h6>
                              </div>
                              <img src={imageBaseURL + el.profile_images[0]} alt="img" className="img-fluid rounded-[3rem] BEFORE border-[5px] border-[rgba(152,14,255,255)]" />
                            </div>
                            <div className="card-content absolute bottom-[1.5rem] px-[15px] w-full">
                              <div className="profile-info">
                                <div className="text-start flex justify-between items-end">
                                  <h6 className="font-semibold mb-1 text-white">
                                    {el.profile_name}, {el.profile_age}
                                  </h6>
                                  <button onClick={() => UnBlockHandler(el?.profile_id, i)} className="action-btn avatar avatar-lg avatar-rounded bg-white">
                                    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path style={{ fill: "rgba(152,14,255,255)" }} d="M8.00903 8.75C10.353 8.75 12.259 6.843 12.259 4.5C12.259 2.157 10.353 0.25 8.00903 0.25C5.66503 0.25 3.75903 2.157 3.75903 4.5C3.75903 6.843 5.66503 8.75 8.00903 8.75ZM8.00903 1.75C9.52603 1.75 10.759 2.983 10.759 4.5C10.759 6.017 9.52603 7.25 8.00903 7.25C6.49203 7.25 5.25903 6.017 5.25903 4.5C5.25903 2.983 6.49203 1.75 8.00903 1.75ZM10.881 11.8101C10.629 11.7691 10.341 11.75 10 11.75H6C2.057 11.75 1.75 15.019 1.75 16.02C1.75 17.583 2.423 18.25 4 18.25H9C9.414 18.25 9.75 18.586 9.75 19C9.75 19.414 9.414 19.75 9 19.75H4C1.582 19.75 0.25 18.425 0.25 16.02C0.25 13.358 1.756 10.25 6 10.25H10C10.421 10.25 10.787 10.276 11.119 10.33C11.528 10.395 11.807 10.78 11.74 11.189C11.675 11.598 11.277 11.8751 10.881 11.8101ZM16 11.25C13.381 11.25 11.25 13.381 11.25 16C11.25 18.619 13.381 20.75 16 20.75C18.619 20.75 20.75 18.619 20.75 16C20.75 13.381 18.619 11.25 16 11.25ZM16 12.75C16.624 12.75 17.202 12.9359 17.698 13.2419L13.2419 17.698C12.9359 17.202 12.75 16.625 12.75 16C12.75 14.208 14.208 12.75 16 12.75ZM16 19.25C15.376 19.25 14.798 19.0641 14.302 18.7581L18.7581 14.302C19.0641 14.798 19.25 15.375 19.25 16C19.25 17.792 17.792 19.25 16 19.25Z" fill="#25314C" />
                                    </svg>
                                  </button>
                                </div>
                                <p className="bio mb-1 text-[18px] text-center mt-[5px] text-white overflow-ellipsis overflow-hidden whitespace-nowrap">
                                  {el.profile_bio !== "undefined" ? el.profile_bio : ""}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  })}
                </div>)
                : <div className="p-[16px] bg-white rounded-[0.56rem] flex justify-center items-center min-h-[450px]">
                  <h2 className="m-0 text-center">{t('No Any Blocked Profiles...')}</h2>
                </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlockUser;
/* jshint ignore:end */