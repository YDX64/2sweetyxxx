/* jshint esversion: 6 */
/* jshint ignore:start */

import React, { useEffect } from 'react';
const Checkout = ({ Amount }) => {
  const handlePayment = () => {
    const form = document.createElement('form');
    form.action = 'https://www.2checkout.com/checkout/purchase';
    form.method = 'POST';

    const sellerIdInput = document.createElement('input');
    sellerIdInput.type = 'hidden';
    sellerIdInput.name = 'sellerId';
    sellerIdInput.value = '250507228545';

    const totalAmountInput = document.createElement('input');
    totalAmountInput.type = 'hidden';
    totalAmountInput.name = 'totalAmount';
    totalAmountInput.value = Amount;

    const currencyInput = document.createElement('input');
    currencyInput.type = 'hidden';
    currencyInput.name = 'currency';
    currencyInput.value = 'USD'; // Currency

    const successURLInput = document.createElement('input');
    successURLInput.type = 'hidden';
    successURLInput.name = 'successURL';
    successURLInput.value = '/payment-success';

    const cancelURLInput = document.createElement('input');
    cancelURLInput.type = 'hidden';
    cancelURLInput.name = 'cancelURL';
    cancelURLInput.value = '/payment-cancel';


    form.appendChild(sellerIdInput);
    form.appendChild(totalAmountInput);
    form.appendChild(currencyInput);
    form.appendChild(successURLInput);
    form.appendChild(cancelURLInput);

    document.body.appendChild(form);

    // Submit the form, which will redirect the user to 2Checkout's hosted page
    form.submit();
  };

  useEffect(() => {
    handlePayment();
  }, []);

  return (
    <div>
      <h1>Pay with 2Checkout</h1>
      <button onClick={handlePayment}>
        Pay Now
      </button>
    </div>
  );
}

export default Checkout
/* jshint ignore:end */
