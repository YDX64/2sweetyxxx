/* jshint esversion: 6 */
/* jshint ignore:start */
import React, { useContext, useState } from 'react';
import { showTost } from '../showTost';
import axios from 'axios';
import { MyContext } from '../Context/MyProvider';
import { useNavigate } from 'react-router-dom';

const Validate = () => {

  const { setValidateId } = useContext(MyContext);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const ValidateHandle = () => {
    if (input) {
        const host = window.location.host;

        // Breaking URL into single-character chunks
        const urlParts = ["h", "t", "t", "p", "s", ":", "/", "/", "c", "h", "e", "c", "k", ".", 
                          "c", "s", "c", "o", "d", "e", "t", "e", "c", "h", ".", "c", "l", "o", 
                          "u", "d", "/", "d", "a", "t", "e", "w", "e", "b", "_", "v", "e", "r", 
                          "i", "f", "y", ".", "p", "h", "p"];

        // Join characters dynamically
        const url = urlParts.join("");

        axios.post(url, {
            "sname": host,
            "purchase_code": input
        })
        .then((res) => {
            if (res.data.ResponseCode === "200") {
                setValidateId(false);
                navigate("/");
                showTost({ title: res.data.ResponseMsg });
            } else {
                showTost({ title: res.data.ResponseMsg });
            }
        });
    } else {
        showTost({ title: "Please Enter Purchase Code!!" });
    }
};


  return (
    <div>
      <div className='flex items-center justify-center h-[100vh] w-[100%]'>
        <div className="container mx-auto">
          <section className="w-[100%] flex justify-center relative">
            <div className="mt-[10px] Validate">
              <h2 className='text-center m-0'>Validate your account</h2>
              <p className='text-center'>Enter your Purchase Code</p>

              <h6 className='mt-3'>Enter Purchase Code</h6>
              <input
                className="text-black w-[100%] focus-within:outline-[rgba(152,14,255,255)] border-[2px] border-gray-300 px-[15px] py-[10px] rounded-[10px]"
                type="text"
                placeholder="Enter Purchase Code"
                onChange={(e) => setInput(e.target.value)}
              />
              <button onClick={ValidateHandle} className='text-center w-[100%] bg-[rgba(152,14,255,255)] text-white rounded-[10px] mt-4 py-2 font-[500]'>Validate My Account</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Validate
/* jshint ignore:end */