// src/components/shipping/SavedAddresses.jsx

import React from "react";
import { ArrowRight } from "lucide-react";
import AddressCard from "./AddressCard";


const SavedAddresses = ({
  addresses,
  selectedAddressIndex,
  setSelectedAddressIndex,
  handleEditClick,
  submitHandler,
  isSubmitting,
}) => {
  return (
    <div
      className="space-y-3 animate-in fade-in"
      role="radiogroup"
      aria-label="Select delivery address"
    >
      {addresses.map((addr, index) => (
        <AddressCard
          key={addr._id || index}
          address={addr}
          selected={selectedAddressIndex === index}
          onSelect={() => setSelectedAddressIndex(index)}
          onEdit={(e) => handleEditClick(e, addr)}
        />
      ))}

      <div className="pt-2">
        <button
          type="button"
          onClick={submitHandler}
          disabled={isSubmitting}
          className="ship-submit"
        >
          Deliver Here
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default SavedAddresses;
