import { Outlet } from "react-router-dom";

import Sidebar from "../components/common/Sidebar";
import Header from "../components/common/Header";

function OwnerLayout() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <Header />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default OwnerLayout;
