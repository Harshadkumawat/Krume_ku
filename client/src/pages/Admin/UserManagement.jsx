import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Loader2,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  User as UserIcon,
  Search,
} from "lucide-react";
import { getAllUsers, reset } from "../../features/auth/authSlice";

const UserManagement = () => {
  const dispatch = useDispatch();
  const { allUsers, isLoading } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getAllUsers());
    return () => dispatch(reset());
  }, [dispatch]);

  // --- Search Logic ---
  const filteredUsers = allUsers?.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-black" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
          Loading Users...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 bg-white min-h-screen font-sans selection:bg-black selection:text-white overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">
            User <span className="text-transparent stroke-text">Archive.</span>
          </h1>
          <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]">
            Managing {allUsers?.length || 0} Total Members
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative group w-full md:w-auto">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="SEARCH BY NAME OR EMAIL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-3.5 md:py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-black transition-all text-[11px] font-bold w-full md:w-80 uppercase tracking-widest"
          />
        </div>
      </div>

      {/* LISTING AREA (Hybrid Table/Cards) */}
      <div className="bg-white border-2 border-gray-100 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-sm">
        {/* 🖥️ DESKTOP VIEW: TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b-2 border-gray-100 italic">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Member Info
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Contact Details
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Verification
                </th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                  Join Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-50">
              {filteredUsers?.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-gray-50/30 transition-all group"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white font-black text-lg overflow-hidden shrink-0 shadow-lg transition-transform group-hover:scale-105">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          u.fullName[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase italic tracking-tight">
                          {u.fullName}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 tracking-tighter uppercase">
                          Role: {u.role}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-600 truncate max-w-[200px]">
                        <Mail size={14} className="text-gray-300" /> {u.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                        <Phone size={14} className="text-gray-300" />{" "}
                        {u.phone || "Not Provided"}
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    {u.isGoogleUser ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full w-fit">
                        <ShieldCheck size={14} />
                        <span className="text-[9px] font-black uppercase tracking-wider">
                          Google
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full w-fit">
                        <UserIcon size={14} />
                        <span className="text-[9px] font-black uppercase tracking-wider">
                          Email
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-1 text-xs font-black text-gray-400 italic">
                      <Calendar size={12} />
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📱 MOBILE VIEW: CARD LAYOUT (No horizontal scroll) */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {filteredUsers?.map((u) => (
            <div
              key={u._id}
              className="p-5 flex flex-col gap-4 active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white font-black text-lg overflow-hidden shrink-0 shadow-md">
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      u.fullName[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase italic tracking-tight leading-none mb-1">
                      {u.fullName}
                    </h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase">
                      Role: {u.role}
                    </p>
                  </div>
                </div>
                {u.isGoogleUser ? (
                  <ShieldCheck size={18} className="text-blue-500" />
                ) : (
                  <UserIcon size={18} className="text-gray-300" />
                )}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-600">
                  <Mail size={14} className="text-gray-300 shrink-0" />
                  <span className="truncate">{u.email}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-600">
                  <Phone size={14} className="text-gray-300 shrink-0" />
                  <span>{u.phone || "No phone provided"}</span>
                </div>
              </div>

              <div className="flex justify-between items-center px-1">
                <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest">
                  Registered on
                </span>
                <span className="text-[10px] font-black text-gray-400 italic">
                  {new Date(u.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`.stroke-text { -webkit-text-stroke: 1.5px black; }`}</style>
    </div>
  );
};

export default UserManagement;
