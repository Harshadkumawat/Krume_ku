// src/hooks/usePincode.js

import { useState } from "react";
import { toast } from "react-toastify";

export const usePincode = (setForm) => {
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);

  const handlePincodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);

    setForm((prev) => ({
      ...prev,
      pincode: value,
    }));

    setPinSuccess(false);

    if (value.length !== 6) return;

    setIsFetchingPin(true);

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${value}`,
      );

      const data = await response.json();

      if (data[0]?.Status === "Success") {
        const office = data[0].PostOffice[0];

        setForm((prev) => ({
          ...prev,
          city: office.District,
          state: office.State,
        }));

        setPinSuccess(true);

        toast.success("City & State auto-filled");
      } else {
        toast.error("Invalid pincode");

        setForm((prev) => ({
          ...prev,
          city: "",
          state: "Maharashtra",
        }));
      }
    } catch (error) {
      toast.error("Unable to fetch pincode");
    } finally {
      setIsFetchingPin(false);
    }
  };

  return {
    handlePincodeChange,
    isFetchingPin,
    pinSuccess,
  };
};
