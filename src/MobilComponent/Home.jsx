/* jshint esversion: 6 */
/* jshint ignore:start */
import React from 'react';
import "../css/bootstrap.min.css";
import "../css/style.css";
import "../css/responsive.css";
import GoMeet from "../images/logos/logo.png";
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <section className="slideshow h-[100vh] flex flex-col justify-between">
                <div className="container flex flex-col justify-between h-full">
                    <div className="flex justify-center items-start mt-4 z-[999]">
                        <div className="flex justify-center">
                            <img className="w-[50%]" src={GoMeet} alt="logo" />
                        </div>
                    </div>

                    <div className="social-btn-list gap-4 py-4 mt-auto mx-auto z-[999]">
                        <a href="#" className="btn-social btn-gl justify-center text-center">
                            Let's dive into your account!
                        </a>
                        <Link to='/register' className="bg-[rgba(152,14,255,255)] max-w-[430px]:w-[250px] TITLE py-[0.7rem] px-[1.1rem] rounded-[0.6rem] text-white no-underline btn-social">
                            Continue with Email/Phone Number
                        </Link>
                        <Link to='/login' className="btn-social btn-fb justify-center text-center">
                            I have an account? <span className='font-[500] ms-[5px]'>Login</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
/* jshint ignore:end */
