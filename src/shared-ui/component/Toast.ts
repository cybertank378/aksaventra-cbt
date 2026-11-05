"use client";

import { type ToastOptions, toast } from "react-toastify";

const baseOptions: ToastOptions = {
  // default, nanti bisa di-override per call
  autoClose: 3000,
  pauseOnHover: true,
  closeOnClick: true,
  draggable: true,
};

/** Generic */
export const showToast = (message: string, options?: ToastOptions) => {
  toast(message, { ...baseOptions, ...options });
};

/** Success */
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  toast.success(message, { ...baseOptions, ...options });
};

/** Error */
export const showErrorToast = (message: string, options?: ToastOptions) => {
  toast.error(message, { ...baseOptions, ...options });
};

/** Info */
export const showInfoToast = (message: string, options?: ToastOptions) => {
  toast.info(message, { ...baseOptions, ...options });
};

/** Warning */
export const showWarningToast = (message: string, options?: ToastOptions) => {
  toast.warn(message, { ...baseOptions, ...options });
};
