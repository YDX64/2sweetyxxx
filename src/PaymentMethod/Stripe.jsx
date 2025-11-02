/* jshint esversion: 6 */
/* jshint esversion: 8*/
/* jshint ignore:start */

import React, { useContext, useEffect, useState } from 'react';
import {
    Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { MyContext } from '../Context/MyProvider';
import axios from 'axios';

// Payment form component
const SplitForm = ({ fontSize, amount }) => {

    const { setPayClose, setPlanId, setTransactionId, page, setBuyCoin, paymentBaseURL } = useContext(MyContext);

    const [cardNumber, setCardnumber] = useState();
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const number = cardNumber.replace(/\s+/g, '');
        const month = expiry.split("/")[0];
        const year = expiry.split("/")[1];

        const UserData = localStorage.getItem("Register_User");
        if (UserData) {
            const UserDetails = JSON.parse(UserData);

            axios.post(`${paymentBaseURL}react_stripe/token.php`,
                {
                    "card_number": number,
                    "exp_month": month,
                    "exp_year": `20${year}`,
                    "cvc": cvc,
                    "custName": UserDetails.name,
                    "custEmail": UserDetails.email,
                    "amount": amount
                }
            )
                .then((res) => {
                    if (res.data.Result === "true") {
                        if (page === "Upgrade") {
                            setPlanId("PaymentDone");
                            setTransactionId(res.data.Transaction_id);
                        } else if (page === "Wallet") {
                            setPayClose("PaymentDone");
                        } else {
                            setBuyCoin("PaymentDone");
                        }
                    }
                });
        }
    };

    const handleCardNumberChange = (e) => {
        let value = e.target.value;
        const cleanedValue = value.replace(/\D/g, '');
        const formattedValue = cleanedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
        setCardnumber(formattedValue);
    };

    const handleExpiryChange = (e) => {
        const value = e.target.value;
        const cleanedValue = value.replace(/\D/g, '');
        const formattedValue = cleanedValue.replace(/(\d{2})(?=\d)/g, '$1/');
        setExpiry(formattedValue);
    };

    return (
        <form onSubmit={handleSubmit} className="DemoWrapper d-flex flex-column w-[100%]">
            <label>
                <span className='text-[18px] font-[500]'>Card number</span> <br />
                <input
                    type="text"
                    placeholder="1234 1234 1234 1234"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength="19"
                    className='border-[2px] w-[100%] outline-none py-[3px] px-[5px] rounded-[5px] mt-[5px]'
                />
            </label>
            <div className="flex justify-between items-center mt-[10px]">
                <label className='w-[40%]'>
                    <span className='text-[18px] font-[500]' >Expiration date</span>
                    <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={handleExpiryChange} // Format expiry date
                        maxLength="5"  // Maximum length for MM/YY format (5 characters, including '/')
                        className='border-[2px] w-[100%] outline-none py-[3px] px-[5px] rounded-[5px] mt-[5px]'
                    />
                </label>
                <label className='w-[40%]'>
                    <span className='text-[18px] font-[500]' >CVC</span>
                    <input type='number' onChange={(e) => setCvc(e.target.value)} placeholder='CVC' className='border-[2px] w-[100%] outline-none py-[3px] px-[5px] rounded-[5px] mt-[5px]' />
                </label>
            </div>
            <button type="submit" className='mt-[20px] bg-[rgba(152,14,255,255)] text-white text-[18px] py-[5px] rounded-[5px]'>
                Pay {amount ? `$${amount}` : ""}
            </button>
        </form>
    );
};

// Load Stripe API key
const stripePromise = loadStripe("pk_test_6pRNASCoBOKtIshFeQd4XMUh");

// Main component that contains the Stripe form
export const StripePayment = ({ Amount }) => {
    const [elementFontSize, setElementFontSize] = useState(() =>
        window.innerWidth < 450 ? "14px" : "18px"
    );

    useEffect(() => {
        const handleResize = () => {
            setElementFontSize(window.innerWidth < 450 ? "14px" : "18px");
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="Checkout w-[100%] text-start">
            <Elements stripe={stripePromise}>
                <SplitForm fontSize={elementFontSize} amount={Amount} />
            </Elements>
        </div>
    );
};
/* jshint ignore:end */
