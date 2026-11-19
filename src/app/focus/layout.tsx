import { ReactNode } from "react";
import { ToastContainer } from "@/components/ui/ToastContainer";

export default function FocusLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden select-none bg-black text-white relative">
      <ToastContainer />
      {children}
    </div>
  );
}
