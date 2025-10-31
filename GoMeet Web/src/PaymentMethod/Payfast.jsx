/* jshint esversion: 6 */
import { useEffect } from 'react';
const Payfast = ({ Amount }) => {
    const handleCheckout = () => {
        const paymentData = {
            merchant_id: '10000100',
            merchant_key: '46f0cd694581a',
            amount: Amount,
            item_name: 'Test Item',
            return_url: window.location.origin + "/done",
            cancel_url: window.location.origin + '/cancel',
            notify_url: 'https://yournotificationurl.com',
        };

        const form = document.createElement('form');
        form.action = 'https://sandbox.payfast.co.za/eng/process';
        form.method = 'POST';

        Object.keys(paymentData).forEach(key => {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = paymentData[key];
            form.appendChild(hiddenField);
        });

        document.body.appendChild(form);
        form.submit();
    };


    useEffect(() => {
        if (Amount) {
            handleCheckout();
        }
    }, []);
    
    return null;
};

export default Payfast;
