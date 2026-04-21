import React, { useState, useEffect, memo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { MapPin, Plus, Home, Briefcase, Edit2, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from "../../features/auth/authSlice";

const FORM_FIELDS = [
  "fullName",
  "phone",
  "pincode",
  "city",
  "state",
  "landmark",
  "address",
  "addressType",
];

const pickFormFields = (addr = {}) =>
  FORM_FIELDS.reduce(
    (acc, k) => {
      acc[k] = addr[k] ?? "";
      return acc;
    },
    { addressType: addr.addressType || "Home" },
  );

const BLANK_FORM = {
  fullName: "",
  phone: "",
  pincode: "",
  city: "",
  state: "",
  landmark: "",
  address: "",
  addressType: "Home",
};

const AddressesTab = memo(({ savedAddresses = [] }) => {
  const dispatch = useDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(BLANK_FORM);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const handleAddNew = useCallback(() => {
    setAddressForm(BLANK_FORM);
    setEditingAddressId(null);
    setIsModalOpen(true);
  }, []);

  const handleEditAddress = useCallback((addr) => {
    if (!addr._id) return toast.error("Cannot edit this address.");
    setAddressForm(pickFormFields(addr));
    setEditingAddressId(addr._id);
    setIsModalOpen(true);
  }, []);

  const handleSaveAddress = useCallback(
    (e) => {
      e.preventDefault();

      if (!addressForm.fullName.trim())
        return toast.error("Full name is required.");
      if (addressForm.phone.length !== 10)
        return toast.error("Enter a valid 10-digit mobile number.");
      if (addressForm.pincode.length !== 6)
        return toast.error("Enter a valid 6-digit pincode.");
      if (!addressForm.city.trim()) return toast.error("City is required.");
      if (!addressForm.state.trim()) return toast.error("State is required.");
      if (!addressForm.address.trim())
        return toast.error("Address is required.");

      const actionPromise = editingAddressId
        ? dispatch(
            updateUserAddress({
              id: editingAddressId,
              addressData: addressForm,
            }),
          ).unwrap()
        : dispatch(addUserAddress(addressForm)).unwrap();

      actionPromise
        .then(() => {
          toast.success(`Address ${editingAddressId ? "updated" : "saved"}!`);
          setIsModalOpen(false);
        })
        .catch((err) =>
          toast.error(
            err || `Failed to ${editingAddressId ? "update" : "add"} address.`,
          ),
        );
    },
    [addressForm, dispatch, editingAddressId],
  );

  const handleDeleteAddress = useCallback(
    (id) => {
      if (!id) return toast.error("Invalid address.");
      if (!window.confirm("Delete this address?")) return;

      dispatch(deleteUserAddress(id))
        .unwrap()
        .then(() => toast.success("Address deleted."))
        .catch((err) => toast.error(err || "Failed to delete address."));
    },
    [dispatch],
  );

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]:
        name === "phone" || name === "pincode"
          ? value.replace(/\D/g, "")
          : value,
    }));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black uppercase italic flex items-center gap-2">
          <MapPin size={20} className="text-zinc-400" aria-hidden="true" />
          Saved Addresses
        </h2>
        <button
          type="button"
          onClick={handleAddNew}
          aria-label="Add new address"
          className="bg-black text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-colors shadow-md outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          <Plus size={14} /> Add New
        </button>
      </div>

      {/* --- LISTING AREA --- */}
      {savedAddresses.length === 0 ? (
        <div className="py-20 text-center bg-zinc-50 rounded-[1.5rem] border border-dashed border-zinc-200">
          <MapPin size={40} className="mx-auto text-zinc-300 mb-4" />
          <p
            className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-4"
            role="status"
          >
            No addresses saved yet
          </p>
          <button
            type="button"
            onClick={handleAddNew}
            className="text-[10px] font-bold border-b border-black uppercase pb-1 outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 rounded-sm"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list">
          {savedAddresses.map((addr) => (
            <div
              key={addr._id}
              role="listitem"
              className="bg-white border border-zinc-200 p-5 rounded-[1.5rem] relative group hover:border-black transition-all shadow-sm flex flex-col justify-between"
            >
              {addr.isDefault && (
                <span className="absolute -top-3 left-5 bg-black text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                  Default
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-zinc-100 text-zinc-600 p-1.5 rounded-lg">
                      {addr.addressType === "Home" ? (
                        <Home size={14} />
                      ) : (
                        <Briefcase size={14} />
                      )}
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      {addr.addressType}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      aria-label={`Edit ${addr.addressType} address`}
                      onClick={() => handleEditAddress(addr)}
                      className="text-zinc-400 hover:text-black transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black rounded p-1"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${addr.addressType} address`}
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-black uppercase mb-1">
                  {addr.fullName}
                </h3>
                <p className="text-xs text-zinc-500 mb-3 font-medium">
                  +91 {addr.phone}
                </p>
                <address className="text-[11px] leading-relaxed text-zinc-600 mb-1 not-italic">
                  {addr.address}
                  {addr.landmark && (
                    <span className="block mt-1 text-zinc-400">
                      Near: {addr.landmark}
                    </span>
                  )}
                </address>
              </div>

              <p className="text-[11px] text-zinc-800 font-bold uppercase mt-4 pt-4 border-t border-zinc-100">
                {addr.city}, {addr.state} — {addr.pincode}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10">
            <div className="p-5 md:p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
              <h2
                id="modal-title"
                className="text-sm font-black uppercase italic tracking-widest"
              >
                {editingAddressId ? "Edit Address" : "Add New Address"}
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-white rounded-full border border-zinc-200 text-zinc-400 hover:text-black transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleSaveAddress}
              className="flex flex-col overflow-hidden flex-1"
              noValidate
            >
              <div className="p-5 md:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1">
                    <label
                      htmlFor="fullName"
                      className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 ml-1"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={addressForm.fullName}
                      onChange={handleFormChange}
                      className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:border-black focus:bg-white outline-none focus-visible:ring-2 focus-visible:ring-black"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label
                      htmlFor="phone"
                      className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 ml-1"
                    >
                      Mobile Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      maxLength={10}
                      required
                      value={addressForm.phone}
                      onChange={handleFormChange}
                      className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:border-black focus:bg-white outline-none focus-visible:ring-2 focus-visible:ring-black"
                    />
                  </div>

                  <div className="col-span-1 space-y-1">
                    <label
                      htmlFor="pincode"
                      className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 ml-1"
                    >
                      Pincode
                    </label>
                    <input
                      id="pincode"
                      name="pincode"
                      type="tel"
                      maxLength={6}
                      required
                      value={addressForm.pincode}
                      onChange={handleFormChange}
                      className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:border-black focus:bg-white outline-none focus-visible:ring-2 focus-visible:ring-black"
                    />
                  </div>

                  <div className="col-span-1 space-y-1">
                    <label
                      htmlFor="city"
                      className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 ml-1"
                    >
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={handleFormChange}
                      className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:border-black focus:bg-white outline-none focus-visible:ring-2 focus-visible:ring-black"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label
                      htmlFor="state"
                      className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 ml-1"
                    >
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={handleFormChange}
                      className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:border-black focus:bg-white outline-none focus-visible:ring-2 focus-visible:ring-black"
                    />
                  </div>

                  {/* 🔥 IMPROVED: Changed to textarea for better UX with long addresses */}
                  <div className="col-span-2 space-y-1">
                    <label
                      htmlFor="address"
                      className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 ml-1"
                    >
                      Flat / House No. / Street
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      required
                      rows={3}
                      value={addressForm.address}
                      onChange={handleFormChange}
                      className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:border-black focus:bg-white outline-none focus-visible:ring-2 focus-visible:ring-black resize-none"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label
                      htmlFor="landmark"
                      className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 ml-1"
                    >
                      Landmark{" "}
                      <span className="normal-case font-normal tracking-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="landmark"
                      name="landmark"
                      type="text"
                      value={addressForm.landmark}
                      onChange={handleFormChange}
                      className="w-full h-12 px-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:border-black focus:bg-white outline-none focus-visible:ring-2 focus-visible:ring-black"
                    />
                  </div>

                  <div className="col-span-2 space-y-2 mt-2">
                    <span
                      className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 ml-1 block"
                      id="addressTypeLabel"
                    >
                      Save As
                    </span>
                    <div
                      className="flex gap-4"
                      role="group"
                      aria-labelledby="addressTypeLabel"
                    >
                      {["Home", "Work"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          aria-pressed={addressForm.addressType === type}
                          onClick={() =>
                            setAddressForm((p) => ({ ...p, addressType: type }))
                          }
                          className={`flex-1 h-12 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all outline-none focus-visible:ring-2 focus-visible:ring-black ${
                            addressForm.addressType === type
                              ? "border-black bg-black text-white"
                              : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
                          }`}
                        >
                          {type === "Home" ? (
                            <Home size={14} />
                          ) : (
                            <Briefcase size={14} />
                          )}
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6 border-t border-zinc-100 shrink-0 bg-white">
                <button
                  type="submit"
                  className="w-full bg-black text-white h-14 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-800 transition-colors shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                  {editingAddressId ? "Update Address" : "Save New Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

AddressesTab.displayName = "AddressesTab";
export default AddressesTab;
