/* jshint esversion: 6 */
import { toast } from 'react-toastify';
export const showTost = ({ title }) => {
  toast(`💞 ${title}`, {
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
  return null;

};