/* jshint esversion: 6 */
/* jshint esversion: 8*/
/* jshint esversion: 10 */
/* jshint ignore:start */

import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
} from 'agora-rtc-react';
import { FiMicOff, FiMic } from 'react-icons/fi';
import { IoCall } from 'react-icons/io5';
import { MyContext } from '../Context/MyProvider';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../Users_Chats/Firebase';

const Basics = ({ Id, name, img, channelname }) => {


  const { setIsVoiceCalling, setAtendCall, setCallstatus, agoraAppId } = useContext(MyContext);

  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [channel, setChannel] = useState(channelname);
  const [token] = useState('');
  const [callTime, setCallTime] = useState(0);

  const [micOn, setMic] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  usePublish([localMicrophoneTrack]);

  const remoteUsers = useRemoteUsers();

  useJoin({ appid: agoraAppId, channel, token: token || null }, calling);

  useEffect(() => {
    if (remoteUsers.length === 0) {
      setCalling(false);
      setIsVoiceCalling(false);
      setCallstatus(false);
      setAtendCall(false);
    }
  }, [remoteUsers, setCalling, setIsVoiceCalling, setCallstatus, setAtendCall]);


  useEffect(() => {
    if (!name || !channelname) return;
    setCalling(true);
    setChannel(channelname);
  }, [Id, name, channelname]);

  const leaveCall = useCallback(async () => {
    if (channel) {
      const userRef = doc(db, 'chat_rooms', channel);
      const isVcDocRef = doc(userRef, 'isVcAvailable', channel);

      try {
        await updateDoc(isVcDocRef, { Audio: false });
      } catch {}
    }
    setIsVoiceCalling(false);
    setCalling(false);
    setCallstatus(false);
    setAtendCall(false);
  }, [channel, setIsVoiceCalling, setCalling, setCallstatus, setAtendCall]);

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
            const isVoiceCall = messageData.Audio;
            if (isVoiceCall === false) {
              leaveCall();
            }
          });
        }
      } catch (error) {
        console.error('Error getting voice call status:', error);
      }
    };

    getVoiceCallStatus();
  }, [callTime, channel, leaveCall, remoteUsers]);


  return (
    <div
      className="flex items-end justify-center rounded-[10px] overflow-hidden"
      style={{
        backgroundImage: `url(${img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '500px',
        width: '100%',
      }}
    >
      <div className="user-list">
        <div className="z-[999] relative">
          <div className="text-white text-center w-[100%]">
            <h6 className="text-[30px] m-0">{name}</h6>
            <h6>{!remoteUsers.length > 0 ? 'Ringing...' : 'Connected'}</h6>
          </div>
          {isConnected && (
            <div className="control flex items-center justify-center">
              <div className="left-control">
                <button className="btn" onClick={() => setMic((prev) => !prev)}>
                  {micOn ? (
                    <FiMic className="i-microphone bg-slate-600 text-white rounded-full p-[12px] w-[45px] h-[45px]" />
                  ) : (
                    <FiMicOff className="i-microphone off bg-slate-600 text-white rounded-full p-[12px] w-[45px] h-[45px]" />
                  )}
                </button>
              </div>

              <button
                className={`btn btn-phone ${calling ? 'btn-phone-active' : ''}`}
                onClick={leaveCall}
              >
                <IoCall className="i-phone-hangup bg-red-500 text-white rounded-full p-[12px] w-[45px] h-[45px]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Basics;
/* jshint ignore:end */
