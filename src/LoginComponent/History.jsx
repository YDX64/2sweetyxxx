/* jshint esversion: 6 */
/* jshint ignore:start */
import React, { useContext, useEffect, useRef, useState } from "react";
import Padding from "../Icon/money-bill-clock.svg";
import { MdChevronRight } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MyContext } from "../Context/MyProvider";
import { useTranslation } from "react-i18next";
import Credit from "../images/icons/history-addion.png";
import Debit from "../images/icons/history-subs.png";
import PackageIcon from "../images/icons/buycoin-package.png";
const History = () => {

  const { t } = useTranslation();

  const { basUrl, currency } = useContext(MyContext);

  const navigate = useNavigate();

  const [index, setIndex] = useState();
  const [data, setData] = useState("Coin");
  const [isVisible, setIsVisible] = useState(false);
  const [coin, setCoin] = useState([]);
  const [withdrawData, setWithdrawData] = useState([]);

  const BgDisplay = useRef();

  const toggleBottomSheet = (i, e) => {
    setIndex(i);
    if (e === "Show") {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  };

  useEffect(() => {
    const localData = localStorage.getItem("Register_User");

    if (localData) {
      const userData = JSON.parse(localData);
      axios.post(`${basUrl}coin_report.php`, { uid: userData.id })
        .then((res) => {
          setCoin(res.data.Coinitem);
        });
      axios.post(`${basUrl}payout_list.php`, { uid: userData.id })
        .then((res) => {
          setWithdrawData(res.data.Payoutlist);
        });

    }
  }, []);

  return (
    <div className="bg-[#e5e5e5] main-wrapper-history">
      <div className="content-body">
        <div className=" pt-3 pb-[20px] max-_1200_:pb-[20px] px-sm-4 px-[16px] max-_430_:px-[10px]">
          <div className="max-_430_:fixed top-[70px] left-0 right-0 max-_430_:w-[100wh] max-_430_:py-[10px] max-_430_:bg-[#e5e5e5]">
            <div className="flex gap-[20px] rounded-t-[10px] pt-[10px]">
              <button onClick={() => navigate("/buycoin")} className="bg-[white] max-_430_:ms-[10px] mb-[20px] w-[30px] h-[30px] rounded-full p-[6px] flex justify-center items-center z-[555]">
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.7501 8.00002C19.7501 8.41402 19.4141 8.75002 19.0001 8.75002H2.81115L8.53112 14.47C8.82412 14.763 8.82412 15.238 8.53112 15.531C8.38512 15.677 8.19309 15.751 8.00109 15.751C7.80909 15.751 7.61706 15.678 7.47106 15.531L0.471062 8.53103C0.402063 8.46203 0.347197 8.37913 0.309197 8.28713C0.233197 8.10413 0.233197 7.89713 0.309197 7.71413C0.347197 7.62213 0.402063 7.53899 0.471062 7.46999L7.47106 0.469994C7.76406 0.176994 8.2391 0.176994 8.5321 0.469994C8.8251 0.762994 8.8251 1.23803 8.5321 1.53103L2.81213 7.251H19.0001C19.4141 7.25 19.7501 7.58602 19.7501 8.00002Z" fill="#25314C" />
                </svg>
              </button>
              <h4 className="mb-0 mt-[3px]">{t('History')}</h4>
            </div>
            <div className="bg-white p-[20px] max-_430_:px-[10px] max-_430_:py-[10px] max-_430_:mx-[10px] max-_430_:flex max-_430_:justify-center rounded-[10px]">
              <div className="inline-block scroll-container2">
                <div className={`flex gap-[20px] justify-center bg-[#e5e5e5] p-[10px] max-_430_:p-[8px] rounded-full relative `}>
                  <button
                    onClick={() => setData("Coin")}
                    style={{ color: data === "Coin" && "white", backgroundColor: data === "Coin" && 'rgba(152,14,255,255)' }}
                    className="m-0 duration-[0.5s] rounded-full font-[500] max-_430_:text-[15px] max-_768_:text-[16px] max-_380_:text-[13px] text-[18px] px-[20px] py-[10px] max-_430_:py-[8px] z-[200]"
                  >
                    {t('Coin History')}
                  </button>
                  <button
                    onClick={() => setData("Withdraw")}
                    style={{ color: data === "Withdraw" && "white", backgroundColor: data === "Withdraw" && 'rgba(152,14,255,255)' }}
                    className="m-0 duration-[0.5s] rounded-full font-[500] max-_430_:text-[15px] max-_768_:text-[16px] max-_380_:text-[13px] text-[18px] px-[20px] py-[10px] max-_430_:py-[8px] z-[200]"
                  >
                    {t('Withdraw History')}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {data === "Coin" ? (
            <div className="bg-white p-[5px] rounded-[10px] mt-[20px] max-_430_:mt-[150px]">
              <div className="">
                {
                  coin?.length > 0
                    ? <div className="card-body">
                      <div className="">
                        {
                          coin?.map((item, index) => {
                            return <div key={index} className="w-[100%] ps-[30px] mb-[20px] pe-[50px] max-_430_:ps-[10px] max-_430_:pe-[10px] py-[20px] justify-between border-[2px] flex items-center rounded-[25px]">
                              <div className="flex items-center gap-[30px] max-_430_:gap-[10px]">
                                <img src={item.status === "Credit" ? Credit : Debit} className={`w-[40px] h-[40px] rounded-full`} alt="" />
                                <div className="">
                                  <h6 className='m-0 text-[18px] max-_430_:text-[15px]'>{item.message}</h6>
                                  <h6 className='m-0 text-[14px] text-gray-500 tracking-[1px]'>{item.status}</h6>
                                </div>
                              </div>
                              <div className="flex flex-wrap max-_430_:justify-center items-center gap-[10px]">
                                <img src={PackageIcon} width="20px" alt="" />
                                <h6 className={`${item.status === "Credit" ? "text-[rgba(152,14,255,255)]" : "text-red-500"} m-0 text-[18px] max-_430_:text-[16px]`}>
                                  {item.status === "Credit" ?
                                    (item.amt === "0" ? "Free" : `+${currency ? currency : "$"}${item.amt}`) :
                                    (item.amt === "0" ? "- Free" : `-${currency ? currency : "$"}${item.amt}`)
                                  }
                                </h6>
                              </div>
                            </div>
                          })
                        }
                      </div>
                    </div>
                    : <div className="h-[400px] flex justify-center items-center">
                      <h3>{t('No any Coin History...')}</h3>
                    </div>
                }
              </div>
            </div>
          ) : (
            <div className="bg-white py-[5px] px-[20px] max-_430_:px-[0px] rounded-[10px] mt-[20px] max-_430_:mt-[150px]">
              <div className="">
                {
                  withdrawData?.length > 0
                    ? <div className="card-body">
                      <div className="">
                        {withdrawData.map((el, i) => {
                          return (
                            <button key={i} onClick={() => toggleBottomSheet(i)} className="w-[100%] mb-[15px] ps-[30px] pe-[50px] max-_430_:ps-[10px] max-_430_:pe-[10px] py-[20px] justify-between border-[2px] flex items-center rounded-[25px]">
                              <div className="flex items-center gap-[30px] max-_430_:gap-[10px]">
                                <img
                                  src={Padding}
                                  className="w-[40px] h-[40px] bg-orange-300 rounded-full p-[8px]"
                                  alt=""
                                />
                                <div className="text-start">
                                  <h6 className="m-0 text-[18px] max-_430_:text-[15px]">
                                    {el.status}
                                  </h6>
                                  <h6 className="m-0 text-[14px] text-gray-500 tracking-[1px]">
                                    {el.r_date}
                                  </h6>
                                </div>
                              </div>
                              <div className="text-end flex items-center gap-[10px]">
                                <div className="">
                                  <h6 className="text-[rgba(152,14,255,255)] m-0 text-[18px] max-_430_:text-[16px] ">
                                    {currency ? currency : "$"}{el.amt}
                                  </h6>
                                  <h6 className="text-[rgba(152,14,255,255)] m-0 text-[18px] max-_430_:text-[16px] flex items-center gap-[10px]">
                                    <img src={PackageIcon} width="20px" alt="" />
                                    {el.coin}
                                  </h6>
                                </div>
                                <MdChevronRight className="w-[20px] h-[20px]" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    : <div className="h-[400px] flex justify-center items-center">
                      <h3>{t('No any withdraw History...')}</h3>
                    </div>
                }
              </div>
            </div>
          )}
        </div>
      </div>


      {isVisible && (
        <div onClick={() => toggleBottomSheet(index, "Show")} className="px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
          <div onClick={(e) => e.stopPropagation()} className="w-[20%] max-_430_:w-[100%] max-_768_:w-[75%] max-_1030_:w-[45%] max-_1500_:w-[35%] bg-white rounded-[15px] px-[15px] py-[10px]">
            <div className="">
              <div className="flex items-center justify-between mt-[10px]">
                <h6 className="m-0 text-[16px] font-[500]">{t("Payout id")}</h6>
                <h6 className="m-0 text-[16px] font-[500]">{withdrawData[index].payout_id}</h6>
              </div>
              <div className="flex items-center justify-between mt-[10px]">
                <h6 className="m-0 text-[16px] font-[500]">{t("Number of coin")}</h6>
                <h6 className="m-0 text-[16px] font-[500]">{withdrawData[index].coin}</h6>
              </div>
              <div className="flex items-center justify-between mt-[10px]">
                <h6 className="m-0 text-[16px] font-[500]">{t("Amount")}</h6>
                <h6 className="m-0 text-[16px] font-[500]">{currency ? currency : "$"}{withdrawData[index].amt}</h6>
              </div>
              {withdrawData[index].r_type === "BANK Transfer"
                ? <div className="">
                  <div className="flex items-center justify-between mt-[10px]">
                    <h6 className="m-0 text-[16px] font-[500]">{t("pay by")}</h6>
                    <h6 className="m-0 text-[16px] font-[500]">{withdrawData[index].r_type}</h6>
                  </div>
                  <div className="flex items-center justify-between mt-[10px]">
                    <h6 className="m-0 text-[16px] font-[500]">{t("Account Number")}</h6>
                    <h6 className="m-0 text-[16px] font-[500]">{withdrawData[index].acc_number}</h6>
                  </div>
                  <div className="flex items-center justify-between mt-[10px]">
                    <h6 className="m-0 text-[16px] font-[500]">{t("Bank Name")}</h6>
                    <h6 className="m-0 text-[16px] font-[500]">{withdrawData[index].bank_name}</h6>
                  </div>
                  <div className="flex items-center justify-between mt-[10px]">
                    <h6 className="m-0 text-[16px] font-[500]">{t("Account Name")}</h6>
                    <h6 className="m-0 text-[16px] font-[500]">{withdrawData[index].acc_name}</h6>
                  </div>
                  <div className="flex items-center justify-between mt-[10px]">
                    <h6 className="m-0 text-[16px] font-[500]">{t("Ifsc Code")}</h6>
                    <h6 className="m-0 text-[16px] font-[500]">{withdrawData[index].ifsc_code}</h6>
                  </div>
                </div>
                : <div className="flex items-center justify-between mt-[10px]">
                  <h6 className="m-0 text-[16px] font-[500]">{t("pay by")}</h6>
                  <div className="flex">
                    <h6 className="m-0 text-[16px] font-[500]">{withdrawData[index].r_type}</h6>
                    {withdrawData[index].r_type === "UPI" && <h6 className="m-0 text-[16px] font-[500]">({withdrawData[index].upi_id})</h6>}
                    {withdrawData[index].r_type === "Paypal" && <h6 className="m-0 text-[16px] font-[500]">({withdrawData[index].paypal_id})</h6>}
                  </div>
                </div>
              }
              <div className="flex items-center justify-between mt-[10px]">
                <h6 className="m-0 text-[16px] font-[500]">{t("Request Date")}</h6>
                <h6 className="m-0 text-[16px] font-[500]">{withdrawData[index].r_date}</h6>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <!-- Overlay Start --> */}
      <div
        ref={BgDisplay}
        onClick={toggleBottomSheet}
        id="overlay"
        class="overlay"
      ></div>
      {/* <!-- Overlay End --> */}
    </div>
  );
};

export default History;
/* jshint ignore:end */
