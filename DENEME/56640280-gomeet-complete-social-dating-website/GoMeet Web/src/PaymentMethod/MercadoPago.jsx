import axios from 'axios';
import { useContext, useEffect } from 'react';
import { MyContext } from '../Context/MyProvider';
const MercadoPago = ({ Amount }) => {

  const { paymentBaseURL } = useContext(MyContext);

  const handlePayment = async () => {
    await axios.post(`${paymentBaseURL}react_mercadopago/index.php`,
      {
        "amt": Amount
      }
    )
      .then((res) => {
        if (res.data.Result === "true") {
          window.location.href = res.data.payment_url;
        }
      });
  };

  useEffect(() => {
    if (!Amount) return;
    handlePayment();
  }, [Amount]);

  return null;
}

export default MercadoPago