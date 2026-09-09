// src/hooks/useShipping.js

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { saveShippingAddress } from "../features/cart/cartSlice";

import { addUserAddress, updateUserAddress } from "../features/auth/authSlice";
import { BLANK_FORM, pickFormFields } from "../utils/shippingConstants";
import { validateShippingForm } from "../utils/shippingValidation";

export const useShipping = ({ user, shippingAddress }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const savedAddresses = user?.addresses || [];

  const [showForm, setShowForm] = useState(false);

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  const [editingAddressId, setEditingAddressId] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState(() => pickFormFields(shippingAddress));

  // FIX: errors object, surfaced to AddressForm for inline messages.
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) return;

    if (savedAddresses.length > 0) {
      const defaultIndex = savedAddresses.findIndex((addr) => addr.isDefault);

      setSelectedAddressIndex(defaultIndex >= 0 ? defaultIndex : 0);

      setShowForm(false);
    } else {
      setShowForm(true);
    }
    // FIX: was [user] only — savedAddresses.length added so this re-runs
    // if the address list changes (e.g. after adding the first address)
    // without the `user` object reference itself changing.
  }, [user, savedAddresses.length]);

  // FIX: re-sync form if shippingAddress arrives/changes after mount
  // (e.g. populated later in the checkout flow from Redux).
  useEffect(() => {
    if (shippingAddress && !showForm) {
      setForm(pickFormFields(shippingAddress));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingAddress]);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // FIX: clear that field's error as soon as the user edits it
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleAddNew = () => {
    setForm(BLANK_FORM);
    setIsEditing(false);
    setEditingAddressId(null);
    setShowForm(true);
    setErrors({});
  };

  const handleEditClick = (e, address) => {
    e.stopPropagation();

    setForm(pickFormFields(address));

    setEditingAddressId(address._id);

    setIsEditing(true);

    setShowForm(true);
    setErrors({});
  };

  const submitHandler = async (e) => {
    if (e) e.preventDefault();

    // ---- Saved-address flow ----
    if (!showForm && savedAddresses.length > 0) {
      // FIX: guard against selectedAddressIndex being null/out of range
      if (
        selectedAddressIndex === null ||
        selectedAddressIndex === undefined ||
        !savedAddresses[selectedAddressIndex]
      ) {
        toast.error("Please select a delivery address");
        return;
      }

      const selected = savedAddresses[selectedAddressIndex];

      dispatch(
        saveShippingAddress({
          ...pickFormFields(selected),
          country: "India",
        }),
      );

      navigate("/placeorder");

      return;
    }

    // ---- New / edit address form flow ----
    const validationErrors = validateShippingForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // surface the first error as a toast too, for visibility
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (isEditing && editingAddressId) {
        await dispatch(
          updateUserAddress({
            id: editingAddressId,
            addressData: form,
          }),
        ).unwrap();

        toast.success("Address updated");
      } else {
        await dispatch(addUserAddress(form)).unwrap();

        toast.success("Address saved");
      }

      dispatch(
        saveShippingAddress({
          ...form,
          country: "India",
        }),
      );

      navigate("/placeorder");
    } catch (err) {
      // FIX: this catch block was completely missing before.
      // Without it, a failed save just silently re-enabled the button
      // with zero feedback to the user.
      const message =
        typeof err === "string"
          ? err
          : err?.message || "Couldn't save your address. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    setForm,

    showForm,
    setShowForm,

    selectedAddressIndex,
    setSelectedAddressIndex,

    savedAddresses,

    isSubmitting,
    errors,

    handleAddNew,
    handleEditClick,
    handleFormChange,
    submitHandler,

    isEditing,
  };
};
