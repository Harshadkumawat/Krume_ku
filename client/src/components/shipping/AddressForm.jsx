// src/components/shipping/AddressForm.jsx

import React from "react";

import {
  User,
  Phone,
  MapPin,
  Landmark,
  Home,
  Briefcase,
  Loader2,
  Check,
  ArrowRight,
} from "lucide-react";
import StateDropdown from "./StateDropdown";

// Small reusable error line — keeps the JSX below readable
const FieldError = ({ message }) =>
  message ? (
    <p className="text-[11px] font-semibold text-red-500 mt-1">{message}</p>
  ) : null;

const AddressForm = ({
  form,
  setForm,
  handleFormChange,
  handlePincodeChange,
  pinSuccess,
  isFetchingPin,
  submitHandler,
  isSubmitting,
  ctaLabel,
  errors = {}, // FIX: now consumed from useShipping
}) => {
  return (
    <form
      onSubmit={submitHandler}
      className="grid grid-cols-1 md:grid-cols-2 gap-5"
      noValidate
    >
      {/* Full Name */}

      <div>
        <label htmlFor="fullName">Full Name</label>

        <div className="relative">
          <User
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />

          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="e.g. Harshad Kumawat"
            value={form.fullName}
            onChange={handleFormChange}
            aria-invalid={!!errors.fullName}
            className={`ship-input ${errors.fullName ? "input-error" : ""}`}
          />
        </div>
        <FieldError message={errors.fullName} />
      </div>

      {/* Phone */}

      <div>
        <label htmlFor="phone">Phone</label>

        <div className="relative">
          <Phone
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />

          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            value={form.phone}
            maxLength={10}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                phone: e.target.value.replace(/\D/g, ""),
              }))
            }
            aria-invalid={!!errors.phone}
            className={`ship-input ${errors.phone ? "input-error" : ""}`}
          />
        </div>
        <FieldError message={errors.phone} />
      </div>

      {/* Pincode */}

      <div>
        <label htmlFor="pincode" className="flex gap-2">
          Pincode
          {isFetchingPin && (
            <>
              <Loader2 size={10} className="animate-spin" />
              Fetching...
            </>
          )}
          {pinSuccess && (
            <>
              <Check size={10} />
              Auto Filled
            </>
          )}
        </label>

        <div className="relative">
          <MapPin
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />

          <input
            id="pincode"
            name="pincode"
            type="text"
            inputMode="numeric"
            placeholder="6-digit pincode"
            maxLength={6}
            value={form.pincode}
            onChange={handlePincodeChange}
            aria-invalid={!!errors.pincode}
            className={`ship-input ${errors.pincode ? "input-error" : ""}`}
          />
        </div>
        <FieldError message={errors.pincode} />
      </div>

      {/* City */}

      <div>
        <label htmlFor="city">City</label>

        <input
          id="city"
          name="city"
          type="text"
          placeholder="City"
          value={form.city}
          onChange={handleFormChange}
          aria-invalid={!!errors.city}
          className={`ship-input no-icon ${pinSuccess ? "autofilled" : ""} ${
            errors.city ? "input-error" : ""
          }`}
        />
        <FieldError message={errors.city} />
      </div>

      {/* State */}

      <div>
        <StateDropdown
          value={form.state}
          autoFilled={pinSuccess}
          onChange={(state) =>
            setForm((prev) => ({
              ...prev,
              state,
            }))
          }
        />
        <FieldError message={errors.state} />
      </div>

      {/* Landmark */}

      <div>
        <label htmlFor="landmark">Landmark (optional)</label>

        <div className="relative">
          <Landmark
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />

          <input
            id="landmark"
            name="landmark"
            type="text"
            placeholder="Nearby landmark"
            value={form.landmark}
            onChange={handleFormChange}
            className="ship-input"
          />
        </div>
      </div>

      {/* Address */}

      <div className="md:col-span-2">
        <label htmlFor="address">Address</label>

        <div className="relative">
          <MapPin
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />

          <input
            id="address"
            name="address"
            type="text"
            placeholder="House no., street, area"
            value={form.address}
            onChange={handleFormChange}
            aria-invalid={!!errors.address}
            className={`ship-input ${errors.address ? "input-error" : ""}`}
          />
        </div>
        <FieldError message={errors.address} />
      </div>

      {/* Address Type */}

      <div className="md:col-span-2 flex gap-3">
        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              addressType: "Home",
            }))
          }
          className={`type-btn ${form.addressType === "Home" ? "active" : ""}`}
        >
          <Home size={14} />
          Home
        </button>

        <button
          type="button"
          onClick={() =>
            setForm((prev) => ({
              ...prev,
              addressType: "Work",
            }))
          }
          className={`type-btn ${form.addressType === "Work" ? "active" : ""}`}
        >
          <Briefcase size={14} />
          Work
        </button>
      </div>

      <div className="md:col-span-2">
        <button type="submit" disabled={isSubmitting} className="ship-submit">
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
    </form>
  );
};

export default AddressForm;
