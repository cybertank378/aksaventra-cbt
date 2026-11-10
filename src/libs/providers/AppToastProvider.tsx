"use client";

import type { ReactNode } from "react";
import { ToastContainer } from "@/shared-ui/component/Toast";
import "react-toastify/dist/ReactToastify.css";

export default function AppToastProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
