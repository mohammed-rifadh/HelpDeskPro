import { Outlet } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";

function EmployeeLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <Header />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default EmployeeLayout;