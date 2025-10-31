/* jshint esversion: 6 */
/* jshint esversion: 8 */
/* jshint esversion: 9 */
/* jshint ignore:start */
import React, { useContext, useEffect, useState } from "react";
import ArrowUp from "../Icon/arrow-up.svg";
import ArrowDown from "../Icon/arrow-down.svg";
import { FaStar } from "react-icons/fa";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { toast } from "react-toastify";
import CloseIcon from "../Icon/times.svg";
import { GoChevronDown } from "react-icons/go";
import { Link } from "react-router-dom";
import { MyContext } from "../Context/MyProvider";
import axios from "axios";
import Payment from "../PaymentMethod/Payment";
import { useTranslation } from "react-i18next";
import { showTost } from "../showTost";
import CoinInfo from "../images/icons/buy-coin-point.png";
import PackageIcon from "../images/icons/buycoin-package.png";
const BuyCoin = () => {

  const { t } = useTranslation();

  const { basUrl, toggleButton, setToggleButton, setPageName, buyCoin, walletCoin, setBuyCoin, currency, setWalletCoin, setAmount } = useContext(MyContext);

  const [select, setSelect] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [input, setInput] = useState();
  const [coin, setCoin] = useState();
  const [selectType, setSelectType] = useState('');
  const [upi, setUpi] = useState();
  const [accountNumber, setAccountnumber] = useState();
  const [bankName, setBankName] = useState();
  const [accountName, setAccountName] = useState();
  const [ifsc, setIfsc] = useState();
  const [email, setEmail] = useState();
  const [index, setIndex] = useState();
  const [coiPackage, setCoinPackage] = useState([]);
  const [youCoin, setYouCoin] = useState();
  const [withdrawalLength, setWithdrawaLength] = useState();

  useEffect(() => {
    setCoin((parseInt(input) * 0.02).toFixed(2));
  }, [input]);

  const TopUpHandler = (e) => {
    if (select) {
      setToggleButton(true);
      setPageName("BuyCoin");
      localStorage.setItem("PackageId", select);
    } else {
      showTost({ title: "Please Select Coin Package" });
    }
  };

  const toggleBottomSheet = (e) => {
    if (e === "Withdraw") {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  };

  const SelectHandler = (el) => {
    setSelectType(el);
    setIsVisible2(!isVisible2);
  };

  const ProceedHandler = () => {
    if (input) {
      if (input < withdrawalLength) {
        showTost({ title: `Minimum ${withdrawalLength} coins a withdrawal !!` });
        return;
      }

      if (selectType) {
        if (selectType === "UPI") {
          if (upi) {
            withdrawHandler();
          } else {
            setIndex(2);
          }
        } else if (selectType === "BANK Transfer") {
          if (accountNumber && bankName && accountName && ifsc) {
            withdrawHandler();
          } else {
            setIndex(3);
          }
        } else if (selectType === "Paypal") {
          if (email) {
            withdrawHandler();
          } else {
            setIndex(4);
          }
        }
      } else {
        showTost({ title: "Please Select Type" });
      }
    } else {
      setIndex(1);
    }
  };

  const withdrawHandler = () => {
    const localData = localStorage.getItem("Register_User");

    if (localData) {
      const userData = JSON.parse(localData);
      axios.post(`${basUrl}request_withdraw.php`,
        {
          uid: userData.id,
          coin: input,
          r_type: selectType,
          acc_number: accountNumber ? accountNumber : "",
          bank_name: bankName ? bankName : "",
          ifsc_code: ifsc ? ifsc : "",
          acc_name: accountName ? accountName : "",
          upi_id: upi ? upi : "",
          paypal_id: email ? email : "",
          coin_amt: coin
        })
        .then((res) => {
          if (res.data.Result === "true") {
            CoinHandler();
            FildClearHandler();
            showTost({ title: res.data.ResponseMsg });
          } else {
            showTost({ title: "Plaese Enter Minimum Coin !!" });
          }
        });
    }
  };

  const FildClearHandler = () => {
    toggleBottomSheet('Withdraw');
    setSelectType('');
    setInput('');
    setCoin('');
    setUpi('');
    setAccountnumber('');
    setBankName('');
    setAccountName('');
    setIfsc('');
    setEmail('');
  };

  const CoinHandler = () => {
    const localData = localStorage.getItem("Register_User");

    if (localData) {
      const userData = JSON.parse(localData);
      axios.post(`${basUrl}coin_report.php`, { uid: userData.id })
        .then((res) => {
          setYouCoin(res.data.coin);
          setWithdrawaLength(res.data.coin_limit);
        });
    }
  };

  useEffect(() => {
    axios.post(`${basUrl}list_package.php`)
      .then((res) => {
        setCoinPackage(res.data.packlist);
      });

    const done = localStorage.getItem("PaymentDone");
    if (done === "PaymentDoneCoin") {
      PackageHandler();
      localStorage.setItem("PaymentDone", "");
    }

    CoinHandler();

  }, []);

  const PackageHandler = () => {

    const localData = localStorage.getItem("Register_User");
    const PackgeId = localStorage.getItem("PackageId");

    if (localData) {
      const userData = JSON.parse(localData);
      axios
        .post(`${basUrl}package_purchase.php`, {
          uid: userData.id,
          package_id: PackgeId ? PackgeId : select,
          wall_amt: walletCoin ? walletCoin : "0",
        })
        .then((res) => {
          if (res.data.Result === "true") {
            toast(`💞 ${res.data.ResponseMsg}`, {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              progress: undefined,
              theme: "dark",
              className: "toast-Style",
            });
            CoinHandler();
            setSelect("");
            setWalletCoin("");
            setAmount("");
            setBuyCoin('');
            setToggleButton(false);
            localStorage.setItem("PaymentDone", "");
            localStorage.setItem("PackageId", "");
          }
        });
    }
  };

  useEffect(() => {
    if (!buyCoin) return;

    if (buyCoin === "PaymentDone") {
      PackageHandler();
    } else {
      showTost({ title: "Payment Failed..!!" });
      setSelect("");
      setToggleButton(false);
      setBuyCoin('');
    }
  }, [buyCoin]);

  const InputHandler = (e) => {
    const value = e.target.value;
    setInput(value);
    if (Number(value) > youCoin) {
      setInput("");
      showTost({ title: "Please Enter Your Currect Coin!" });
    }
  };

  return (
    <div className="bg-[#e5e5e5] main-wrapper">
      <div className="content-body">
        <div className="container-fluid pt-[20px] max-_1200_:pb-[20px] px-sm-4 px-3">
          <div className="row">
            <div className="col-xl-12">
              <div className="card card-rounded mb-4">
                <div className="card-body card-py-1 flex justify-between items-center">
                  <div className="person-header">
                    <div className="fw-medium fs-15">{t('Your Coin')}</div>
                    <h2 className="m-0 text-[30px] flex items-center gap-[5px]">
                      {youCoin ? youCoin : "0"}
                      <img src={PackageIcon} style={{ width: "25px" }} alt="" />
                    </h2>
                  </div>
                  <Link to='/history' className="border-[2px] border-[rgba(152,14,255,255)] text-[rgba(152,14,255,255)] rounded-[10px] px-[15px] py-[8px]">
                    <h6 className="m-0">{t('History')}</h6>
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-xl-12">
              <div className="card card-rounded mb-4 max-_430_:py-[20px]">
                <div className="card-body card-py-1">
                  <h6>{t('Select Coin Package')}</h6>
                  <div className="mt-[20px] flex justify-center gap-[45px] max-_768_:gap-[15px] max-_768_:justify-evenly scroll-container2 py-[10px]">
                    {
                      coiPackage.map((item, index) => {
                        return <button key={index}
                          onClick={() => setSelect(item.id)}
                          className={` ${select === item.id
                            ? "border-[rgba(152,14,255,255)]"
                            : "border-gray-300"
                            } relative rounded-[15px] px-[25px] py-[20px] border-[2px]`}
                        >
                          <IoIosCheckmarkCircle
                            style={{
                              display: select === item.id ? "block" : "none",
                            }}
                            className="absolute w-[25px] h-[25px] text-[rgba(152,14,255,255)] -right-[8px] -top-[8px] z-[333] bg-white rounded-full"
                          />
                          <h2 className="m-0 text-[18px] flex items-center justify-center gap-[5px]">
                            {" "}
                            <img src={PackageIcon} style={{ width: "20px" }} alt="" />
                            {item.coin}
                          </h2>
                          <h6 className="mb-0 mt-[10px]">{currency ? currency : "$"}{item.amt}</h6>
                        </button>
                      })
                    }
                  </div>
                  <div className="flex flex-wrap justify-center gap-[40px] max-_430_:gap-[15px] mt-[20px]">
                    <button
                      onClick={TopUpHandler}
                      className="flex items-center gap-[10px] bg-[#980EFF] text-white rounded-full ps-[8px] pe-[15px] py-[5px]"
                    >
                      <img
                        src={ArrowUp}
                        alt=""
                        className="bg-white rounded-full p-[7px] w-[30px] h-[30px]"
                      />
                      <h6 className="mt-[8px]">{t('Top-up')}</h6>
                    </button>
                    <button
                      onClick={toggleBottomSheet}
                      className="flex items-center gap-[10px] bg-[#980EFF] text-white rounded-full ps-[8px] pe-[15px] py-[5px]"
                    >
                      <img
                        src={ArrowDown}
                        alt=""
                        className="bg-white rounded-full p-[7px] w-[30px] h-[30px]"
                      />
                      <h6 className="mt-[8px]">{t('Withdraw')}</h6>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-12">
              <div className="card card-rounded-1">
                <div className="card-body">
                  <h5 className="font-[600]">{t('Coin Buying & Info')}</h5>
                  <div className="mt-[20px]">
                    <div className="flex items-center gap-[15px]">
                      <img src={CoinInfo} style={{ width: "20px" }} alt="" />
                      <h2 className="m-0 text-[18px] max-_430_:text-[16px] font-[400] text-gray-500 flex items-center gap-[5px]">
                        {t('Coin can be used for sending gifts only...')}
                      </h2>
                    </div>
                    <div className="flex items-center gap-[15px] mt-[15px]">
                      <img src={CoinInfo} style={{ width: "20px" }} alt="" />
                      <h2 className="m-0 text-[18px] max-_430_:text-[16px] font-[400] text-gray-500 flex items-center gap-[5px]">
                        {t("Coins don't have any expiry date...")}
                      </h2>
                    </div>
                    <div className="flex items-center gap-[15px] mt-[15px]">
                      <img src={CoinInfo} style={{ width: "20px" }} alt="" />
                      <h2 className="m-0 text-[18px] max-_430_:text-[16px] font-[400] text-gray-500 flex items-center gap-[5px]">
                        {t('Coins can be used with all payment modes...')}
                      </h2>
                    </div>
                    <div className="flex items-center gap-[15px] mt-[15px]">
                      <img src={CoinInfo} style={{ width: "20px" }} alt="" />
                      <h2 className="m-0 text-[18px] max-_430_:text-[16px] font-[400] text-gray-500 flex items-center gap-[5px]">
                        {t('Coins are credited to your Coin balance only...')}
                      </h2>
                    </div>
                    <div className="flex items-center gap-[15px] mt-[15px]">
                      <img src={CoinInfo} style={{ width: "20px" }} alt="" />
                      <h2 className="m-0 text-[18px] max-_430_:text-[16px] font-[400] text-gray-500 flex items-center gap-[5px]">
                        {t('Coins can be withdrawn with the described method only...')}
                      </h2>
                    </div>
                    <div className="flex items-center gap-[15px] mt-[15px]">
                      <img src={CoinInfo} style={{ width: "20px" }} alt="" />
                      <h2 className="m-0 text-[18px] max-_430_:text-[16px] font-[400] text-gray-500 flex items-center gap-[5px]">
                        {t("Coins cannot be transferred to any users...")}
                      </h2>
                    </div>
                    <div className="flex items-center gap-[15px] mt-[15px]">
                      <img src={CoinInfo} style={{ width: "20px" }} alt="" />
                      <h2 className="m-0 text-[18px] max-_430_:text-[16px] font-[400] text-gray-500 flex items-center gap-[5px]">
                        {t(`You need a minimum of ${withdrawalLength} coins to make a withdrawal...`)}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isVisible && (
        <div onClick={() => toggleBottomSheet('Withdraw')} className="bottom-sheet2 z-[9999] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50">
          <div onClick={(e) => e.stopPropagation()} className="bottom-sheet-content2 relative">
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-[20px] flex items-center gap-[5px]">
                <FaStar className="bg-[rgba(152,14,255,255)] w-[30px] h-[30px] text-white rounded-full p-[5px]" />{" "}
                1 coin = {currency ? currency : "$"}0.02
              </h2>
              <button onClick={FildClearHandler}>
                <img src={CloseIcon} alt="" />
              </button>
            </div>
            <div className="mt-[20px]">
              <input
                value={input}
                onChange={(e) => InputHandler(e)}
                type="number"
                className={`border-[2px] w-[100%] ${index === 1 ? input ? "outline-[rgba(152,14,255,255)]" : "border-red-500 outline-none" : "border-gray-300 outline-[rgba(152,14,255,255)]"}  rounded-[10px] px-[15px] py-[8px]`}
                placeholder={t("Number Of Coin")}
              />
              {index === 1 && !input && <span className="font-[400] text-red-500">{t('Please Enter Amount')}</span>}
              <br />
              {input && <span className="text-[16px] pt-[5px]">{currency ? currency : "$"}{coin}</span>}
            </div>
            <div className="">
              <h6 className="text-[16px] mt-[10px]">{t('Select Type')}</h6>
              <button
                onClick={() => setIsVisible2(!isVisible2)}
                className="w-[100%] flex justify-between items-center border-[2px] border-gray-300 rounded-[10px] px-[15px] py-[8px]"
              >
                <span>{selectType ? t(selectType) : t("Select Type")}</span>
                <GoChevronDown />
              </button>
            </div>

            {selectType === "UPI" ? (
              <div className="">
                <h6 className="text-[16px] mt-[10px]">{t('UPI')}</h6>
                <input
                  type="text"
                  onChange={(e) => setUpi(e.target.value)}
                  className={`border-[2px] w-[100%] ${index === 2 ? upi ? "outline-[rgba(152,14,255,255)]" : "border-red-500 outline-none" : "border-gray-300 outline-[rgba(152,14,255,255)]"}  rounded-[10px] px-[15px] py-[8px]`}
                  placeholder={t("UPI")}
                />
                {index === 2 && !upi && <span className="font-[400] text-red-500">{t('Please Enter UPI')}</span>}
              </div>
            ) : selectType === "BANK Transfer" ? (

              <div className="">
                <div className="">
                  <h6 className="text-[16px] mt-[10px]">{t('Account Number')}</h6>
                  <input
                    type="text"
                    className={`border-[2px] w-[100%] ${index === 3 ? accountNumber ? "outline-[rgba(152,14,255,255)]" : "border-red-500 outline-none" : "border-gray-300 outline-[rgba(152,14,255,255)]"}  rounded-[10px] px-[15px] py-[8px]`}
                    placeholder={t("Account Number")}
                    onChange={(e) => setAccountnumber(e.target.value)}
                  />
                  {index === 3 && !accountNumber && <span className="font-[400] text-red-500">{t('Please Enter Account Number')}</span>}
                </div>

                <div className="">
                  <h6 className="text-[16px] mt-[10px]">{t('Bank Name')}</h6>
                  <input
                    type="text"
                    className={`border-[2px] w-[100%] ${index === 3 ? bankName ? "outline-[rgba(152,14,255,255)]" : "border-red-500 outline-none" : "border-gray-300 outline-[rgba(152,14,255,255)]"}  rounded-[10px] px-[15px] py-[8px]`}
                    placeholder={t("Bank Name")}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                  {index === 3 && !bankName && <span className="font-[400] text-red-500">{t('Please Enter Bank Name')}</span>}
                </div>
                <div className="">
                  <h6 className="text-[16px] mt-[10px]">{t('Account Holder Name')}</h6>
                  <input
                    type="text"
                    className={`border-[2px] w-[100%] ${index === 3 ? accountName ? "outline-[rgba(152,14,255,255)]" : "border-red-500 outline-none" : "border-gray-300 outline-[rgba(152,14,255,255)]"}  rounded-[10px] px-[15px] py-[8px]`}
                    placeholder={t("Account Holder Name")}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                  {index === 3 && !accountName && <span className="font-[400] text-red-500">{t('Please Enter Account Holder Name')}</span>}
                </div>
                <div className="">
                  <h6 className="text-[16px] mt-[10px]">{t('IFSC Code')}</h6>
                  <input
                    type="text"
                    className={`border-[2px] w-[100%] ${index === 3 ? ifsc ? "outline-[rgba(152,14,255,255)]" : "border-red-500 outline-none" : "border-gray-300 outline-[rgba(152,14,255,255)]"}  rounded-[10px] px-[15px] py-[8px]`}
                    placeholder={t("IFSC Code")}
                    onChange={(e) => setIfsc(e.target.value)}
                  />
                  {index === 3 && !ifsc && <span className="font-[400] text-red-500">{t('Please Enter IFSC Code')}</span>}
                </div>
              </div>
            ) : selectType === "Paypal" ? (
              <div className="">
                <h6 className="text-[16px] mt-[10px]">{t("Email ID")}</h6>
                <input
                  type="text"
                  className={`border-[2px] w-[100%] ${index === 4 ? email ? "outline-[rgba(152,14,255,255)]" : "border-red-500 outline-none" : "border-gray-300 outline-[rgba(152,14,255,255)]"}  rounded-[10px] px-[15px] py-[8px]`}
                  placeholder={t("Email ID")}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {index === 4 && !email && <span className="font-[400] text-red-500">{t('Please Email ID')}</span>}
              </div>
            ) : (
              ""
            )}

            <div className="mt-[20px] justify-center flex gap-[30px]">
              <button onClick={FildClearHandler} className="py-[10px] px-[25px] font-[500]">{t('Cancel')}</button>
              <button onClick={ProceedHandler} className="bg-[rgb(152,14,255)] text-white py-[10px] px-[25px] rounded-full">
                {t("Proceed")}
              </button>
            </div>

            {isVisible2 && (
              <div
                onClick={() => setIsVisible2(!isVisible2)}
                className="h-[100%] w-[100%]  absolute top-0 left-0"
              >
                <div className="w-[90%] border-[2px] font-[500] bg-white border-gray-300 rounded-[10px] px-[15px] py-[8px] absolute top-[80px] left-[20px]">
                  <h6
                    onClick={() => SelectHandler("UPI")}
                    className="cursor-pointer py-[2px]"
                  >
                    {t('UPI')}
                  </h6>
                  <h6
                    onClick={() => SelectHandler("BANK Transfer")}
                    className="cursor-pointer py-[2px]"
                  >
                    {t('BANK Transfer')}
                  </h6>
                  <h6
                    onClick={() => SelectHandler("Paypal")}
                    className="cursor-pointer py-[2px]"
                  >
                    {t('Paypal')}
                  </h6>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      

      {coiPackage.length === 0 && (
        <div className="w-[100%] h-[100vh] ms-[8rem] max-_991_:ms-0 bg-white fixed flex items-center justify-center top-0 left-0 right-0 bottom-0 z-[555]">
          <div className="">
            <h2 className="">{t('Loading...')}</h2>
          </div>
        </div>
      )}
    </div>
  );
};
export default BuyCoin;
/* jshint ignore:end */
