
/* jshint esversion: 6 */
import { useEffect, useCallback } from 'react';
import { uid } from 'uid';

const SenangPay = ({ Amount }) => {

    const handlePayment = useCallback((e) => {
        const payload = {
            merchant_id: '635160135332883',
            amount: Amount.toString(),
            payment_id: Date.now(),
            order_id: uid(),
            currency: 'EUR',
            email: 'test@gmail.com',
            phone: '9909909905',
            redirect_url: `${window.location.origin}`,
            return_url: `${window.location.origin}`,
            hash: generateHash('2909-249', Amount, 'EUR'),
        };

        const queryString = new URLSearchParams(payload).toString();
        window.location.href = `https://sandbox.senangpay.my/payment/635160135332883?${queryString}`;

    },[Amount]);

    const generateHash = (apiKey, amount, currency) => {
        return btoa(`${apiKey},${amount},${currency}`);
    };
    
    useEffect(() => {
        // Only call handlePayment when Amount is defined
        if (Amount) {
            handlePayment();
        }
    }, [Amount, handlePayment]);

    return null;
};

export default SenangPay;
