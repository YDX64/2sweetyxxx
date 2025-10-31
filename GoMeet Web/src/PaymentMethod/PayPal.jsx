/* jshint esversion: 6 */
/* jshint ignore:start */

import React, { useContext, useEffect, useState } from 'react';
import { MyContext } from '../Context/MyProvider';

const Paypal = ({ Amount }) => {

    const { setPayClose, setPlanId, setTransactionId, page, setBuyCoin } = useContext(MyContext);

    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    useEffect(() => {
        const loadPayPalScript = () => {
            const script = document.createElement('script');
            script.src = "https://www.paypal.com/sdk/js?client-id=Aa0Yim_XLAz89S4cqO-kT4pK3QbFsruHvEm8zDYX_Y-wIKgsGyv4TzL84dGgtWYUoJqTvKUh0JonIaKa";
            script.async = true;
            script.onload = () => setIsScriptLoaded(true);
            document.body.appendChild(script);
        };
        if (!isScriptLoaded) {
            loadPayPalScript();
        }
    }, [isScriptLoaded]);

    useEffect(() => {
        if (isScriptLoaded && window.paypal) {
            renderPayPalButton();
        }
    }, [isScriptLoaded]);


    const renderPayPalButton = () => {
        window.paypal.Buttons({
            createOrder: (data, actions) => {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: Amount,
                        },
                    }],
                });
            },
            onApprove: (data, actions) => {
                return actions.order.capture().then((details) => {
                    if (page == "Upgrade") {
                        setPlanId("PaymentDone");
                        setTransactionId(details.id);
                    } else if (page == "Wallet") {
                        setPayClose("PaymentDone");
                    } else {
                        setBuyCoin("PaymentDone");
                    }
                });
            },
            onCancel: () => {
                // alert("Payment cancelled");
                if (page == "Upgrade") {
                    setPlanId("PaymentNotDone");
                } else if (page == "Wallet") {
                    setPayClose("PaymentNotDone");
                } else {
                    setBuyCoin("PaymentNotDone");
                }
            },
            onError: (err) => {
                console.error(err);
                // alert("Payment failed");
            },
        }).render('#paypal-button-container');
    };


    return (
        <div className='w-full'>
            <div id="paypal-button-container"></div>
        </div>
    );
};

export default Paypal;
/* jshint ignore:end */

