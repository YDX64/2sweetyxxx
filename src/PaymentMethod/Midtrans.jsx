/* jshint esversion: 6 */
/* jshint esversion: 8 */
import { useContext, useEffect } from 'react';
import axios from 'axios';
import { MyContext } from '../Context/MyProvider';
const PaymentComponent = ({ Amount }) => {

  const { paymentBaseURL } = useContext(MyContext)

  const handlePayment = async () => {
    const UserData = localStorage.getItem("Register_User");
    if (UserData) {
      const UserDetails = JSON.parse(UserData);
      await axios.post(`${paymentBaseURL}react_midtrans/index.php`,
        {
          "amt": Amount,
          "name": UserDetails.name,
          "email": UserDetails.email,
          "phone": UserDetails.mobile
        }
      )
        .then((res) => {
          if (res.data.Result === "true") {
            window.location.href = res.data.payment_url;
          }
        });
    }
  };

  useEffect(() => {
    if (!Amount) return;
    handlePayment();
  }, [Amount]);

  return null;
};

export default PaymentComponent;
