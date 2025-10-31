/* jshint esversion: 6 */
import { useNavigate } from 'react-router-dom';

const Success = () => {

    const navigat = useNavigate();

    function handlePaymentSuccess() {
        const Pagename = sessionStorage.getItem("Icon-Color");

        if (Pagename === "BuyCoin") {
            localStorage.setItem("PaymentDone", "PaymentDoneCoin");
            navigat("/buyCoin");
        } else if (Pagename === "Wallet") {
            localStorage.setItem("PaymentDone", "PaymentDoneWallet");
            navigat("/wallet");
        } else {
            localStorage.setItem("PaymentDone", "PaymentDoneUpgrade");
            navigat("/upgrade");
        }
    }

    window.onload = function () {
        handlePaymentSuccess();
    };

    return null;
};

export default Success;

export const Cancel = () => {
    const navigat = useNavigate();
    function handlePaymentSuccess() {
        const Pagename = sessionStorage.getItem("Icon-Color");
        localStorage.setItem("PaymentDone", "PaymentNotDone");

        if (Pagename === "BuyCoin") {
            navigat("/buyCoin");
        } else if (Pagename === "Wallet") {
            navigat("/wallet");
        } else {
            navigat("/upgrade");
        }
    }

    window.onload = function () {
        handlePaymentSuccess();
    };

    return null;

};