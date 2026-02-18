import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "../../components/Admin/Sidebar";

const AdminLayout = () => {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading && !user) return null;

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50 font-sans">
      {/* Sidebar Fixed */}
      <Sidebar />

      {/* Main Content Area */}
     
      <main className="flex-1 md:ml-64 pt-20 min-h-screen relative bg-gray-50/50">
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
