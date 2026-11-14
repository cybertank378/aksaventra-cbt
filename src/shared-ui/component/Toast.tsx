"use client";

import {
  ToastContainer as BaseToastContainer,
  type ToastOptions,
  toast,
} from "react-toastify";

export const baseToastOptions: ToastOptions = {
  autoClose: 3000,
  pauseOnHover: true,
  closeOnClick: true,
  draggable: true,
};

export const showToast = (message: string, options?: ToastOptions) => {
  toast(message, { ...baseToastOptions, ...options });
};

export const showSuccessToast = (message: string, options?: ToastOptions) => {
  toast.success(message, { ...baseToastOptions, ...options });
};

export const showErrorToast = (message: string, options?: ToastOptions) => {
  toast.error(message, { ...baseToastOptions, ...options });
};

export const showInfoToast = (message: string, options?: ToastOptions) => {
  toast.info(message, { ...baseToastOptions, ...options });
};

export const showWarningToast = (message: string, options?: ToastOptions) => {
  toast.warn(message, { ...baseToastOptions, ...options });
};

export function ToastContainer() {
  return (
    <BaseToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
}

export default ToastContainer;
