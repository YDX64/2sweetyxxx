import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../Context/MyProvider";
const PaymentRespons = () => {
    const {setTransactionId } = useContext(MyContext);
    const navigate = useNavigate();

    const location = window.location.href;
    const url = new URL(location);

    const statusCode = url.searchParams.get('status_code');
    const OrderId = url.searchParams.get('order_id');
    const TransId = url.searchParams.get('transaction_id');
    const statusCode2 = url.searchParams.get('status');
    const page = sessionStorage.getItem("Icon-Color");


    if (statusCode === "200" || statusCode2 === "Completed") {
        switch (page) {
            case "Upgrade":
                localStorage.setItem("PaymentDone", "PaymentDoneUpgrade");
                setTransactionId(OrderId || TransId);
                navigate("/upgrade");
                break;
            case "Wallet":
                localStorage.setItem("PaymentDone", "PaymentDoneWallet");
                navigate("/wallet");
                break;
            case "BuyCoin":
                localStorage.setItem("PaymentDone", "PaymentDoneCoin");
                navigate("/buyCoin");
                break;
            default:
                break;
        }
        return;
    }

    return null;
};

export default PaymentRespons;
