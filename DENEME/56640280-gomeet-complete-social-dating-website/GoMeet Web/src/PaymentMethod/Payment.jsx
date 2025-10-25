/* jshint esversion: 6 */
/* jshint ignore:start */

import React, { useContext, useEffect, useState } from 'react';
import wallet from "../Icon/wallet.svg";
import { MyContext } from '../Context/MyProvider';
import axios from 'axios';
import Razorpay from './Razorpay';
import Paypal from './PayPal';
import PayStack from './PayStack';
import FlutterWave from './FlutterWave';
import SenangPay from './SenangPay';
import Payfast from './Payfast';
import Midtrans from './Midtrans';
import Checkout from './Checkout';
import KhaltiPayment from './Khalti_Payment';
import MercadoPagoCheckout from './MercadoPago';
import PaytmPayment from './PaytmPayment';
import { showTost } from "../showTost";
import { StripePayment } from './Stripe';
const Payment = ({ Amount }) => {
    const { basUrl, imageBaseURL, setToggleButton, setAmount, payClose, page, buyCoin, setWalletCoin, setBuyCoin, button, setButton } = useContext(MyContext);

    const [input, setInput] = useState();
    const [border, setBorder] = useState();
    const [payDetails, setPayDetails] = useState([]);
    const [payId, setPayId] = useState();
    const [btnDis, setBtnDis] = useState(false);
    const [amount, setamount] = useState();
    const [coin, setCoin] = useState();

    const PurchaseHandler = (id) => {
        if (input || Amount) {
            if (btnDis) {
                setWalletCoin(Amount);
                setamount(Amount - coin);
            } else {
                setAmount(input);
                if (Amount) {
                    setamount(Amount);
                } else {
                    setamount(input);
                    localStorage.setItem("Amount", input);
                }
            }

            if (!btnDis) {
                if (border) {
                    setPayId(id);
                    setButton(true);
                } else {
                    showTost({ title: "Please Select Payment Method" });
                }
            } else {
                if (Amount > coin) {
                    showTost({ title: "Please Add Balance..!!" });
                    setToggleButton(false);
                } else {
                    setBuyCoin("PaymentDone");
                }
            }
        } else {
            showTost({ title: "Please Enter Amount" });
        }
    };

    useEffect(() => {
        axios.post(`${basUrl}paymentgateway.php`)
            .then((res) => {
                setPayDetails(res.data.paymentdata);
            });

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
    }, [basUrl]);

    useEffect(() => {
        if (payClose || buyCoin) {
            setInput("");
            setBorder("");
            setAmount("");
            setPayId("");
            setButton(false);
        }
    }, [payClose, buyCoin, setAmount, setButton]);

    const SwitchHandler = () => {
        if (btnDis) {
            setBtnDis(false);
        } else {
            setBtnDis(true);
        }
        setBorder("");
    };

    const SelectPaymentMethodHandle = (item) => {
        setBtnDis(false);
        setBorder(item);
    };

    return (
        <div>
            <div onClick={() => setToggleButton(false)} className="bottom-sheet2 w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
                <div onClick={(e) => e.stopPropagation()} className="bottom-sheet-content2">
                    {page !== "BuyCoin" && <div className="">
                        <h6>Add Wallet Amount</h6>
                        <div className="flex items-center justify-between">
                            <div className="mt-[10px] flex gap-[15px] w-[100%] items-center border-[2px] focus-within:border-[rgba(152,14,255,255)] border-gray-300 px-[15px] py-[7px] rounded-[10px]">
                                <img src={wallet} alt="" />
                                <input type="number" onChange={(e) => setInput(e.target.value)} className='outline-none w-[100%] text-[rgba(152,14,255,255)] font-[600]' placeholder='Enter Amount' />
                            </div>
                        </div>
                    </div>}
                    <div className="">
                        {page === "Wallet" && <h6 className='text-gray-400 text-[15px] mt-[10px]'>Select Payment Methode</h6>
                        }
                        {page === "BuyCoin" && coin > 0 && <div className="flex items-center justify-between">
                            <div className="mt-[5px] mb-[10px] flex gap-[10px] items-center">
                                <img src={wallet} alt="" />
                                <h6 className="m-0">My Wallet (${btnDis ? coin - Amount : coin})</h6>
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
                        <div className="scroll-container2 h-[350px]">
                            {
                                payDetails.map((item) => {
                                    return <div onClick={() => SelectPaymentMethodHandle(item.title)} className={`${border === item.title ? "border-[rgba(152,14,255,255)]" : "border-gray-300"} mb-[10px] flex items-center justify-between cursor-pointer border-[2px] rounded-[10px] px-[10px] py-[12px]`}>
                                        <div className="flex items-center gap-[10px]">
                                            <img src={imageBaseURL + item.img} className='border-[2px] w-[50px] h-[50px] rounded-[10px] bg-gray-200' alt="" />
                                            <div className="mx-[10px] w-[80%]">
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
                    <button onClick={() => PurchaseHandler(border)} className="text-white bg-[rgba(152,14,255,255)] w-[100%] font-[600] rounded-[10px] py-[10px] mt-[10px]">{btnDis ? "Wallte Pay" : "Continue"}</button>
                </div>
            </div>

            {payId === "Razorpay" && button && <Razorpay Amount={amount} />}
            {payId === "Paypal" && button && <div onClick={() => setPayId("")} id="BlockSection" className=" px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
                <div onClick={(e) => e.stopPropagation()} className="w-[20%]  max-_430_:w-[100%] max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] bg-white rounded-[15px] p-[15px]">
                    <div className="flex flex-col justify-center items-center text-center">
                        <Paypal Amount={amount} />
                    </div>
                </div>
            </div>}
            {payId === "Stripe" && button && <div onClick={() => setPayId("")} id="BlockSection" className=" px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
                <div onClick={(e) => e.stopPropagation()} className="w-[20%]  max-_430_:w-[100%] max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] bg-white rounded-[15px] p-[15px]">
                    <div className="flex flex-col justify-center items-center text-center">
                        <StripePayment Amount={amount} />
                    </div>
                </div>
            </div>}
            {payId === "PayStack" && button && <div onClick={() => setPayId("")} id="BlockSection" className=" px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-30 z-[999]">
                <div onClick={(e) => e.stopPropagation()} className="w-[20%]  max-_430_:w-[100%] max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] bg-white rounded-[15px] p-[15px]">
                    <div className="flex flex-col justify-center items-center text-center">
                        <PayStack Amount={amount} />
                    </div>
                </div>
            </div>}
            {payId === "FlutterWave" && button && <FlutterWave Amount={amount} />}
            {payId === "SenangPay" && button && <SenangPay Amount={amount} />}
            {payId === "Payfast" && button && <Payfast Amount={amount} />}
            {payId === "Midtrans" && button && <Midtrans Amount={amount} />}
            {payId === "2checkout" && button && <Checkout Amount={amount} />}
            {payId === "Khalti Payment" && button && <KhaltiPayment Amount={amount} />}
            {payId === "MercadoPago" && button && <MercadoPagoCheckout Amount={amount} />}
            {payId === "Paytm" && button && <PaytmPayment Amount={amount} />}

        </div>
    )
}

export default Payment
/* jshint ignore:end */
