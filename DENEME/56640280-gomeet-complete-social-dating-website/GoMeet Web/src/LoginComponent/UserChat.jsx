/* jshint esversion: 6 */
/* jshint esversion: 8 */
/* jshint esversion: 9 */
/* jshint ignore:start */
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { db } from '../Users_Chats/Firebase';
import { onSnapshot, query, orderBy, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { MyContext } from '../Context/MyProvider';
import { IoCallOutline } from "react-icons/io5";
import { IoVideocamOutline } from "react-icons/io5";
import { TbDotsCircleHorizontal } from "react-icons/tb";
import { FaArrowLeft } from "react-icons/fa6";
import EmojiPicker from 'emoji-picker-react';
import { addDoc, doc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import HidePassword from "../Icon/eye-slash.svg";
import flag from "../Icon/flag-triangle.svg";
import plus from "../Icon/plus.svg";
import Bell from "../Icon/bell-slash.svg";
import BlockIcon from '../Icon/block.gif';
import Setting from "../Icon/settings.svg";
import { ReportComment } from './Detail';
import axios from 'axios';
import { HiDotsVertical } from "react-icons/hi";
import VoiceCall from "../User_Call/Voice_Call";
import VideoCall from "../User_Call/Video_call";
import Onesignal from '../User_Call/Onesignal';
import { useNavigate } from 'react-router-dom';
import { showTost } from '../showTost';
const UserChat = () => {
    const { t } = useTranslation();

    const { chatId, imageBaseURL, chatUserName, basUrl, setChatId, isVoiceCalling, setIsVoiceCalling, isVideoCalling, setIsVideoCalling, onesignalAppId, onesignalKey } = useContext(MyContext);

    const [message, setMessage] = useState('');
    const [allChat, setAllChat] = useState([]);
    const [data, setData] = useState([]);
    const [userName, setUserName] = useState();
    const [receiverId, setReceiverId] = useState();
    const [senderId, setSenderId] = useState();
    const [senderName, setSenderName] = useState();
    const [profilePic, setProfilePic] = useState();
    const [showPicker, setShowPicker] = useState(false);
    const [chatUserBlock, setChatUserBlock] = useState([]);
    const [options, setOption] = useState(false);
    const [report, setReport] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [dot, setDot] = useState("");
    const [comment, setComment] = useState();
    const [latitude, setLatitude] = useState();
    const [longitude, setLongitude] = useState();
    const [myPhoto, setMyphoto] = useState("");
    const [audio_video, setAudio_Video] = useState();
    const [myChatsUser, setMyChatsUser] = useState([]);
    const [callChannelName, setCallChannelName] = useState();
    const [lastMsg, setLastMsg] = useState();
    const [input, setInput] = useState();
    const [searchData, setSearchData] = useState([]);
    const [deviceCheck, setDeviceCheck] = useState();
    const [sortData, setSortData] = useState([]);

    const navigete = useNavigate();

    const chatBoxBodyRef = useRef(null);
    const Open = useRef();

    // Latitude and Longitude 
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = String(position.coords.latitude);
                const long = String(position.coords.longitude);
                setLatitude(lat);
                setLongitude(long);
                BlockListUserHandler(lat, long);
                fetchUserData();
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                }
            });
    }, [latitude, longitude]);

    // Home Api Call Handle
    const fetchUserData = async () => {
        const localData = localStorage.getItem("Register_User");

        if (localData) {

            const userData = JSON.parse(localData);
            try {
                const response = await axios.post(`${basUrl}home_data.php`, {
                    uid: userData.id,
                    lats: latitude, // 21.457840
                    longs: longitude, // 73.25478
                });

                if (response.data.Result === "true") {
                    setAudio_Video(response.data.audio_video);
                }
            } catch (error) {
                console.error("Error :", error);
            }
        }
    };

    // Handler Scroll Bar 
    useEffect(() => {
        if (chatBoxBodyRef.current) {
            chatBoxBodyRef.current.scrollTop = chatBoxBodyRef.current.scrollHeight;
        }
    }, [allChat]);

    // Get Data To LocalStorage
    useEffect(() => {
        const Userdata = localStorage.getItem('Register_User');
        if (Userdata) {
            const Data = JSON.parse(Userdata);
            setSenderId(Data.id);
            setSenderName(Data.name);
            UserGetHandler();
            MyCHatsUserGetHandel();
            setMyphoto(Data.profile_pic);
        }
    }, []);

    // Get Select User Chat Get Habdler
    useEffect(() => {
        ChatGetHandler();
    }, [receiverId]);

    // Store receiver Id In State
    useEffect(() => {
        setReceiverId(chatId);
    }, [chatId]);

    // Handle sending message
    const handleSendMessage = async () => {

        if (senderId && receiverId) {
            showNotification();

            if (message) {

                const chatRoomId1 = [senderId, receiverId].sort().join("_");
                const chatRoomId2 = [receiverId, senderId].sort().join("_");

                // Get references for both chat room IDs
                const chatRoomRef1 = doc(db, 'chat_rooms', chatRoomId1);
                const chatRoomRef2 = doc(db, 'chat_rooms', chatRoomId2);

                // Fetch the document snapshots asynchronously
                const docSnapshot1 = await getDoc(chatRoomRef1);
                const docSnapshot2 = await getDoc(chatRoomRef2);

                if (docSnapshot1.exists() || docSnapshot2.exists()) {

                    const chatRoomId = [senderId, receiverId].sort().join("_");

                    const userRef = doc(db, "chat_rooms", chatRoomId);
                    const messagesCollectionRef = collection(userRef, "message");

                    const messageData = {
                        message: message,
                        reciverId: receiverId,
                        senderName: senderName,
                        senderid: senderId,
                        timestamp: new Date(),
                    };

                    addDoc(messagesCollectionRef, messageData)
                        .then((docRef) => {
                            setMessage('');
                        })
                        .catch((error) => {
                            console.error("Error adding message:", error);
                        });
                } else {
                    const chatRoomId = [senderId, receiverId].sort().join("_");
                    const userRef = doc(db, "chat_rooms", chatRoomId);

                    setDoc(userRef, {
                        timestamp: new Date(),
                    })
                        .then((res) => {
                            const messagesCollectionRef = collection(userRef, "message");
                            const messageData = {
                                message: message,
                                reciverId: receiverId,
                                senderName: senderName,
                                senderid: senderId,
                                timestamp: new Date(),
                            };

                            addDoc(messagesCollectionRef, messageData)
                                .then((docRef) => {
                                    setMessage('');
                                })
                                .catch((error) => {
                                    console.error("Error adding message:", error);
                                });
                        });
                }

            } else {
                showTost({ title: "Please Write Meassage" });
            }
        } else {
            showTost({ title: "Please Select User" });
        }
    };

    // User Get Handler
    const UserGetHandler = () => {
        const UserData = localStorage.getItem('Register_User');
        if (UserData) {

            const Data = JSON.parse(UserData);
            const usersCollection = collection(db, "datingUser");

            const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
                const users = [];
                snapshot.forEach((doc) => {
                    const userData = doc.data();
                    if (userData.uid !== Data.id) {
                        users.push(userData);
                    }
                });
                setData(users);
            });
            return () => unsubscribe();
        }
    };

    // get My chats Users
    const MyCHatsUserGetHandel = () => {
        const userData = localStorage.getItem('Register_User');
        if (userData) {
            const Data = JSON.parse(userData);
            const userId = Data.id;

            if (!userId) return;

            const usersCollection = collection(db, 'chat_rooms');

            const fetchLastMessage = async (userData) => {
                const [id1, id2] = userData.split("_");

                const otherId = id1 === userId ? id2 : id2 === userId ? id1 : null;

                if (!otherId) return null;

                const messagesRef = collection(db, "chat_rooms", userData, "message");
                const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

                const snapshot = await getDocs(messagesQuery);
                const messages = snapshot.docs.map(doc => doc.data());

                if (messages.length === 0) return null;

                const lastMessage = messages[messages.length - 1];
                const messageTime = lastMessage.timestamp && lastMessage.timestamp.toDate();

                if (!messageTime) return null;

                let hours = messageTime.getHours();
                const minutes = messageTime.getMinutes();
                const period = hours >= 12 ? 'PM' : 'AM';

                hours = hours % 12;
                hours = hours ? hours : 12;

                const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;

                return {
                    otherId,
                    lastMessage: lastMessage.message,
                    timestamp: formattedTime,
                    sortchat: lastMessage.timestamp
                };

            };

            const unsubscribe = onSnapshot(usersCollection, async (snapshot) => {
                const users = [];
                const lastmsg = [];

                for (const doc of snapshot.docs) {
                    const userData = doc.id;
                    const user = await fetchLastMessage(userData);

                    if (user) {
                        lastmsg.push(user);
                        users.push(user.otherId);
                    }
                }

                setMyChatsUser(users);
                setLastMsg(lastmsg);

            });

            return () => unsubscribe();
        }
    };

    const memoizedSortedData = useMemo(() => {
        const result = lastMsg?.map(chat => {
            const matchedUser = data.find(user => user.uid === chat.otherId);

            if (matchedUser) {
                return {
                    ...chat,
                    name: matchedUser.name,
                    pro_pic: matchedUser.pro_pic
                };
            }
            return chat;
        });

        return result?.sort((a, b) => {
            if (b.sortchat.seconds !== a.sortchat.seconds) {
                return b.sortchat.seconds - a.sortchat.seconds;
            }
            return b.sortchat.nanoseconds - a.sortchat.nanoseconds;
        });

    }, [lastMsg, data]);

    useEffect(() => {
        setSearchData(memoizedSortedData);
        setSortData(memoizedSortedData);
    }, [memoizedSortedData]);


    // User Message Get Handler
    const ChatGetHandler = () => {
        if (senderId && receiverId) {
            const chatRoomId = [senderId, receiverId].sort().join("_");

            const messagesRef = collection(db, "chat_rooms", chatRoomId, "message");

            const messagesQuery = query(
                messagesRef,
                orderBy("timestamp", "asc")
            );

            const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
                const data = [];

                snapshot.forEach((doc) => {
                    const messageData = doc.data();

                    const messageTime = messageData.timestamp ? messageData.timestamp.toDate() : null;

                    const formattedTime = messageTime ? (() => {
                        const now = new Date();
                        const messageDate = new Date(messageTime);

                        const isToday = now.toDateString() === messageDate.toDateString();

                        const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === messageDate.toDateString();

                        if (isToday) {
                            return `Today ${messageDate.toLocaleString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })}`;
                        } else if (isYesterday) {
                            return `Yesterday ${messageDate.toLocaleString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })}`;
                        } else {
                            return `${messageDate.toLocaleString('en-US', {
                                weekday: 'long'
                            })} ${messageDate.toLocaleString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            })}`;
                        }
                    })() : "No time available";

                    data.push({
                        ...messageData,
                        formattedTime: formattedTime
                    });
                });
                setAllChat(data);
                MyCHatsUserGetHandel();
            });
            return () => unsubscribe();
        }
    };

    // Input messege Handler
    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    //  User Chang Handler
    const UserChangHandler = (user) => {
        setReceiverId(user.otherId);
        setUserName(user.name);
        setProfilePic(user.pro_pic);

        if (window.innerWidth < 1200) {
            Open.current.classList.add("open");
        }
    };

    // Chat Hide Handler 
    const ChatOffHandler = () => {
        Open.current.classList.remove("open");
    };

    // Show emoji picker Handler
    const handleButtonClick = () => {
        if (receiverId) {
            setShowPicker(!showPicker);
        } else {
            showTost({ title: "Please Select User" });
        }
    };

    // Select emoji Handler
    const handleEmojiSelect = (e) => {
        setMessage(message + e.emoji);
        setShowPicker(false);
    };

    // <<------------ Notification Section ------------>>

    useEffect(() => {
        if ("Notification" in window) {
            if (Notification.permission !== "granted") {
                Notification.requestPermission().then(permission => {
                   
                });
            }
        }
    }, []);

    // Show Notification Handler
    const showNotification = async () => {
        if (!receiverId) {
            return;
        }

        if (Notification.permission === "granted") {

            try {
                const response = await axios.post('https://onesignal.com/api/v1/notifications', {
                    app_id: await onesignalAppId,
                    filters: [
                        { field: 'tag', key: 'user_id', value: receiverId }
                    ],
                    headings: {
                        en: senderName
                    },
                    contents: {
                        en: message,
                    },
                }, {
                    headers: {
                        Authorization: await onesignalKey,
                    },

                });
            } catch (error) {
            }
        }
    };

    // <<------------ Call Handler Section --------->>
    // Voice Call Handler
    const AudioCallHandler = async () => {
        try {
            const deviceList = await navigator.mediaDevices.enumerateDevices();
            let hasMicrophone = false;

            deviceList.forEach(device => {
                if (device.kind === 'audioinput') {
                    hasMicrophone = true;
                }
            });

            if (!hasMicrophone) {
                setDeviceCheck(" Required for voice and video calls. Make sure your audio device (headset, speakers, or microphone) is connected and working.");
                return;
            }

        } catch (error) {
            console.error('Error checking devices:', error);
        }

        if (receiverId) {

            const ChannelName = [senderId, receiverId].sort().join("_");

            setCallChannelName(ChannelName);
            setIsVoiceCalling(true);
            CallStatusHandler(ChannelName, "audio");
        } else {
            showTost({ title: "Please Select User" });
        }
    };

    // Video Call Handler
    const VideoCallHandler = async () => {
        try {
            const deviceList = await navigator.mediaDevices.enumerateDevices();

            let hasCamera = false;
            let hasMicrophone = false;

            deviceList.forEach(device => {
                if (device.kind === 'videoinput') {
                    hasCamera = true;
                }
                if (device.kind === 'audioinput') {
                    hasMicrophone = true;
                }
            });

            if (!hasCamera || !hasMicrophone) {
                setDeviceCheck("Required for video calls. Ensure your camera is enabled and functioning for clear video communication.");
                return;
            }

        } catch (error) {
            console.error('Error checking devices:', error);
        } if (receiverId) {
            const ChannelName = [senderId, receiverId].sort().join("_");
            setCallChannelName(ChannelName);
            setIsVideoCalling(true);
            CallStatusHandler(ChannelName);
        } else {
            showTost({ title: "Please Select User" });
        }
    };

    const CallStatusHandler = async (ChannelName, type) => {

        const userRef = doc(db, "chat_rooms", ChannelName);

        const isVcCollectionRef = collection(userRef, "isVcAvailable");
        var messageData;
        if (type === "audio") {
            messageData = {
                Audio: true,
            };
        } else {
            messageData = {
                isVc: true,
            };
        }

        await setDoc(doc(isVcCollectionRef, ChannelName), messageData);
    };

    // <<-------------- Block And Report Handler ------------>>

    // Block And Report Show modal
    const ModalShow = () => {
        if (chatId || receiverId) {
            if (options) {
                setOption(false);
            } else {
                setOption(true);
            }
        } else {
            showTost({ title: "Please Select User" });
        }
    };

    // Report Section Show Handler
    const ReportToggle = (e) => {
        if (e === 'ReportSection') {
            setReport(false);
        } else {
            setReport(true);
        }
    };

    // Report Send Api Call Handler
    const SendReportHamdler = () => {
        if (dot) {
            const UserData = localStorage.getItem("Register_User");
            const UserId = JSON.parse(UserData);

            axios.post(`${basUrl}report.php`,
                {
                    uid: UserId.id,
                    reporter_id: chatId,
                    comment: comment
                }
            )
                .then((res) => {
                    if (res.data.Result === "true") {
                        showTost({ title: "Report Send successfully!!" });
                        setReport(false);
                        setChatId("");
                    }
                });
        } else {
            showTost({ title: "Something Went Wrong" });
        }
    };

    // Block Section Show Handler
    const toggleBottomSheet = (e) => {
        if (e === 'BlockSection') {
            setIsVisible(false);
        } else {
            setIsVisible(true);
        }
    };

    // Block Send Api Call Handler
    const BlockHandler = () => {
        const Local = localStorage.getItem("Register_User");
        if (Local) {
            const UserId = JSON.parse(Local);
            const BlockId = chatId ? chatId : receiverId;
            axios.post(`${basUrl}profile_block.php`, { uid: UserId.id, profile_id: BlockId })
                .then((res) => {
                    if (res.data.Result === "true") {
                        BlockListUserHandler(latitude, longitude, 1);
                        showTost({ title: "Profile Block Successfully" });
                        if (chatId) {
                            navigete("/");
                        }
                        setIsVisible(false);
                        setChatId("");
                    } else {
                        showTost({ title: " Profile Block AlreadyF" });
                        setIsVisible(false);
                        setChatId("");
                    }
                });
        }
    };

    // Block User Get Handler
    const BlockListUserHandler = (lat, long, id) => {
        const localData = localStorage.getItem("Register_User");

        if (localData) {
            const userData = JSON.parse(localData);
            axios.post(`${basUrl}blocklist.php`, {
                uid: userData.id,
                lats: lat,
                longs: long,
            })
                .then((res) => {
                    if (res.data.Result === "true") {
                        const BlockId = [];
                        for (let i = 0; i < res.data.blocklist.length; i++) {
                            BlockId.push(res.data.blocklist[i].profile_id);
                        }
                        setChatUserBlock(BlockId);
                        if (id) {
                            setUserName("");
                            setProfilePic("");
                            setReceiverId("");
                            setAllChat('');
                        }
                    }
                });
        }
    };

    // enter Key Handler
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    // Search Handle 
    useEffect(() => {
        if (searchData?.length > 0) {
            const searchResults = sortData.filter((item) =>
                item.name.toLowerCase().includes(input.toLowerCase())
            );
            if (input) {
                setSearchData(searchResults);
            } else {
                setSearchData(sortData);
            }
        }
    }, [input]);

    // Check Device 
    useEffect(() => {
        if (!chatId) return;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = String(position.coords.latitude);
                const long = String(position.coords.longitude);
                GetUserImgHamdle(lat, long);
            });

    }, [chatId]);

    const GetUserImgHamdle = async (lat, long) => {
        const Local = localStorage.getItem("Register_User");
        if (Local) {
            const UserData = JSON.parse(Local);
            try {
                const res = await axios.post(`${basUrl}profile_info.php`, {
                    uid: UserData.id,
                    profile_id: chatId,
                    lats: lat,
                    longs: long,
                });

                const Pic = await res.data.profileinfo.profile_images[0];
                setProfilePic(Pic);
            } catch (error) {
                console.error("Error fetching profile image", error);
            }
        }
    };

    useEffect(() => {
        setProfilePic(profilePic);
    }, [profilePic])

    const ChatCloseHandle = () => {
        setChatId("");
        sessionStorage.setItem("ChatId", "");
    }

    return (
        <div className="">
            {chatId
                ? <div onClick={() => options && setOption(false)} style={{ width: "100%" }} className="chat-box">
                    <div className="px-[10px] py-[5px] flex items-center justify-between  border-b-[1px] border-[#ccc]">
                        <div className="flex items-center gap-[10px] w-[100%]">
                            <button onClick={ChatCloseHandle}><FaArrowLeft className='text-[20px]' /></button>
                            {profilePic ? (
                                <img
                                    src={`${imageBaseURL}${profilePic}`}
                                    alt="User Avatar"
                                    className='w-[40px] h-[40px] rounded-full object-cover'
                                />
                            ) : (
                                <div className="bg-gray-300 rounded-circle w-[40px] h-[40px] flex justify-center items-center text-[18px] font-bold">
                                    {chatUserName?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <h6 className='m-0 overflow-ellipsis overflow-hidden whitespace-nowrap w-[60%]'>{chatUserName}</h6>
                        </div>
                        <div className="flex items-center gap-[15px] relative">
                            <button onClick={AudioCallHandler}><IoCallOutline className='text-[25px]' /></button>
                            <button onClick={VideoCallHandler}><IoVideocamOutline className='text-[25px]' /></button>
                            <button onClick={ModalShow}><TbDotsCircleHorizontal className='text-[25px] ' /></button>
                            {options && (
                                <div className="bg-gray-200 m-0 px-[5px] top-[38px] rounded-[5px] absolute z-[888]  ">
                                    <button onClick={toggleBottomSheet} className="py-[5px] px-[10px] flex items-center gap-[10px] font-[600]">
                                        <img src={HidePassword} style={{ height: "100%" }} alt="" /> {t('Block')}
                                    </button>
                                    <div className="border-[1px] border-gray-300 "></div>
                                    <button onClick={ReportToggle} className="py-[5px] px-[10px] flex items-center gap-[10px] font-[600]">
                                        <img src={flag} alt="" style={{ height: "100%" }} /> {t('Report')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="chat-box-body scroll-Chat" ref={chatBoxBodyRef}>
                        {allChat.length > 0 && allChat.map((message, index) => {
                            return (<div
                                key={index}
                                className={`message ${message.senderid === senderId ? 'user-message text-end' : 'bot-message'}`}
                            >
                                <h6
                                    className={`message text-[14px] ${message.senderid === senderId ? 'bg-[rgba(152,14,255,255)] text-white' : 'bg-[#e4e2e2]'} m-0`}
                                >
                                    {message.message}
                                </h6>
                                <br />
                                <span className="text-[12px]">{message.formattedTime}</span>
                            </div>)
                        })}
                    </div>

                    <div className="chat-box-footer">
                        <input
                            className='focus-within:outline-[rgba(152,14,255,255)]'
                            type="text"
                            value={message}
                            onChange={handleMessageChange}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                        />
                        <button onClick={handleSendMessage} className='flex justify-center items-center'>
                            <svg width="17" height="16" viewBox="0 0 17 16" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M16.5835 8.08236C16.5835 8.63914 16.2243 9.13491 15.5996 9.44763L3.07573 15.7096C2.77064 15.8621 2.47318 15.9384 2.1986 15.9384C1.80123 15.9384 1.45114 15.7706 1.22918 15.4739C1.03927 15.2138 0.856214 14.7638 1.0774 14.0316L2.48844 9.32559C2.5342 9.1883 2.56471 9.02127 2.57996 8.84508H10.3063C10.7258 8.84508 11.0691 8.50185 11.0691 8.08236C11.0691 7.66286 10.7258 7.31963 10.3063 7.31963H2.57996C2.56395 7.14421 2.53344 6.97641 2.48844 6.83912L1.0774 2.13313C0.856214 1.40092 1.03927 0.95091 1.22995 0.691585C1.60368 0.188188 2.31301 0.0737803 3.07573 0.455141L15.6004 6.71708C16.2251 7.0298 16.5835 7.52557 16.5835 8.08236Z"
                                    fill="white" />
                            </svg>
                        </button>
                    </div>
                </div>
                : <div onClick={() => {
                    if (showPicker) {
                        handleButtonClick();
                    }
                    options && ModalShow();
                }} className="main-wrapper-3 bg-[#e5e5e5] flex">
                    <div className="content-body">
                        <div className="container-fluid my-4 px-sm-4 px-3">
                            <div ref={Open} className="main-chart-wrapper abcd d-lg-flex max-_1200_:-mt-[125px] max-_1200_:h-[100vh]">
                                <div className="chat-sidebar-info card card-rounded p-sm-4 p-3 max-_1200_:mt-[125px] max-_1200_:h-[80%]">
                                    <div className="sidebar-search flex items-center mb-3">
                                        <input type="text" onChange={(e) => setInput(e.target.value)} className="searchbar mx-lg-0 form-control bg-white focus-within:outline-[rgba(152,14,255,255)]" placeholder="Search" />
                                        <div className="-ms-[30px]">
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M13.2934 10.7265C12.9169 10.3499 11.7297 9.47339 10.5511 8.79473C10.5384 8.81388 10.5256 8.83302 10.5128 8.8543C11.8425 6.71194 11.5808 3.85902 9.71926 1.99749C7.54925 -0.170388 4.03256 -0.170388 1.86255 1.99749C-0.30746 4.16963 -0.305333 7.68419 1.86255 9.85422C3.70706 11.6966 6.52169 11.9753 8.65766 10.6861C9.27249 11.754 10.1682 13.0071 10.5915 13.4305C11.3361 14.1751 12.5488 14.173 13.2934 13.4284C14.038 12.6816 14.038 11.4732 13.2934 10.7265ZM8.25559 8.39051C6.89401 9.74996 4.68996 9.74996 3.32839 8.38838C1.96894 7.02894 1.96682 4.82489 3.32839 3.46331C4.68784 2.10387 6.89401 2.10387 8.25346 3.46331C9.61504 4.82489 9.61503 7.03106 8.25559 8.39051Z"
                                                    fill="#999999"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="chat-message-list">
                                        <ul className="my-2 scroll-msg h-[575px]" id="msgList">
                                            {searchData?.length > 0
                                                && searchData?.map((user, index) => {
                                                    if (!chatUserBlock.includes(user.otherId)) {
                                                        return (
                                                            <li key={index} onClick={() => UserChangHandler(user)} className="cursor-pointer">
                                                                <div className="unread-msg-user">
                                                                    <div className="d-flex align-items-center gap-[10px]">
                                                                        {(user.pro_pic === "null" || user.pro_pic === null) ? (
                                                                            <div className="bg-gray-300 rounded-full w-[75px] h-[3.4rem] flex justify-center items-center text-[22px] font-bold max-_430_:w-[70px] max-_770_:w-[60px] max-_1030_:w-[65px] max-_1145_:w-[60px]">
                                                                                {user?.name?.charAt(0).toUpperCase()}
                                                                            </div>
                                                                        ) : (
                                                                            <img
                                                                                src={imageBaseURL + user.pro_pic}
                                                                                className="rounded-circle avatar-md object-fit-cover"
                                                                                alt="userimage"
                                                                            />
                                                                        )}

                                                                        <div className="short-msg flex items-center justify-between overflow-hidden mx-2 text-start w-[100%]">
                                                                            <div className="w-[60%]">
                                                                                <h6 className="text-truncate mb-0 lh-1 fw-medium text-black">{user.name}</h6>
                                                                                <h6 className='text-gray-900 text-[14px] m-0 pt-[3px] overflow-ellipsis overflow-hidden whitespace-nowrap'>{user.lastMessage}</h6>
                                                                            </div>
                                                                            <h6 className='text-gray-900 text-[14px] m-0  pt-[3px]'>{user.timestamp}</h6>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        );
                                                    }
                                                    return null;
                                                })
                                            }
                                        </ul>
                                    </div>
                                </div>

                                <div className="main-chat-area w-100 max-_1200_:mt-[125px]">
                                    <div className="d-flex align-items-center justify-between p-sm-4 p-3 card card-rounded">
                                        <div className="d-flex align-items-center">
                                            <button onClick={ChatOffHandler} className="back-chat mx-2 d-xl-none">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M7 14.5l5-5 5 5" stroke="currentColor" stroke-width="1.5"
                                                        stroke-linecap="round" stroke-linejoin="round"></path>
                                                </svg>
                                            </button>
                                            {(profilePic === "null" || profilePic === null)
                                                ? <div className="bg-gray-300 rounded-circle w-[3.4rem] h-[3.4rem] flex justify-center items-center text-[22px] font-bold">
                                                    {userName?.charAt(0).toUpperCase()}
                                                </div>
                                                : profilePic && <img src={imageBaseURL + profilePic} alt="img" className="rounded-circle avatar-md object-fit-cover" />
                                            }
                                            <div className="short-msg flex-grow-1 overflow-hidden mx-2 max-_430_:hidden">
                                                <h6 className="mb-0 lh-sm fw-medium text-black">{userName ? userName : t('Select User')}</h6>
                                            </div>
                                        </div>
                                        {receiverId && <div className="d-flex flex-wrap rightIcons d-sm-flex">
                                            {audio_video === "1" && <button onClick={AudioCallHandler} aria-label="button" type="button"
                                                className="call btn btn-outline-light rounded-circle m-1" data-bs-toggle="modal"
                                                data-bs-target="#phoneCall">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M14.591 11.3034C14.5503 11.2711 11.5938 9.14003 10.7823 9.293C10.3949 9.36154 10.1734 9.62575 9.72891 10.1547C9.65739 10.2401 9.48555 10.4447 9.35196 10.5902C9.07105 10.4986 8.79704 10.3871 8.532 10.2565C7.16401 9.59049 6.05872 8.4852 5.39272 7.11721C5.26204 6.85221 5.1505 6.57819 5.05898 6.29725C5.20499 6.16316 5.40961 5.99132 5.49702 5.91782C6.02346 5.4758 6.28817 5.2543 6.35671 4.86593C6.49726 4.06137 4.36765 1.08449 4.3453 1.05767C4.24868 0.91964 4.12258 0.804812 3.97613 0.721495C3.82969 0.638179 3.66655 0.588457 3.49853 0.575928C2.63536 0.575928 0.171021 3.77282 0.171021 4.31118C0.171021 4.34247 0.216215 7.52297 4.1382 11.5125C8.12376 15.43 11.3038 15.4752 11.3351 15.4752C11.8739 15.4752 15.0703 13.0109 15.0703 12.1477C15.0579 11.9803 15.0085 11.8177 14.9256 11.6717C14.8427 11.5257 14.7285 11.3999 14.591 11.3034Z"
                                                        fill="#F41781" />
                                                </svg>
                                            </button>}
                                            {audio_video === "1" && <button onClick={VideoCallHandler} aria-label="button" type="button"
                                                className="videocall btn btn-outline-light rounded-circle m-1" data-bs-toggle="modal"
                                                data-bs-target="#videoCall">
                                                <svg width="18" height="13" viewBox="0 0 18 13" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M17.3537 2.3579V9.95702C17.3536 10.0784 17.3193 10.1973 17.2546 10.3C17.1898 10.4028 17.0974 10.4851 16.988 10.5376C16.8785 10.5901 16.7564 10.6106 16.6358 10.5968C16.5152 10.5829 16.401 10.5353 16.3063 10.4594L14.4544 8.9729C14.4245 8.94882 14.4003 8.91833 14.3837 8.88367C14.3671 8.84902 14.3585 8.81108 14.3586 8.77266V3.54227C14.3585 3.50385 14.3671 3.46591 14.3837 3.43125C14.4003 3.39659 14.4245 3.3661 14.4544 3.34202L16.3063 1.85557C16.401 1.77964 16.5152 1.732 16.6358 1.71816C16.7564 1.70431 16.8785 1.72482 16.988 1.77731C17.0974 1.82981 17.1898 1.91216 17.2546 2.01488C17.3193 2.11759 17.3536 2.2365 17.3537 2.3579ZM13.0749 9.58049V2.73443C13.1247 2.38571 13.0926 2.03019 12.9812 1.69602C12.8697 1.36185 12.6821 1.0582 12.433 0.809121C12.1839 0.560038 11.8802 0.372357 11.5461 0.260934C11.2119 0.149512 10.8564 0.117407 10.5077 0.167162H2.80584C2.45712 0.117407 2.1016 0.149512 1.76743 0.260934C1.43326 0.372357 1.12962 0.560038 0.880532 0.809121C0.631449 1.0582 0.443768 1.36185 0.332345 1.69602C0.220923 2.03019 0.188818 2.38571 0.238574 2.73443V9.58049C0.188818 9.92921 0.220923 10.2847 0.332345 10.6189C0.443768 10.9531 0.631449 11.2567 0.880532 11.5058C1.12962 11.7549 1.43326 11.9426 1.76743 12.054C2.1016 12.1654 2.45712 12.1975 2.80584 12.1478H10.5077C10.8564 12.1975 11.2119 12.1654 11.5461 12.054C11.8802 11.9426 12.1839 11.7549 12.433 11.5058C12.6821 11.2567 12.8697 10.9531 12.9812 10.6189C13.0926 10.2847 13.1247 9.92921 13.0749 9.58049Z"
                                                        fill="#0CC94C" />
                                                </svg>
                                            </button>}
                                            <div className="">
                                                <button className="bg-blue-100 rounded-circle m-1" onClick={ModalShow}><HiDotsVertical className='text-[15px] text-[blue]' /></button>
                                            </div>
                                            {options && (
                                                <div className="bg-white m-0 px-[5px] top-[108px] max-_430_:top-[90px] rounded-[5px] absolute z-[888] right-0">
                                                    <button onClick={toggleBottomSheet} className="py-[5px] px-[10px] flex items-center gap-[10px] font-[600]">
                                                        <img src={HidePassword} style={{ height: "100%" }} alt="" /> {t('Block')}
                                                    </button>
                                                    <div className="border-[1px] border-gray-300 "></div>
                                                    <button onClick={ReportToggle} className="py-[5px] px-[10px] flex items-center gap-[10px] font-[600]">
                                                        <img src={flag} alt="" style={{ height: "100%" }} />
                                                        {t('Report')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>}
                                    </div>
                                    <div className="chat-body scroll-Chat" id="msgInOut" ref={chatBoxBodyRef}>
                                        <ul>
                                            {allChat.length > 0 &&
                                                allChat.map((el, index) => {
                                                    if (!chatUserBlock.includes(el.uid)) {
                                                        return (
                                                            <li key={index} className={`${el.senderid === senderId ? 'msg-out' : 'msg-in'}`}>
                                                                <div className="msg-list-inner">
                                                                    <h1 className="msg-text text-center m-0">{el.message}</h1> <br />
                                                                    <span className="msg-date inline-block">{el.formattedTime}</span>
                                                                </div>
                                                            </li>
                                                        );
                                                    }
                                                    return null;
                                                })}

                                        </ul>
                                    </div>
                                    <div className="chat-footer">
                                        <div className="d-flex align-items-center px-2 py-4 card card-rounded">
                                            <button onClick={handleButtonClick} aria-label="button" type="button" className="btn emoji px-3 py-0 border-right relative">
                                                <svg width="22" height="23" viewBox="0 0 22 23" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M10.7929 0.901855C8.69446 0.901855 6.64314 1.52412 4.89835 2.68995C3.15356 3.85578 1.79366 5.51283 0.99062 7.45153C0.187581 9.39024 -0.0225313 11.5235 0.386855 13.5817C0.796241 15.6398 1.80674 17.5303 3.29056 19.0141C4.77439 20.4979 6.66489 21.5084 8.72302 21.9178C10.7811 22.3272 12.9144 22.1171 14.8531 21.3141C16.7919 20.511 18.4489 19.1511 19.6147 17.4063C20.7806 15.6615 21.4028 13.6102 21.4028 11.5118C21.3996 8.69883 20.2808 6.002 18.2917 4.01294C16.3027 2.02389 13.6059 0.905038 10.7929 0.901855ZM13.6222 7.26781C13.902 7.26781 14.1755 7.35078 14.4082 7.50622C14.6408 7.66166 14.8221 7.8826 14.9292 8.1411C15.0363 8.39959 15.0643 8.68403 15.0097 8.95845C14.9551 9.23287 14.8204 9.48493 14.6225 9.68278C14.4247 9.88062 14.1726 10.0154 13.8982 10.0699C13.6238 10.1245 13.3393 10.0965 13.0809 9.98943C12.8224 9.88236 12.6014 9.70104 12.446 9.4684C12.2905 9.23576 12.2076 8.96226 12.2076 8.68246C12.2076 8.30727 12.3566 7.94745 12.6219 7.68215C12.8872 7.41685 13.247 7.26781 13.6222 7.26781ZM7.9636 7.26781C8.24339 7.26781 8.5169 7.35078 8.74954 7.50622C8.98218 7.66166 9.1635 7.8826 9.27057 8.1411C9.37764 8.39959 9.40565 8.68403 9.35107 8.95845C9.29648 9.23287 9.16175 9.48493 8.96391 9.68278C8.76607 9.88062 8.514 10.0154 8.23958 10.0699C7.96516 10.1245 7.68073 10.0965 7.42223 9.98943C7.16374 9.88236 6.9428 9.70104 6.78735 9.4684C6.63191 9.23576 6.54894 8.96226 6.54894 8.68246C6.54894 8.30727 6.69798 7.94745 6.96328 7.68215C7.22858 7.41685 7.58841 7.26781 7.9636 7.26781ZM16.3101 14.6948C15.7514 15.6628 14.9478 16.4666 13.9799 17.0255C13.012 17.5844 11.9141 17.8787 10.7964 17.8787C9.6788 17.8787 8.58085 17.5844 7.613 17.0255C6.64514 16.4666 5.84148 15.6628 5.28282 14.6948C5.23301 14.6142 5.19987 14.5245 5.18536 14.431C5.17086 14.3374 5.17529 14.2419 5.19839 14.15C5.22149 14.0582 5.26279 13.972 5.31984 13.8964C5.37689 13.8208 5.44853 13.7575 5.53052 13.7101C5.6125 13.6628 5.70316 13.6324 5.79713 13.6207C5.89109 13.609 5.98643 13.6163 6.07752 13.6422C6.1686 13.668 6.25357 13.7119 6.32738 13.7712C6.40119 13.8305 6.46234 13.904 6.50721 13.9874C6.9416 14.7407 7.56672 15.3663 8.31968 15.8013C9.07264 16.2363 9.92687 16.4653 10.7964 16.4653C11.666 16.4653 12.5203 16.2363 13.2732 15.8013C14.0262 15.3663 14.6513 14.7407 15.0857 13.9874C15.1306 13.904 15.1917 13.8305 15.2655 13.7712C15.3393 13.7119 15.4243 13.668 15.5154 13.6422C15.6065 13.6163 15.7018 13.609 15.7958 13.6207C15.8897 13.6324 15.9804 13.6628 16.0624 13.7101C16.1444 13.7575 16.216 13.8208 16.273 13.8964C16.3301 13.972 16.3714 14.0582 16.3945 14.15C16.4176 14.2419 16.422 14.3374 16.4075 14.431C16.393 14.5245 16.3599 14.6142 16.3101 14.6948Z"
                                                        fill="#999999" />
                                                </svg>
                                            </button>

                                            {showPicker &&
                                                <div onClick={(e) => e.stopPropagation()} className='absolute left-[10px] -top-[455px]'>
                                                    <EmojiPicker style={{ width: "100%" }} onEmojiClick={handleEmojiSelect} />
                                                </div>}

                                            <input value={message}
                                                onChange={handleMessageChange} onKeyDown={handleKeyPress} className="form-control focus-within:outline-[rgba(152,14,255,255)]" placeholder="Write message here..." type="text" />

                                            <button onClick={handleSendMessage} aria-label="button" type="button"
                                                className="avatar-sm p-0 rounded-circle mx-2 flex items-center justify-center bg-[rgba(152,14,255,255)]">
                                                <svg width="17" height="16" viewBox="0 0 17 16" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M16.5835 8.08236C16.5835 8.63914 16.2243 9.13491 15.5996 9.44763L3.07573 15.7096C2.77064 15.8621 2.47318 15.9384 2.1986 15.9384C1.80123 15.9384 1.45114 15.7706 1.22918 15.4739C1.03927 15.2138 0.856214 14.7638 1.0774 14.0316L2.48844 9.32559C2.5342 9.1883 2.56471 9.02127 2.57996 8.84508H10.3063C10.7258 8.84508 11.0691 8.50185 11.0691 8.08236C11.0691 7.66286 10.7258 7.31963 10.3063 7.31963H2.57996C2.56395 7.14421 2.53344 6.97641 2.48844 6.83912L1.0774 2.13313C0.856214 1.40092 1.03927 0.95091 1.22995 0.691585C1.60368 0.188188 2.31301 0.0737803 3.07573 0.455141L15.6004 6.71708C16.2251 7.0298 16.5835 7.52557 16.5835 8.08236Z"
                                                        fill="white" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

            {/* <----------- Report Section ---------------> */}
            {report && <div onClick={() => ReportToggle('ReportSection')} className="px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
                <div onClick={(e) => e.stopPropagation()} className="w-[20%] max-_430_:w-[100%] max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] bg-white rounded-[15px] p-[15px]">
                    <div className="flex flex-col justify-center items-center text-center">
                        <div className="">
                            <h3 className="m-0 font-[500]">{t('Reporting')} {chatUserName ? chatUserName : userName}</h3>
                            <p className="leading-[18px] mt-[10px] font-[400] text-[16px]">{t("Pelease tell us why you are reporting")} <br /> {chatUserName ? chatUserName : userName}. {t("Don't worry we won't tell them")}</p>
                            <h6 className=" text-start mt-[10px] font-[500] text-[18px]">{t("Why did you report this user?")}</h6>
                            <div className="ps-[10px]">
                                {
                                    ReportComment.map((item, index) => {
                                        return <button onClick={() => { setDot(index); setComment(item); }} className="flex items-center gap-[35px] my-[15px]">
                                            <div className="dot">
                                                <span style={{ background: dot === index && "#980EFF" }} className="w-[100%] h-[100%] block rounded-full duration-[0.9s]"></span>
                                            </div>
                                            <h6 className="m-0 font-[400]">{item}</h6>
                                        </button>
                                    })
                                }
                                <button onClick={SendReportHamdler} className="w-[100%] bg-[#980EFF] text-white rounded-full text-[18px] py-[8px] mt  -[20px]">{t("Continue")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}

            {/* <----------- Block Section ---------------> */}
            {isVisible && <div onClick={() => toggleBottomSheet('BlockSection')} id="BlockSection" className=" px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
                <div onClick={(e) => e.stopPropagation()} className="w-[20%] max-_430_:w-[100%] max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] bg-white rounded-[15px] p-[15px]">
                    <div className="flex flex-col justify-center items-center text-center">
                        <img src={BlockIcon} alt="" className="w-[30%]" />
                        <h4 className="m-0">{t('Blocking')} {chatUserName ? chatUserName : userName}</h4>
                        <p className="mt-[20px] leading-[18px] text-[15px] pb-[15px]">
                            {t('Please tell us why you are blocking')} <br /> {t("Acchcuu. Don't worry we won't tell them..")}
                        </p>
                        <div className="flex items-center border-t-[2px] pt-[10px] gap-[15px]">
                            <div className="">
                                <div className="flex items-center gap-[15px]">
                                    <img src={plus} alt="" />
                                    <p className="text-start leading-[18px] font-[500]">
                                        {t("They will not be able to find your profile and send you messages.")}
                                    </p>
                                </div>
                                <div className="flex items-center gap-[10px] mt-[15px]">
                                    <img src={Bell} alt="" />
                                    <p className="text-start leading-[18px] font-[500]">
                                        {t('They will not be notified if you block them.')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-[10px] mt-[15px]">
                                    <img src={Setting} alt="" />
                                    <p className="text-start leading-[18px] font-[500]">
                                        {t('You can unblock them anytime in Settings.')}
                                    </p>
                                </div>
                                <div className="flex justify-center gap-[20px] mt-[25px]">
                                    <button onClick={() => toggleBottomSheet('BlockSection')} id="BlockSection" className="text-[16px] text-[rgba(152,14,255,255)] h-[40px] max-h-[40px] border-[2px] border-[rgba(152,14,255,255)] rounded-full px-[25px]">
                                        {t('Cancel')}
                                    </button>
                                    <button onClick={BlockHandler} className="text-[16px] text-white border-[2px] bg-[rgba(152,14,255,255)] rounded-full px-[25px] py-[8px]">
                                        {t('Yes, Block')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}

            {/* <----------- Voice Call Section ---------------> */}
            {isVoiceCalling && <div id="BlockSection" className=" px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
                <div onClick={(e) => e.stopPropagation()} className="w-[20%] max-_430_:w-[100%] max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] rounded-[15px]">
                    <VoiceCall Id={senderId} name={userName || chatUserName} img={imageBaseURL + profilePic} channelname={callChannelName} receiverId={receiverId} />
                    <Onesignal Id={senderId} title={senderName} name={userName} message={`incoming Voice Call From ${senderName}`} receiverId={receiverId} type={'Audio'} channel={callChannelName} img={myPhoto} />
                </div>
            </div>}

            {isVideoCalling && <div id="BlockSection" className=" px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
                <div onClick={(e) => e.stopPropagation()} className="w-[20%] max-_430_:w-[100%] max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] rounded-[15px]">
                    <VideoCall Id={senderId} name={userName || chatUserName} receiverId={receiverId} img={imageBaseURL + profilePic} channelname={callChannelName} />
                    <Onesignal Id={senderId} message={`incoming Video Call From ${senderName}`} receiverId={receiverId} type={'vcId'} channel={callChannelName} title={senderName} img={myPhoto} />
                </div>
            </div>}

            {deviceCheck && <div onClick={() => setDeviceCheck("")} id="BlockSection" className=" px-[15px] py-[15px] w-full h-full fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-50 z-[999]">
                <div onClick={(e) => e.stopPropagation()} className="w-[20%] bg-white max-_430_:w-[100%] max-_768_:w-[90%] max-_1030_:w-[50%] max-_1500_:w-[40%] rounded-[15px] p-4">
                    <h6 className='m-0'>{deviceCheck}</h6>
                </div>
            </div>}

        </div>
    );
}

export default UserChat
/* jshint ignore:end */