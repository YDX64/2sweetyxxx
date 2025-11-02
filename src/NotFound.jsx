/* jshint esversion: 6 */
/* jshint ignore:start */

import React from 'react';
import { createPortal } from 'react-dom';

const NotFound = () => {
    return createPortal(
        <div className="w-full h-[100vh] flex justify-center pt-40 relative z-[9999] bg-white">
            <div className="text-center">
                <h1 className="text-6xl font-bold">404</h1>
                <h2 className="text-2xl mt-4">Page Not Found</h2>
                <h4 className="mt-6 text-lg">Sorry, the page you are looking for does not exist.</h4>
            </div>
        </div>,
        document.getElementById('portal-root')
    );
};

export default NotFound;
/* jshint ignore:end */

