/* jshint esversion: 6 */
/* jshint ignore:start */

import React, { useContext, useState } from 'react';
import { MyContext } from '../Context/MyProvider';

const PayStack = ({ Amount }) => {
    const { setPayClose, setPlanId, setTransactionId, page, setBuyCoin } = useContext(MyContext);

    const handlePayment = () => {
        const localData = localStorage.getItem("Register_User");
        if (!localData) return;
        const parsedData = JSON.parse(localData);

        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        script.onload = () => {
            const paymentHandler = window.PaystackPop.setup({
                key: "pk_test_71d15313379591407f0bf9786e695c2616eece54",
                email: parsedData.email,
                amount: Amount * 100,
                currency: "NGN",
                callback: (response) => {
                    if (page == "Upgrade") {
                        setPlanId("PaymentDone");
                        setTransactionId(response.transaction);
                    } else if (page == "Wallet") {
                        setPayClose("PaymentDone");
                    } else {
                        setBuyCoin("PaymentDone");
                    }
                },
                onClose: () => {
                    if (page == "Upgrade") {
                        setPlanId("PaymentNotDone");
                    } else if (page == "Wallet") {
                        setPayClose("PaymentNotDone");
                    } else {
                        setBuyCoin("PaymentNotDone");
                    }
                },
            });

            paymentHandler.openIframe();
        };

        document.body.appendChild(script);
    };

    return (
        <div className="h-[100%] flex justify-center items-center">
            <button className='font-[600] bg-[rgba(152,14,255,255)] px-[20px] rounded-[5px] py-[8px] text-white' onClick={handlePayment}>
                Pay with Paystack
            </button>
        </div>
    );
}

export default PayStack
/* jshint ignore:end */
