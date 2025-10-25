/* jshint esversion: 6 */
/* jshint esversion: 11 */
import { useContext, useEffect, useState, useCallback } from 'react';
import { MyContext } from '../Context/MyProvider';

const Razorpay = ({ Amount }) => {
    const { setPayClose, setPlanId, setTransactionId, page, setBuyCoin } = useContext(MyContext);

    const [userData, setUserData] = useState();

    const openPayModal = useCallback(() => {
        const options = {
            key: "rzp_test_HJG5Rtuy8Xh2NB",
            amount: Amount * 100,
            name: "GoMeet",
            description: "some description",
            image: "https://cdn.razorpay.com/logos/7K3b6d18wHwKzL_medium.png",
            handler: (response) => {
                document.body.style.overflow = "auto";
                if (page === "Upgrade") {
                    setPlanId("PaymentDone");
                    setTransactionId(response.razorpay_payment_id);
                } else if (page === "Wallet") {
                    setPayClose("PaymentDone");
                } else {
                    setBuyCoin("PaymentDone");
                }
            },
            modal: {
                ondismiss: () => {
                    document.body.style.overflow = "auto";
                    if (page === "Upgrade") {
                        setPlanId("PaymentNotDone");
                    } else if (page === "Wallet") {
                        setPayClose("PaymentNotDone");
                    } else {
                        setBuyCoin("PaymentNotDone");
                    }
                }
            },
            prefill: {
                name: userData && userData?.name,
                contact: userData && userData?.mobile,
                email: userData && userData?.email,
            },
            notes: {
                address: "some address",
            },
            theme: {
                color: "#F37254",
                hide_topbar: false,
            },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
    }, [Amount, userData, setBuyCoin, setPayClose, setPlanId, setTransactionId, page]);

    useEffect(() => {
        const localData = localStorage.getItem("Register_User");
        if (!Amount || !localData) return;

        const parsedData = JSON.parse(localData);
        setUserData(parsedData);
    }, [Amount]);

    useEffect(() => {
        if (userData && Amount) {
            openPayModal();
        }
    }, [Amount, userData, openPayModal]);

    return null;
};

export default Razorpay;
