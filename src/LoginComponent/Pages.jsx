/* jshint esversion: 6 */
/* jshint esversion: 11 */
/* jshint ignore:start */
import React, { useContext, useEffect, useState } from 'react';
import { MyContext } from '../Context/MyProvider';
import axios from 'axios';
import { useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Terms_Conditions = () => {
    const { t } = useTranslation();

    const { basUrl } = useContext(MyContext);

    const Perams = useParams();
    const Title = Perams.title?.replaceAll('_', ' ');
    const [list, setList] = useState([]);

    const ApiHandler = () => {
        axios.post(`${basUrl}pagelist.php`)
            .then((res) => {
                setList(res.data.pagelist);
            });
    };

    useEffect(() => {
        ApiHandler();
    }, []);

    // Redirect well-known pages to fully designed components
    const slug = (Title || '').toLowerCase();
    const aboutSlugs = ['about', 'about us', 'about_us', 'about-us', 'om oss', 'om-oss'];
    const contactSlugs = ['contact', 'contact us', 'contact_us', 'contact-us', 'kontakt'];
    if (aboutSlugs.includes(slug)) return <Navigate to="/about" replace />;
    if (contactSlugs.includes(slug)) return <Navigate to="/contact" replace />;

    return (
        <div>
            <div className="main-wrapper-2 dashboard -mt-[80px]">

                <div className={`content-body bg-gray-50 dark:bg-gray-900 ${Title === "contact us" && "h-[100vh]"}`}>
                    <div className="mt-[90px]">
                        {
                            list.map((item, index) => {
                                if (item.title.toLowerCase() === Title || item.title.toLowerCase().startsWith(Title)) {
                                    return <div key={index} className="">
                                        <div className="bg-white dark:bg-gray-800 mx-[20px] p-[16px] my-[30px] rounded-[0.56rem] border dark:border-gray-700">
                                            <h3 className='mb-0 dark:text-gray-100'>{item.title}</h3>
                                        </div>
                                        <div className='bg-white dark:bg-gray-800 mx-[20px] p-[16px] my-[30px] rounded-[0.56rem] text-[15px] description border dark:border-gray-700 dark:text-gray-200' dangerouslySetInnerHTML={{ __html: item?.description }} />
                                    </div>
                                }
                            })
                        }
                    </div>
                </div>
            </div>

            {list.length === 0 && (
                <div className="w-[100%] h-[100vh] ms-[8rem] max-_991_:ms-0 bg-white dark:bg-gray-900 fixed flex items-center justify-center top-0 left-0 right-0 bottom-0 z-[555]">
                    <div className="">
                        <h2 className="dark:text-gray-100">{t('Loading...')}</h2>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Terms_Conditions
/* jshint ignore:end */
