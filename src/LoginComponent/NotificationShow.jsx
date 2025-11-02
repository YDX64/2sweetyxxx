/* jshint esversion: 6 */
/* jshint ignore:start */
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MyContext } from '../Context/MyProvider';
import axios from 'axios';
import { IoIosNotificationsOutline } from "react-icons/io";

const NotificationShow = () => {
    const { t } = useTranslation();

    const { basUrl, setColor } = useContext(MyContext);

    const [data, setData] = useState([]);

    useEffect(() => {
        setColor("");
        const localData = localStorage.getItem("Register_User");
        if (localData) {
            const Id = JSON.parse(localData);
            axios.post(`${basUrl}u_notification_list.php`, { "uid": Id.id })
                .then((res) => {
                    setData(res.data.NotificationData);
                });
        }
    }, []);

    return (
        <div>
            <div className="bg-[#e5e5e5] main-wrapper-history">
                <div className="content-body">
                    <div className="container-fluid pt-5 pb-[20px] px-sm-4 px-3">
                        <div className="col-xl-12 z-[333] ">
                            <div className="card card-rounded-1">
                                {data.length > 0
                                    ? <div className="card-body">
                                        <h5>{t('Notification')}</h5>
                                        <div className="mt-[20px]">
                                            {data?.map((item, index) => (
                                                <div
                                                    className="w-[100%] ps-[30px] mb-[20px] pe-[50px] max-_430_:ps-[10px] max-_430_:pe-[10px] py-[20px] justify-between border-[2px] flex items-center rounded-[25px]"
                                                    key={index}
                                                >
                                                    <div className="flex items-center gap-[30px] max-_430_:gap-[10px] max-_430_:[65%] w-[90%]">
                                                        <IoIosNotificationsOutline className='max-_430_:hidden max-_1200_:text-[60px] text-[30px]' />
                                                        <div>
                                                            <h6 className="m-0 text-[18px] max-_430_:text-[15px]">{item.title}</h6>
                                                            <h6 className="m-0 text-[14px] text-gray-500 tracking-[1px] mt-2 overflow-hidden overflow-ellipsis max-_430_:hidden">{item.description}</h6>
                                                            <h6 className="m-0 text-[14px] text-gray-500 tracking-[1px] mt-2 overflow-hidden hidden max-_430_:block overflow-ellipsis">{item.description.split(".")[0]}</h6>
                                                        </div>
                                                    </div>
                                                    <h6 className="m-0 text-[18px] text-center max-_430_:text-[16px] max-_380_:w-[45%] max-_430_:w-[35%] max-_1030_:w-[25%] w-[20%]">{item.datetime.split(" ")[0]}</h6>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    : <div className="h-[400px] flex justify-center items-center">
                                        <h3>{t('No any Notification...')}</h3>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationShow
/* jshint ignore:end */
