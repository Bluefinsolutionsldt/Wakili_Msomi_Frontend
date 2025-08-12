"use client";

import Topbar from "@/components/Topbar";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed top-0 w-full z-50">
        <Topbar />
      </div>
      <main className="pt-[64px]">{children}</main>
    </>
  );
}
