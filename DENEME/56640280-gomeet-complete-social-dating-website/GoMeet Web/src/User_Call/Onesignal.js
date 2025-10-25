/* jshint esversion: 6 */
/* jshint esversion: 8*/
import axios from 'axios';
import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { MyContext } from '../Context/MyProvider';

const Onesignal = ({ Id, message, receiverId, channel, title, img, type }) => {

    const { onesignalAppId, onesignalKey } = useContext(MyContext);

    const [notificationSent, setNotificationSent] = useState(false);
    const Test = useRef(false);

    const sendPushNotification = useCallback(async () => {
        if (Test.current) {
            return;
        }

        let Data;

        if (type === "Audio") {
            Data = {
                Audio: channel,
                name: title,
                popic: img,
                id: Id
            };
        } else {
            Data = {
                vcId: channel,
                name: title,
                popic: img,
                id: Id
            };
        }

        if (Data) {
            try {
                await axios.post('https://onesignal.com/api/v1/notifications', {
                    app_id: await onesignalAppId,
                    filters: [
                        { field: 'tag', key: 'user_id', value: receiverId }
                    ],
                    headings: {
                        en: title
                    },
                    contents: {
                        en: message,
                    },
                    data: Data,
                    content_available: false,
                }, {
                    headers: {
                        Authorization: await onesignalKey,
                    },
                });
                setNotificationSent(true);
            } catch (error) {
                console.error('Error sending notification:', error);
            }
        }
    }, [channel, type, title, img, Id, message, receiverId, onesignalAppId, onesignalKey, Test]);
    
    useEffect(() => {
        if (message && receiverId && !notificationSent) {
            sendPushNotification();
            Test.current = true;
        }
    }, [message, receiverId, notificationSent, sendPushNotification]);

    return null;
};

export default Onesignal;
