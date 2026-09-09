import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchCurrentUser } from "../features/auth/authSlice";

import SEO from "../components/SEO";

import { ChevronLeft, Package, Plus, Loader2, ArrowRight } from "lucide-react";
import { useShipping } from "../hooks/useShipping";
import { usePincode } from "../hooks/usePincode";
import CheckoutStepper from "../components/shipping/CheckoutStepper";
import SavedAddresses from "../components/shipping/SavedAddresses";
import AddressForm from "../components/shipping/AddressForm";
import "../styles/shipping.css";

export default function Shipping() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { shippingAddress } = useSelector((state) => state.cart);

  const { user, isLoading: userLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  const {
    form,
    setForm,

    showForm,
    setShowForm,

    savedAddresses,

    selectedAddressIndex,
    setSelectedAddressIndex,

    isSubmitting,

    handleAddNew,
    handleEditClick,
    handleFormChange,
    submitHandler,

    isEditing,
  } = useShipping({
    user,
    shippingAddress,
  });

  const { handlePincodeChange, pinSuccess, isFetchingPin } =
    usePincode(setForm);

  const ctaLabel =
    !showForm && savedAddresses.length > 0
      ? "Deliver Here"
      : isEditing
        ? "Update & Continue"
        : "Save & Continue";

  if (userLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={36} className="animate-spin text-black" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-zinc-50 text-black pb-28 md:pb-0">
        <SEO
          title="Shipping"
          description="Provide your delivery details securely."
        />

        {/* Mobile Header */}

        <div className="md:hidden flex items-center px-4 py-4 border-b border-zinc-100 sticky top-0 bg-white z-40">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-zinc-100"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="ml-3">
            <h2 className="text-[12px] font-black uppercase tracking-[0.2em]">
              Delivery Details
            </h2>

            <p className="text-[10px] text-zinc-400 font-medium">Step 2 of 3</p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-6 md:py-12">
          <div className="max-w-2xl mx-auto">
            <CheckoutStepper />

            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              {/* Header */}

              <div className="px-6 md:px-10 py-5 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h1 className="text-base font-black uppercase italic tracking-tight flex items-center gap-2">
                    <Package size={16} />
                    Delivery Details
                  </h1>

                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                    Dispatched from our in-house workshop
                  </p>
                </div>

                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      showForm ? setShowForm(false) : handleAddNew()
                    }
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white px-3 py-2 rounded-lg"
                  >
                    {showForm ? (
                      "← Saved"
                    ) : (
                      <>
                        <Plus size={11} />
                        Add New
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Content */}

              <div className="px-6 md:px-10 py-6">
                {!showForm && savedAddresses.length > 0 ? (
                  <SavedAddresses
                    addresses={savedAddresses}
                    selectedAddressIndex={selectedAddressIndex}
                    setSelectedAddressIndex={setSelectedAddressIndex}
                    handleEditClick={handleEditClick}
                    submitHandler={submitHandler}
                    isSubmitting={isSubmitting}
                  />
                ) : (
                  <AddressForm
                    form={form}
                    setForm={setForm}
                    handleFormChange={handleFormChange}
                    handlePincodeChange={handlePincodeChange}
                    pinSuccess={pinSuccess}
                    isFetchingPin={isFetchingPin}
                    submitHandler={submitHandler}
                    isSubmitting={isSubmitting}
                    ctaLabel={ctaLabel}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom CTA */}

      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-zinc-100 px-4 py-4 z-50">
        <button
          onClick={submitHandler}
          disabled={isSubmitting}
          className="ship-submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              {ctaLabel}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </>
  );
}
