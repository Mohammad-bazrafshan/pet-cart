import { Outlet } from "react-router-dom";

import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";

function OwnerLayout() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50/70 text-slate-800"
    >
      <Sidebar />

      <div className="min-w-0 lg:mr-72">
        <Header />

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default OwnerLayout;