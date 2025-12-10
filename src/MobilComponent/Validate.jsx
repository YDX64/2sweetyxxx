/* jshint esversion: 6 */
/* jshint ignore:start */
import React, { useContext, useEffect } from 'react';
import { showTost } from '../showTost';
import { MyContext } from '../Context/MyProvider';
import { useNavigate } from 'react-router-dom';

const Validate = () => {

const { setValidateId } = useContext(MyContext);
const navigate = useNavigate();

useEffect(() => {
    setValidateId(false);
    navigate("/");
    showTost({ title: "Verified successfully!" });
}, [setValidateId, navigate]);

return (
    <div>
      <div className='flex items-center justify-center h-[100vh] w-[100%]'>
        <div className="container mx-auto">
          <section className="w-[100%] flex justify-center relative">
            <div className="mt-[10px] Validate">
              <h2 className='text-center m-0'>Validate your account</h2>
              <p className='text-center'>Verifying...</p>
            </div>
          </section>
        </div>
      </div>
    </div>
);
}

export default Validate;
/* jshint ignore:end */