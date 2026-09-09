import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Pencil, Trash2, Eye, EyeOff, ImageOff } from "lucide-react";

import {
  deleteBanner,
  fetchAdminBanners,
  toggleBannerActive,
} from "../../features/banners/bannerSlice";
import BannerForm from "../../components/Admin/banners/BannerForm";

const Banners = () => {
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((state) => state.banners);

  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminBanners());
  }, [dispatch]);

  const openCreate = () => {
    setEditingBanner(null);
    setShowForm(true);
  };

  const openEdit = (banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBanner(null);
  };

  const handleDelete = (id) => {
    dispatch(deleteBanner(id));
    setConfirmDeleteId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase italic">Home Banners</h1>
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
            Manage what shows on the homepage hero
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {isLoading ? (
        <p className="text-[12px] font-bold text-zinc-400 uppercase">
          Loading...
        </p>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-200 rounded-lg">
          <ImageOff size={32} className="text-zinc-300 mb-4" />
          <p className="text-[12px] font-bold text-zinc-400 uppercase">
            No banners yet — homepage is using the default static image
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {list.map((banner) => (
            <div
              key={banner._id}
              className="flex items-center gap-5 border-2 border-zinc-100 rounded-lg p-4 hover:border-zinc-300 transition-colors"
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-32 h-20 object-cover rounded shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      banner.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {banner.isActive ? "Live" : "Hidden"}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">
                    Order: {banner.order}
                  </span>
                </div>
                <h3 className="text-sm font-black uppercase truncate">
                  {banner.title || "Untitled"} {banner.subtitle}
                </h3>
                <p className="text-[11px] font-bold text-zinc-500 truncate">
                  Links to:{" "}
                  {banner.product?.productName || "⚠ Product not found"}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() =>
                    dispatch(
                      toggleBannerActive({
                        id: banner._id,
                        isActive: !banner.isActive,
                      }),
                    )
                  }
                  title={
                    banner.isActive ? "Hide from homepage" : "Show on homepage"
                  }
                  className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-zinc-200 hover:border-black transition-colors"
                >
                  {banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => openEdit(banner)}
                  title="Edit"
                  className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-zinc-200 hover:border-black transition-colors"
                >
                  <Pencil size={16} />
                </button>

                {confirmDeleteId === banner._id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="px-3 py-2 bg-red-600 text-white text-[9px] font-black uppercase rounded"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-2 text-[9px] font-black uppercase text-zinc-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(banner._id)}
                    title="Delete"
                    className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-zinc-200 hover:border-red-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BannerForm editingBanner={editingBanner} onClose={closeForm} />
      )}
    </div>
  );
};

export default Banners;
