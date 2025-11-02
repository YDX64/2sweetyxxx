/* jshint esversion: 6 */
/* jshint esversion: 8*/
/* jshint esversion: 11 */
/* jshint ignore:start */

import {
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { FaVideo, FaVideoSlash } from "react-icons/fa";
import { FiMicOff, FiMic } from "react-icons/fi";
import { IoCall } from "react-icons/io5";
import { MyContext } from "../Context/MyProvider";
import { db } from "../Users_Chats/Firebase";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";

const Basics = ({ Id, img, name, channelname }) => {

  const { setIsVideoCalling, setCallstatus, setAtendCall, imageBaseURL, agoraAppId } = useContext(MyContext);

  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [channel, setChannel] = useState(channelname);
  const [token, setToken] = useState(null);
  const [myProPic, setMyProPic] = useState();
  const [callTime, setCallTime] = useState(0);

  useJoin({ appid: agoraAppId, channel: channel, token: token }, calling);

  // local user
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);

  usePublish([localMicrophoneTrack, localCameraTrack]);

  // remote users
  const remoteUsers = useRemoteUsers();

  useEffect(() => {
    if (remoteUsers.length === 0) {
      setCalling(false);
      setIsVideoCalling(false);
      setCallstatus(false);
      setAtendCall(false);
    }
  }, [remoteUsers, setCalling, setIsVideoCalling, setCallstatus, setAtendCall]);

  useEffect(() => {
    if (!Id && !channelname) return;
    setCalling(true);
    setChannel(channelname);
    setToken(null);
  }, [Id, channelname]);

  const LeaveCall = useCallback(async () => {
    if (channel) {
      const userRef = doc(db, "chat_rooms", channel);
      const isVcDocRef = doc(userRef, "isVcAvailable", channel);

      try {
        await updateDoc(isVcDocRef, { isVc: false });
      } catch {
       
      }
    }

    setCalling(false);
    setIsVideoCalling(false);
    setCallstatus(false);
    setAtendCall(false);
  }, [channel, setCalling, setIsVideoCalling, setCallstatus, setAtendCall]);

  useEffect(() => {
    const Data = localStorage.getItem("Register_User");
    if (Data) {
      const Pic = JSON.parse(Data);
      if (Pic?.profile_pic) {
        setMyProPic(imageBaseURL + Pic?.profile_pic);
      } else {
        setMyProPic("https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg");
      }
    }
  }, [imageBaseURL]);

  useEffect(() => {
    if (!remoteUsers) return;

    const intervalId = setInterval(() => {
      setCallTime((prevTime) => prevTime + 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [remoteUsers]);

  useEffect(() => {
    if (!remoteUsers) return;

    const userRef = doc(db, 'chat_rooms', channel);

    const isVcCollectionRef = collection(userRef, 'isVcAvailable');

    const getVoiceCallStatus = async () => {
      try {
        const querySnapshot = await getDocs(isVcCollectionRef);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const messageData = doc.data();
            const isVoiceCall = messageData.isVc;
            if (isVoiceCall === false) {
              LeaveCall();
            }
          });
        }
      } catch (error) {
        console.error('Error getting voice call status:', error);
      }
    };

    getVoiceCallStatus();
  }, [callTime, LeaveCall, channel, remoteUsers]);

  return (
    <>
      <div className="flex items-end Callimg justify-center room" style={{
        backgroundImage: `url(${img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "500px",
        width: "100%",
      }}>
        <div className="" >
          {isConnected && (
            <div className="user-list">
              {remoteUsers.length > 0 && <div className="user You">
                <LocalUser
                  audioTrack={localMicrophoneTrack}
                  cameraOn={cameraOn}
                  micOn={micOn}
                  videoTrack={localCameraTrack}
                  cover={myProPic}
                >
                </LocalUser>
              </div>}

              {remoteUsers.length > 0 ? remoteUsers.map((user) => (
                <div className="user remote" key={user.uid}>
                  <RemoteUser
                    cover={img}
                    user={user}
                    style={{ transform: 'scaleX(1)' }} // This will ensure the remote user's video is not flipped
                  />
                </div>
              )) : (
                <div className="w-[100%] h-[100%] text-center z-[999] relative">
                  <h2 className="text-white">{name}</h2>
                  <h4 className="text-white">Ringing...</h4>
                </div>
              )}
            </div>
          )}

          {isConnected && (
            <div className="flex justify-center z-[999] relative">
              <div className="left-control">
                {remoteUsers.length > 0 && (
                  <>
                    <button className="btn" onClick={() => setMic((a) => !a)}>
                      {micOn ? (
                        < FiMic className="bg-slate-600 text-white rounded-full p-[10px] w-[40px] h-[40px]" />
                      ) : (
                        <FiMicOff className="bg-slate-600 text-white rounded-full p-[10px] w-[40px] h-[40px]" />
                      )}
                    </button>
                    <button className="btn" onClick={() => setCamera((a) => !a)}>
                      {cameraOn ? (
                        <FaVideo className="bg-blue-600 text-white rounded-full p-[10px] w-[40px] h-[40px]" />
                      ) : (
                        <FaVideoSlash className="bg-blue-600 text-white rounded-full p-[10px] w-[40px] h-[40px]" />
                      )}
                    </button>
                  </>
                )}
                <button
                  className={` btn btn-phone ${calling ? "btn-phone-active" : ""}`}
                  onClick={LeaveCall}
                >
                  <IoCall className="bg-red-500 text-white w-[40px] h-[40px] p-[10px] rounded-full" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Basics;
/* jshint ignore:end */

