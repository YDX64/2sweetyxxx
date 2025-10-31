/* jshint esversion: 6 */
/* jshint ignore:start */

import React, { useContext, useEffect, useState } from 'react';
import ArrowUp from "../Icon/arrow-up.svg";
import { MyContext } from '../Context/MyProvider';
import axios from 'axios';
import Payment from '../PaymentMethod/Payment';
import { useTranslation } from 'react-i18next';
import { showTost } from '../showTost';
import Credit from "../images/icons/history-addion.png";
import Debit from "../images/icons/history-subs.png";
const Wallet = () => {

    const { t } = useTranslation();

    const { basUrl, payClose, setPayClose, toggleButton, setToggleButton, setPageName, amount, setAmount, currency } = useContext(MyContext);

    const [coin, setCoin] = useState();
    const [purchase, setPurchase] = useState([]);

    const CoinHandler = () => {
        const localData = localStorage.getItem("Register_User");

        if (localData) {
            const userData = JSON.parse(localData);
            axios
                .post(`${basUrl}wallet_report.php`, { uid: userData.id })
                .then((res) => {
                    if (res.data.Result === "true") {
                        setCoin(res.data.wallet);
                        setPurchase(res.data.Walletitem);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching wallet data: ", error);
                });
        }
    };

    useEffect(() => {
        const Done = localStorage.getItem("PaymentDone"); 
        if (Done === "PaymentDoneWallet") {
            setPayClose("PaymentDone");
            setAmount(localStorage.getItem("Amount"));
        }
        CoinHandler();
    }, []);

    useEffect(() => {
        if (payClose) {
            
            if (payClose === "PaymentDone") {
                handleWalletUpdate();
            } else {
                showTost({ title: "Payment Failed..!!" });
                SectionCloseHandler();
            }
        }
    }, [payClose]);

    const handleWalletUpdate = () => {
        const localData = localStorage.getItem("Register_User");
        if (localData) {
            const userData = JSON.parse(localData);
            axios.post(`${basUrl}wallet_up.php`, {
                uid: userData.id,
                wallet: amount,
            })
                .then((res) => {
                    SectionCloseHandler();
                    showTost({ title: res.data.ResponseMsg });
                    CoinHandler();
                })
                .catch((error) => {
                    showTost({ title: "Somthing Want Wrong!!" });
                });
        }
    };

    const SectionCloseHandler = () => {
        setToggleButton(false);
        setPayClose("");
        localStorage.removeItem("PaymentDone");
        localStorage.removeItem("Amount");
    };

    return (
        <div className='bg-[#e5e5e5] main-wrapper-history'>
            {/* <!-- Main Content Start --> */}
            <div className="content-body">
                <div className="container-fluid pt-5 pb-[20px] px-sm-4 px-3">
                    <div className="row">
                        <div className="col-xl-12 max-_430_:fixed max-_430_:rounded-[10px] max-_430_:bg-[#e5e5e5] top-[70px] left-0 right-0 z-[444] max-_430_:pt-[15px]">
                            <div className="card card-rounded mb-4">
                                <div className="card-body card-py-1 flex justify-between items-center">
                                    <div className="person-header">
                                        <div className="fw-medium fs-15">{t('Total Balance')}</div>
                                        <h2 className='m-0 text-[30px]'>{currency ? currency : "$"}{coin ? coin : "0"}</h2>
                                    </div>
                                    <button onClick={() => { setToggleButton(true); setPageName("Wallet") }} className="flex items-center gap-[10px] bg-[#980EFF] text-white rounded-full px-[8px] py-[5px]">
                                        <img src={ArrowUp} alt="" className='bg-white rounded-full p-[7px] w-[30px] h-[30px]' />
                                        <h6 className='mt-[8px]'>{t("Top-up")}</h6>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-12 z-[333] ">
                            <div className="card card-rounded-1 max-_430_:mt-[75px]">
                                {purchase.length > 0
                                    ? <div className="card-body">
                                        <h5>{t('Transaction')}</h5>
                                        <div className="mt-[20px]">
                                            {purchase?.map((item, index) => (
                                                <div
                                                    className="w-[100%] ps-[30px] mb-[20px] pe-[50px] max-_430_:ps-[10px] max-_430_:pe-[10px] py-[20px] justify-between border-[2px] flex items-center rounded-[25px]"
                                                    key={index}
                                                >
                                                    <div className="flex items-center gap-[30px] max-_430_:gap-[10px]">
                                                        <img src={item.status === "Credit" ? Credit : Debit} className={`w-[40px] h-[40px] rounded-full`} alt="Caredit Debit" />
                                                        <div>
                                                            <h6 className="m-0 text-[18px] max-_430_:text-[15px]">{item.message}</h6>
                                                            <h6 className="m-0 text-[14px] text-gray-500 tracking-[1px]">{item.status}</h6>
                                                        </div>
                                                    </div>
                                                    <h6 className={`${item.status === "Credit" ? "text-green-500" : "text-red-500"} m-0 text-[18px] max-_430_:text-[16px]`}>
                                                        {item.status === "Credit" ?
                                                            (`+${currency ? currency : "$"}${item.amt}`) :
                                                            (`-${currency ? currency : "$"}${item.amt}`)
                                                        }
                                                    </h6>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    : <div className="h-[400px] flex justify-center items-center">
                                        <h3>{t('No any Transaction...')}</h3>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- Main Content End --> */}

            {/* ======== Payment Method ============== */}
            {toggleButton &&
                <Payment />
            }
        </div>

    )
}

export default Wallet
/* jshint ignore:end */
