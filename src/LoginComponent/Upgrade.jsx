/* jshint esversion: 6 */
/* jshint esversion: 8 */
/* jshint ignore:start */ 
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { MyContext } from '../Context/MyProvider';
import Razorpay from '../PaymentMethod/Razorpay';
import Paypal from '../PaymentMethod/PayPal';
import { StripePayment } from '../PaymentMethod/Stripe';
import PayStack from '../PaymentMethod/PayStack';
import FlutterWave from '../PaymentMethod/FlutterWave';
import SenangPay from '../PaymentMethod/SenangPay';
import Payfast from '../PaymentMethod/Payfast';
import Midtrans from '../PaymentMethod/Midtrans';
import Checkout from '../PaymentMethod/Checkout';
import KhaltiPayment from '../PaymentMethod/Khalti_Payment';
import MercadoPagoCheckout from '../PaymentMethod/MercadoPago';
import PaytmPayment from '../PaymentMethod/PaytmPayment';
import { useTranslation } from 'react-i18next';
import { MdOutlineErrorOutline } from "react-icons/md";
import { showTost } from '../showTost';
import wallet from "../Icon/wallet.svg";

const Upgrade = () => {

    const { t } = useTranslation();

    const { basUrl, imageBaseURL, planId, setPlanId, transactionId, setTransactionId, setPageName, currency, setAmount } = useContext(MyContext);

    const [planLIst, setPlanList] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [isVisible2, setIsVisible2] = useState(false);
    const [payDetails, setPayDetails] = useState([]);
    const [border, setBorder] = useState();
    const [button, setButton] = useState(true);
    const [payId, setPayId] = useState();
    const [id, setId] = useState();
    const [pId, setPId] = useState();
    const [packageId, setPackageId] = useState();
    const [planData, setPlanData] = useState([]);
    const [btnDis, setBtnDis] = useState(false);
    const [coin, setCoin] = useState();

    const toggleBottomSheet = (e) => {

        if (e === 'PayMent') {
            setIsVisible(false);
            setBtnDis(false);
        } else {
            setIsVisible(true);
        }
    };

    const PalanDetailsHandler = () => {
        setIsVisible2(!isVisible2);
    };

    useEffect(() => {
        const Done = localStorage.getItem("PaymentDone");
        if (Done === "PaymentDoneUpgrade") {
            PurchaseHandler();
            setTransactionId(Date.now());
            setAmount(localStorage.getItem("Amount"));
        }

        axios.post(`${basUrl}paymentgateway.php`)
            .then((res) => {
                setPayDetails(res.data.paymentdata);
            });

        PalnListHandler();
        CoinHandler();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchUserData(String(position.coords.latitude), String(position.coords.longitude));
            });
    }, []);

    const CoinHandler = () => {
        const localData = localStorage.getItem("Register_User");

        if (localData) {
            const userData = JSON.parse(localData);

            axios.post(`${basUrl}wallet_report.php`, { uid: userData.id })
                .then((res) => {
                    if (res.data.Result === "true") {
                        setCoin(res.data.wallet);
                    }
                });
        }
    };

    const fetchUserData = async (latitude, longitude) => {
        const localData = localStorage.getItem("Register_User");

        if (localData) {
            const userData = JSON.parse(localData);

            try {
                const response = await axios.post(`${basUrl}home_data.php`, {
                    uid: userData.id,
                    lats: latitude,
                    longs: longitude,
                });

                if (response.data.Result === "true") {
                    setPlanData(response.data.plandata);
                    setPackageId(response.data.plan_id);
                }
            } catch (error) {
                console.error("Error :", error);
            }
        }
    };

    const PalnListHandler = () => {
        const localData = localStorage.getItem("Register_User");

        if (localData) {
            const userData = JSON.parse(localData);
            axios.post(`${basUrl}plan.php`, { uid: userData.id })
                .then((res) => {
                    setPlanList(res.data.PlanData);
                });
        }
    };

    useEffect(() => {
        if (planId === "PaymentDone") {
            PurchaseHandler();
        } else {
            SectionCloseHandler();
        }
    }, [planId]);

    const SendHandler = (Id) => {
        if (border) {
            setPayId(Id);
            setButton(true);

            const Data = {
                Planid: planLIst[id] && planLIst[id].id,
                Pname: Id,
                pMethodid: pId
            };

            localStorage.setItem("Data", JSON.stringify(Data));

        } else {
            if (btnDis) {
                if (planLIst[id].amt > coin) {
                    showTost({ title: "Please Add Balance..!!" });
                    setIsVisible(false);
                } else {
                    setPayId(Id);
                    setPlanId("PaymentDone");
                }
            } else {
                showTost({ title: "Please Select Payment Method" });
            }
        }
    };

    const PurchaseHandler = () => {
        const localData = localStorage.getItem("Register_User");
        const Data = localStorage.getItem("Data");

        if (localData) {
            const userData = JSON.parse(localData);
            if (Data) {
                const Json = JSON.parse(Data);
                axios.post(`${basUrl}plan_purchase.php`,
                    {
                        uid: userData.id,
                        plan_id: Json && Json.Planid,
                        wall_amt: btnDis ? planLIst[id].amt : "0",
                        transaction_id: Date.now(),
                        pname: Json && Json.Pname,
                        p_method_id: Json && Json.pMethodid,
                    })
                    .then((res) => {
                        if (res.data.Result === "true") {
                            showTost({ title: res.data.ResponseMsg });
                            SectionCloseHandler();
                        }
                    });
            } else {
                axios.post(`${basUrl}plan_purchase.php`,
                    {
                        uid: userData.id,
                        plan_id: planLIst[id] && planLIst[id].id,
                        wall_amt: btnDis ? planLIst[id].amt : "0",
                        transaction_id: transactionId || Date.now(),
                        pname: payId ? payId : "5",
                        p_method_id: pId ? pId : "5"
                    })
                    .then((res) => {
                        if (res.data.Result === "true") {
                            showTost({ title: res.data.ResponseMsg });
                            SectionCloseHandler();
                        }
                    });
            }
        }
    };


    const GetStartedHandler = (index, id) => {
        if (packageId < id) {
            toggleBottomSheet("");
            setId(index);
            setPageName("Upgrade");
        } else {
            showTost({ title: "Allredy Purchase" });
        }
    };

    const SectionCloseHandler = () => {
        setPlanId("");
        toggleBottomSheet("PayMent");
        setBorder("");
        setPayId("");
        setButton(false);
        setId("");
        localStorage.setItem("PaymentDone", "");
        localStorage.setItem("Amount", "");
        localStorage.setItem("Data", "");
    };

    const SwitchHandler = () => {
        if (btnDis) {
            setBtnDis(false);
        } else {
            setBtnDis(true);
        }
        setBorder("");
    };

    return (
        <div className='bg-[#e5e5e5] main-wrapper-history'>
            <div className="content-body">
                <div className="container-fluid py-4 px-sm-4 px-3">
                    <div className="row">
                        <div className="col-xl-12">
                            <div className="card card-rounded mb-4">
                                <div className="card-body card-py-1">
                                    <div className="person-header">
                                        <div className="fw-medium fs-16">{t('Plans')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-12 mt-2">
                            <div className="tab-content plan-content">
                                <div className="tab-pane border-0 active show">
                                    <div className="row justify-content-center">
                                        {
                                            planLIst?.map((item, index) => {
                                                return <div key={index} className="col-xxl-3 col-lg-6 col-md-6 col-sm-12 mb-4">
                                                    <div className={`card card-rounded-1 ${item.id === packageId && "ActivePlan"} `}>
                                                        <div className="card-body p-0">
                                                            <div className="p-sm-4 p-4">
                                                                <h3 className="mb-0">{item.title}</h3>
                                                                <h2 className="mb-0">{currency ? currency : "$"}{item.amt}</h2>
                                                                <p className="fw-semi-bold mb-2">Per, {item.day_limit} Days</p>
                                                                <button onClick={() => GetStartedHandler(index, item.id)} style={{ background: "rgba(152,14,255,255)" }} className="btn text-white  my-3">
                                                                    {t('Get Started')}
                                                                </button>
                                                                <div className="plans-includes">
                                                                    <span>Includes:</span>
                                                                </div>
                                                                <ul className="list-unstyled p-0 mt-[15px]">
                                                                    {item.description.split('\n').map((line, index) => (
                                                                        <li className='py-[8px]' key={index}>{line}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                        {item.id === packageId && <div style={{ background: "rgba(152,14,255,255)" }} className="position-absolute popular-title flex items-center rounded-[5px]">
                                                            <h6 style={{ background: "rgba(152,14,255,255)", borderRadius: "5px" }} className="card fw-medium m-0 text-white py-[5px] px-[10px] ">Active </h6>
                                                            <button onClick={PalanDetailsHandler}><MdOutlineErrorOutline className='text-white me-[10px] text-[20px]' /></button>
                                                        </div>}
                                                    </div>
                                                </div>
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isVisible && (
                <div onClick={() => toggleBottomSheet("PayMent")} className="bottom-sheet2 w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
                    <div onClick={(e) => e.stopPropagation()} className="bottom-sheet-content2">
                        <div className="mt-[10px]">
                            {/* <h6 className='text-[18px]'>Select Payment Methode</h6> */}
                            {coin > 0 && <div className="flex items-center justify-between">
                                <div className="mt-[5px] mb-[10px] flex gap-[10px] items-center">
                                    <img src={wallet} alt="" />
                                    <h6 className="m-0">My Wallet (${btnDis ? coin - planLIst[id]?.amt : coin})</h6>
                                </div>
                                <button>
                                    <div className="df-center gap-3">
                                        <label className="switch">
                                            <input onClick={SwitchHandler} type="checkbox" checked={btnDis} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </button>
                            </div>}
                            <div className="scroll-container2 h-[330px]">
                                {
                                    payDetails.map((item, index) => {
                                        return <div onClick={() => { setBorder(item.title); setPId(item.id) }} className={`${border === item.title ? "border-[rgba(152,14,255,255)]" : "border-gray-300"} mb-[10px] flex items-center cursor-pointer border-[2px] rounded-[10px] px-[10px] py-[12px]`}>
                                            <div className="flex items-center gap-[10px]">
                                                <img src={imageBaseURL + item.img} className='border-[2px] w-[50px] h-[50px] rounded-[10px] bg-gray-200' alt="" />
                                                <div className="mx-[10px]">
                                                    <h4 className='m-0'>{item.title}</h4>
                                                    <p className={`font-[500] text-[14px]`}>{item.subtitle}</p>
                                                </div>
                                            </div>
                                            <div className={`${border === item.title ? "border-[rgba(152,14,255,255)]" : "border-gray-300"} ${item.id === "7" ? "w-[21px]" : item.id === "8" ? "w-[20px]" : "w-[24px]"} h-[20px] border-[2px] rounded-full p-[3px]`}>
                                                <span className={`${border === item.title && "bg-[rgba(152,14,255,255)]"} duration-300 w-[100%] h-[100%] rounded-full block`}></span>
                                            </div>
                                        </div>
                                    })
                                }

                            </div>
                        </div>

                        <button onClick={() => SendHandler(border)} className="text-white bg-[rgba(152,14,255,255)] w-[100%] font-[600] rounded-[10px] py-[10px] mt-[10px]">Continue</button>
                    </div>
                </div>
            )}

            {payId === "Razorpay" && button && <Razorpay Amount={planLIst[id]?.amt} />}
            {payId === "Paypal" && button && <div onClick={() => setPayId("")} id="BlockSection" className=" px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
                <div onClick={(e) => e.stopPropagation()} className="w-[20%]  max-_430_:w-[100%] max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] bg-white rounded-[15px] p-[15px]">
                    <div className="flex flex-col justify-center items-center text-center">
                        <Paypal Amount={planLIst[id]?.amt} />
                    </div>
                </div>
            </div>}
            {payId === "Stripe" && button && <div onClick={() => setPayId("")} id="BlockSection" className=" px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
                <div onClick={(e) => e.stopPropagation()} className="w-[20%]  max-_430_:w-[100%] max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] bg-white rounded-[15px] p-[15px]">
                    <div className="flex flex-col justify-center items-center text-center">
                        <StripePayment Amount={planLIst[id]?.amt} />
                    </div>
                </div>
            </div>}
            {payId === "PayStack" && button && <div onClick={() => setPayId("")} id="BlockSection" className=" px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-30 z-[999]">
                <div onClick={(e) => e.stopPropagation()} className="w-[20%]  max-_430_:w-[100%] max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] bg-white rounded-[15px] p-[15px]">
                    <div className="flex flex-col justify-center items-center text-center">
                        <PayStack Amount={planLIst[id]?.amt} />
                    </div>
                </div>
            </div>}
            {payId === "FlutterWave" && button && <FlutterWave Amount={planLIst[id]?.amt} />}
            {payId === "SenangPay" && button && <SenangPay Amount={planLIst[id]?.amt} />}
            {payId === "Payfast" && button && <Payfast Amount={planLIst[id]?.amt} />}
            {payId === "Midtrans" && button && <Midtrans Amount={planLIst[id]?.amt} />}
            {payId === "2checkout" && button && <Checkout Amount={planLIst[id]?.amt} />}
            {payId === "Khalti Payment" && button && <KhaltiPayment Amount={planLIst[id]?.amt} />}
            {payId === "MercadoPago" && button && <MercadoPagoCheckout Amount={planLIst[id]?.amt} />}
            {payId === "Paytm" && button && <PaytmPayment Amount={planLIst[id]?.amt} />}


            {isVisible2 && (
                <div onClick={PalanDetailsHandler} className="px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
                    <div onClick={(e) => e.stopPropagation()} className="w-[20%] max-_430_:w-[100%] max-_768_:w-[75%] max-_1030_:w-[45%] max-_1500_:w-[35%] bg-white rounded-[15px] px-[15px] py-[10px]">
                        <div className="flex items-center justify-between py-[5px]">
                            <h6 className='m-0'>Payment method</h6>
                            <h6 className='m-0'>{planData?.p_name}</h6>
                        </div>
                        <div className="flex items-center justify-between py-[5px]">
                            <h6 className='m-0'>Transaction id</h6>
                            <h6 className='m-0'>{planData?.trans_id}</h6>
                        </div>
                        <div className="flex items-center justify-between py-[5px] border-t-[2px]">
                            <h6 className='m-0'>Date of Purchase</h6>
                            <h6 className='m-0'>{planData?.plan_start_date}</h6>
                        </div>
                        <div className="flex items-center justify-between py-[5px] border-b-[2px]">
                            <h6 className='m-0'>Date of Expiry</h6>
                            <h6 className='m-0'>{planData?.plan_end_date}</h6>
                        </div>
                        <div className="flex items-center justify-between py-[5px]">
                            <h6 className='m-0'>Membership Amount</h6>
                            <h6 className='m-0'>{currency ? currency : "$"}{planData?.amount}</h6>
                        </div>
                    </div>
                </div>
            )}

            {/* <!-- Overlay Start --> */}
            <div
                onClick={PalanDetailsHandler}
                id="overlay"
                className="overlay"
            ></div>
            {/* <!-- Overlay End --> */}

            {planLIst.length === 0 && (
                <div className="w-[100%] h-[100vh] ms-[8rem] max-_991_:ms-0 bg-white fixed flex items-center justify-center top-0 left-0 right-0 bottom-0 z-[555]">
                    <div className="">
                        <h2 className="">{t('Loading...')}</h2>
                    </div>
                </div>
            )}

        </div >

    )
}

export default Upgrade
/* jshint ignore:end */
