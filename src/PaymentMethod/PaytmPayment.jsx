/* jshint esversion: 6 */
import axios from 'axios';
import { useContext, useEffect, useState, useCallback } from 'react';
import { MyContext } from '../Context/MyProvider';
import { useNavigate } from 'react-router-dom';

const PaytmPayment = ({ Amount }) => {

  const { setPayClose, setPlanId, setTransactionId, page, setBuyCoin, paymentBaseURL, setButton } = useContext(MyContext);

  const [paymentData, setPaymentData] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const Data = localStorage.getItem("Register_User");
    if (!Amount && !Data) return;
    const Userid = JSON.parse(Data);
    axios.post(`${paymentBaseURL}react_paytm/index.php`, {
        "amt": Amount,
        "uid": Userid.id
      })
      .then((res) => {
        if (res.data.Result === "true") {
          setPaymentData(res.data);
        }
      });
  }, [Amount, paymentBaseURL]);  

  const makePayment = useCallback(() => {
    if (!paymentData) return;

    var config = {
      "root": "",
      "style": {
        "bodyBackgroundColor": "#fafafb",
        "themeBackgroundColor": "#0FB8C9",
        "themeColor": "#ffffff",
        "headerBackgroundColor": "#284055",
        "headerColor": "#ffffff",
      },
      "data": {
        "orderId": paymentData.order_id,
        "token": paymentData.txnToken,
        "tokenType": "TXN_TOKEN",
        "amount": paymentData.amount
      },
      "payMode": {
        "order": ["CC", "DC", "NB", "UPI", "PPBL", "PPI", "BALANCE"]
      },
      "website": "WEBSTAGING",
      "flow": "DEFAULT",
      "merchant": {
        "mid": paymentData.mid,
        "redirect": false
      },
      "handler": {
        "transactionStatus": function (paymentStatus) {
          if (page === "Upgrade") {
            setPlanId("PaymentDone");
            navigate("/upgrade");
            setTransactionId(paymentStatus.BANKTXNID);
          } else if (page === "Wallet") {
            setPayClose("PaymentDone");
            navigate("/wallet");
            setButton(false);
          } else {
            setBuyCoin("PaymentDone");
            navigate("/buyCoin");
          }
          setPaymentData();
        },
        "notifyMerchant": function (eventName, data) {
          
        }
      }
    };

    if (window.Paytm && window.Paytm.CheckoutJS) {
      window.Paytm.CheckoutJS.init(config)
        .then(function onSuccess() {
          window.Paytm.CheckoutJS.invoke();
        });
    }
  }, [paymentData, setBuyCoin, setPayClose, setPlanId, setTransactionId, page, navigate, setButton]); 

  useEffect(() => {
    if (paymentData) {
      makePayment();
    }
  }, [paymentData, makePayment]);

  return null;
};

export default PaytmPayment;
