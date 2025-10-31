/* jshint esversion: 6 */
/* jshint esversion: 8 */
import { useContext, useEffect, useState } from 'react';
import { MyContext } from '../Context/MyProvider';
import { useNavigate } from 'react-router-dom';

const FlutterWave = ({ Amount }) => {
    const { setPayClose, setPlanId, setTransactionId, page, setBuyCoin } = useContext(MyContext);
    const navigate = useNavigate();
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    const loadFlutterwaveScript = async () => {
        const script = document.createElement('script');
        script.src = "https://checkout.flutterwave.com/v3.js";
        script.async = true;

        script.onload = () => {
            setIsScriptLoaded(true);
            console.log('Flutterwave script loaded successfully!');
        };

        script.onerror = () => {
            console.error("Failed to load Flutterwave script.");
        };

        document.body.appendChild(script);
    };

    useEffect(() => {
        loadFlutterwaveScript();
    }, []);

    const handlePayment = () => {
        console.log('Attempting to handle payment');
        if (!isScriptLoaded) {
            console.error('Flutterwave script is not loaded.');
            return;
        }

        const localData = localStorage.getItem("Register_User");
        if (!localData) return;

        const parsedData = JSON.parse(localData);

        const paymentOptions = {
            tx_ref: Date.now(),
            amount: Amount,
            currency: 'USD',
            email: parsedData.email,
            phone_number: parsedData.mobile,
            public_key: "FLWPUBK_TEST-5760e3ff9888aa1ab5e5cd1ec3f99cb1-X",
            callback: (data) => {
                if (data.status === 'successful') {
                    if (page === "Upgrade") {
                        localStorage.setItem("PaymentDone", "PaymentDoneUpgrade");
                        setTransactionId(data.transaction_id);
                    } else if (page === "Wallet") {
                        localStorage.setItem("PaymentDone", "PaymentDoneWallet");
                    } else {
                        localStorage.setItem("PaymentDone", "PaymentDoneCoin");
                    }
                    navigate(0); // Reload the page
                    sessionStorage.setItem("Payment", "Wallet Update successfully!");
                } else {
                    if (page === "Upgrade") {
                        setPlanId("PaymentNotDone");
                    } else if (page === "Wallet") {
                        setPayClose("PaymentNotDone");
                    } else {
                        setBuyCoin("PaymentNotDone");
                    }
                    sessionStorage.setItem("Payment", "Payment Failed.!!");
                }
            },
            onClose: () => {
                sessionStorage.setItem("Payment", "Payment Failed.!!");
            },
            customer: {
                email: parsedData.email,
                phone_number: parsedData.mobile,
            },
        };

        if (window.FlutterwaveCheckout) {
            window.FlutterwaveCheckout(paymentOptions);
        } else {
            console.error('FlutterwaveCheckout function is not available.');
        }
    };

    useEffect(() => {
        if (isScriptLoaded && Amount) {
            handlePayment();
        }
    }, [isScriptLoaded, Amount]);

    return null;
};

export default FlutterWave;
