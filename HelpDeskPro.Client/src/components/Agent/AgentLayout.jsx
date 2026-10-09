import { Outlet } from "react-router-dom";
import AgentSidebar from "./AgentSidebar";
import AgentHeader from "./AgentHeader";

function AgentLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AgentSidebar />

      <div className="lg:ml-64">
        <AgentHeader />

        <main className="min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AgentLayout;