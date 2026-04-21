import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  User as UserIcon,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAllUsers, reset } from "../../features/auth/authSlice";

const STROKE_STYLE = `.stroke-text { -webkit-text-stroke: 1.5px black; color: transparent; }`;

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const USERS_PER_PAGE = 20;

const UserManagement = () => {
  const dispatch = useDispatch();
  const { allUsers = [], isLoading } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(getAllUsers());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const { paginatedUsers, totalPages, totalFiltered } = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    const filtered = !query
      ? allUsers
      : allUsers.filter(
          (u) =>
            u.fullName?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query),
        );

    const total = Math.ceil(filtered.length / USERS_PER_PAGE);
    const start = (currentPage - 1) * USERS_PER_PAGE;
    const paginated = filtered.slice(start, start + USERS_PER_PAGE);

    return {
      paginatedUsers: paginated,
      totalPages: total,
      totalFiltered: filtered.length,
    };
  }, [allUsers, searchTerm, currentPage]);

  if (isLoading && allUsers.length === 0) {
    return (
      <main
        className="h-[70vh] flex flex-col items-center justify-center gap-4"
        aria-busy="true"
      >
        <Loader2
          className="animate-spin text-black"
          size={40}
          aria-hidden="true"
        />
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Accessing User Database...
        </p>
      </main>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-10 bg-white min-h-screen font-sans selection:bg-black selection:text-white overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: STROKE_STYLE }} />

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">
            User <span className="stroke-text">Archive.</span>
          </h1>
          <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]">
            Database Overview / {allUsers.length} Members
            {searchTerm && ` / ${totalFiltered} Results`}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative group w-full md:w-80">
          <label htmlFor="user-search" className="sr-only">
            Search Users
          </label>
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors"
            size={18}
            aria-hidden="true"
          />
          <input
            id="user-search"
            type="text"
            placeholder="NAME OR EMAIL..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-12 pr-6 py-3.5 md:py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl outline-none focus:border-black focus:bg-white transition-all text-[11px] font-bold w-full uppercase tracking-widest placeholder:text-zinc-300 shadow-sm"
          />
        </div>
      </header>

      {/* LISTING AREA */}
      <main className="bg-white border-2 border-zinc-100 rounded-[2rem] overflow-hidden shadow-sm">
        {!paginatedUsers.length ? (
          <div className="py-20 text-center text-zinc-400 uppercase text-[10px] font-black tracking-widest">
            No matching records found.
          </div>
        ) : (
          <>
            {/* 🖥️ DESKTOP VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse" role="grid">
                <thead>
                  <tr className="bg-zinc-50 border-b-2 border-zinc-100 italic">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Member Info
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Contact Details
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Auth Method
                    </th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">
                      Join Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-zinc-50">
                  {paginatedUsers.map((u) => (
                    <UserTableRow key={u._id} user={u} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* 📱 MOBILE VIEW */}
            <div className="md:hidden flex flex-col divide-y divide-zinc-100">
              {paginatedUsers.map((u) => (
                <UserMobileCard key={u._id} user={u} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* ✅ FIX 3: Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Helper Components ────────────────────────────────────

const UserTableRow = React.memo(({ user }) => (
  <tr className="hover:bg-zinc-50/50 transition-all group">
    <td className="p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white font-black text-lg overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            user.fullName?.[0]?.toUpperCase()
          )}
        </div>
        <div>
          <p className="text-sm font-black uppercase italic tracking-tight">
            {user.fullName}
          </p>
          <span className="text-[9px] font-bold text-zinc-400 uppercase bg-zinc-100 px-1.5 py-0.5 rounded-md">
            {user.role}
          </span>
        </div>
      </div>
    </td>
    <td className="p-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 truncate max-w-[180px]">
          <Mail
            size={14}
            className="text-zinc-300 shrink-0"
            aria-hidden="true"
          />
          {user.email}
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
          <Phone
            size={14}
            className="text-zinc-300 shrink-0"
            aria-hidden="true"
          />
          {user.phone || "N/A"}
        </div>
      </div>
    </td>
    <td className="p-6">
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full w-fit ${
          user.isGoogleUser
            ? "bg-blue-50 text-blue-600"
            : "bg-zinc-100 text-zinc-500"
        }`}
      >
        {user.isGoogleUser ? <ShieldCheck size={14} /> : <UserIcon size={14} />}
        <span className="text-[9px] font-black uppercase tracking-wider">
          {user.isGoogleUser ? "Google" : "Email"}
        </span>
      </div>
    </td>
    {/* ✅ FIX 2: Intl.DateTimeFormat — no new Date() on every render */}
    <td className="p-6 text-right font-black text-[10px] text-zinc-400 italic">
      {dateFormatter.format(new Date(user.createdAt))}
    </td>
  </tr>
));

const UserMobileCard = React.memo(({ user }) => (
  <div className="p-5 flex flex-col gap-4 active:bg-zinc-50 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white font-black text-lg overflow-hidden shrink-0 shadow-md">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            user.fullName?.[0]?.toUpperCase()
          )}
        </div>
        <div>
          <h2 className="text-sm font-black uppercase italic tracking-tight">
            {user.fullName}
          </h2>
          <p className="text-[9px] font-bold text-zinc-400 uppercase">
            Role: {user.role}
          </p>
        </div>
      </div>
      {user.isGoogleUser ? (
        <ShieldCheck size={18} className="text-blue-500" />
      ) : (
        <UserIcon size={18} className="text-zinc-300" />
      )}
    </div>
    <div className="bg-zinc-50 rounded-2xl p-4 space-y-2">
      <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-600">
        <Mail size={14} className="text-zinc-300 shrink-0" />
        <span className="truncate">{user.email}</span>
      </div>
      <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-600">
        <Phone size={14} className="text-zinc-300 shrink-0" />
        <span>{user.phone || "No phone provided"}</span>
      </div>
      <div className="flex items-center gap-3 text-[11px] font-bold text-zinc-400">
        <span>Joined: {dateFormatter.format(new Date(user.createdAt))}</span>
      </div>
    </div>
  </div>
));

export default UserManagement;
