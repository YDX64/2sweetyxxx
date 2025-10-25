/* jshint esversion: 6 */
/* jshint ignore:start */
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import Login from "./LoginComponent/Login";
import { ToastContainer } from "react-toastify";
import PhoneNum from "./MobilComponent/PhoneNum";
import Birthdate from "./MobilComponent/Birthdate";
import Gender from "./MobilComponent/Gender";
import Golas from "./MobilComponent/Goals";
import Nearby from "./MobilComponent/Nearby";
import Hobbies from "./MobilComponent/Hobbies";
import Languages from "./MobilComponent/Languages";
import Religion from "./MobilComponent/Religion";
import Gender2 from "./MobilComponent/Gender-2";
import Image from "./MobilComponent/Image";
import Home from "./MobilComponent/Home";
import Header from "./LoginComponent/Header";
import Detail from "./LoginComponent/Detail";
import Favorites from "./LoginComponent/Favorites";
import Profile from "./LoginComponent/Profile";
import Wallet from "./LoginComponent/Wallet";
import Upgrade from "./LoginComponent/Upgrade";
import BuyCoin from "./LoginComponent/BuyCoin";
import History from "./LoginComponent/History";
import BlockUser from "./LoginComponent/BlockUser";
import { MyProvider } from "./Context/MyProvider";
import NotFound from "./NotFound";
import Pages from "./LoginComponent/Pages";
import Razorpay from "./PaymentMethod/Razorpay";
import PayPal from "./PaymentMethod/PayPal";
import Payment from "./PaymentMethod/Payment";
import Payfast from "./PaymentMethod/Payfast";
import Success, { Cancel } from "./PaymentMethod/Success";
import i18n from "./Language";
import { TodoContext } from "./Context";
import UserChat from "./LoginComponent/UserChat";
import NotificationShow from "./LoginComponent/NotificationShow";
import Dashboard from "./LoginComponent/Dashboard";
import Register from "./MobilComponent/Register";
import Validate from "./MobilComponent/Validate";
import PaymentRespons from "./PaymentMethod/PaymentRespons";
const App = () => {

  const [demo, setDemo] = useState();
  const [Index, setindex] = useState();
  const isAuthenticated = localStorage.getItem("token");

  useEffect(() => {
    setindex(localStorage.getItem("UserId"));
  }, [demo]);

  return (
    <div>
      <MyProvider>
        <TodoContext.Provider value={{ demo, setDemo }}>
          <Router>
            {isAuthenticated && <Header />}
            <Routes>
              {isAuthenticated ? (
                <Route path="/" element={<Dashboard />} />
              ) :(
                <Route path="/" element={<Home />} />
              )}
              <Route path="/register" element={<Register />} />
              <Route path="/phonenumber" element={<PhoneNum />} />
              <Route path="/birthdate" element={<Birthdate />} />
              <Route path="/gender" element={<Gender />} />
              <Route path="/golas" element={<Golas />} />
              <Route path="/nearby" element={<Nearby />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/hobbies" element={<Hobbies />} />
              <Route path="/languages" element={<Languages />} />
              <Route path="/religion" element={<Religion />} />
              <Route path="/preference" element={<Gender2 />} />
              <Route path="/image" element={<Image />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/detail/:name" element={<Detail />} />
              <Route path="/explore" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/buyCoin" element={<BuyCoin />} />
              <Route path="/history" element={<History />} />
              <Route path="/blockUser" element={<BlockUser />} />
              <Route path="/page/:title" element={<Pages />} />
              <Route path="/razorpay" element={<Razorpay />} />
              <Route path="/paypal" element={<PayPal />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/payfast" element={<Payfast />} />
              <Route path="/done" element={<Success />} />
              <Route path="/cancel" element={<Cancel />} />
              <Route path="/chat" element={<UserChat />} />
              <Route path="/validate" element={<Validate />} />
              <Route path="/PaymentRespons" element={<PaymentRespons />} />
              <Route path="/notification" element={<NotificationShow />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TodoContext.Provider>
      </MyProvider>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default App; 
/* jshint ignore:end */
