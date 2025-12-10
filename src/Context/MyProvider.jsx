/* jshint esversion: 6 */
/* jshint ignore:start */

import React, { createContext, useState } from 'react';

const MyContext = createContext();

const MyProvider = ({ children }) => {

    const basUrl = process.env.REACT_APP_API_BASE_URL || "https://api.2sweety.com/api/";

    const imageBaseURL = process.env.REACT_APP_IMAGE_BASE_URL || "https://api.2sweety.com/";

    const paymentBaseURL = process.env.REACT_APP_PAYMENT_BASE_URL || "https://api.2sweety.com/";

    const [updateId, setUpdateId] = useState(0);

    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [bio, setBio] = useState();
    const [number, setNumber] = useState();
    const [ccode, setCcode] = useState();
    const [birthdate, setBirthDate] = useState();
    const [gender, setGender] = useState();
    const [goal, setGoal] = useState();
    const [nearby, setNearby] = useState();
    const [hobbies, setHobbies] = useState();
    const [languages, setLanguages] = useState();
    const [religion, setReligion] = useState();
    const [preference, setPreference] = useState();
    const [latitude, setLatitude] = useState();
    const [longitude, setLongitude] = useState();
    const [uid, setUid] = useState();
    const [profileId, setProfileId] = useState();
    const [registerUid, setRegisterUid] = useState('');
    const [payClose, setPayClose] = useState();
    const [planId, setPlanId] = useState();
    const [transactionId, setTransactionId] = useState();
    const [toggleButton, setToggleButton] = useState(false);
    const [page, setPageName] = useState();
    const [amount, setAmount] = useState();
    const [buyCoin, setBuyCoin] = useState();
    const [purchaseId, setPurchaseId] = useState();
    const [walletCoin, setWalletCoin] = useState();
    const [demo, setDemo] = useState();
    const [error, setError] = useState();
    const [blockId, setBlockId] = useState();
    const [details, setDetails] = useState();
    const [chatId, setChatId] = useState("");
    const [chatUserName, setChatUserName] = useState();
    const [currency, setCurrency] = useState();
    const [isVoiceCalling, setIsVoiceCalling] = useState(false);
    const [isVideoCalling, setIsVideoCalling] = useState(false);
    const [callStatus, setCallstatus] = useState(false);
    const [atendCall, setAtendCall] = useState(false);
    const [toastMsg, setToastMsg] = useState();
    const [toastShow, setToastShow] = useState(false);
    const [agoraAppId, setAgoraAppId] = useState();
    const [onesignalAppId, setOnesignalAppId] = useState();
    const [onesignalKey, setOnesignalKey] = useState();
    const [color, setColor] = useState("");
    const [button, setButton] = useState(true);

    const Value = {
        name, setName,
        email, setEmail,
        password, setPassword,
        bio, setBio,
        number, setNumber,
        ccode, setCcode,
        birthdate, setBirthDate,
        gender, setGender,
        goal, setGoal,
        nearby, setNearby,
        hobbies, setHobbies,
        languages, setLanguages,
        religion, setReligion,
        preference, setPreference,
        latitude, setLatitude,
        longitude, setLongitude,
        uid, setUid,
        profileId, setProfileId,
        registerUid, setRegisterUid,
        updateId, setUpdateId,
        payClose, setPayClose,
        planId, setPlanId,
        transactionId, setTransactionId,
        toggleButton, setToggleButton,
        page, setPageName,
        amount, setAmount,
        buyCoin, setBuyCoin,
        purchaseId, setPurchaseId,
        walletCoin, setWalletCoin,
        demo, setDemo,
        details, setDetails,
        blockId, setBlockId,
        error, setError,
        chatId, setChatId,
        chatUserName, setChatUserName,
        currency, setCurrency,
        isVoiceCalling, setIsVoiceCalling,
        isVideoCalling, setIsVideoCalling,
        callStatus, setCallstatus,
        atendCall, setAtendCall,
        toastMsg, setToastMsg,
        toastShow, setToastShow,
        agoraAppId, setAgoraAppId,
        onesignalAppId, setOnesignalAppId,
        onesignalKey, setOnesignalKey,
        button, setButton,
        color, setColor,
        basUrl, imageBaseURL, paymentBaseURL,
    };

    return (
        <MyContext.Provider value={Value}>
            {children}
        </MyContext.Provider>
    );
};

export { MyContext, MyProvider };
/* jshint ignore:end */
