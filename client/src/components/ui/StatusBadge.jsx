import React from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  RotateCcw,
  Banknote,
  AlertTriangle,
} from "lucide-react";

export default function StatusBadge({ status, className = "" }) {
 
  const safeStatus = status ? status.trim() : "Unknown";

  const getBadgeConfig = (statusName) => {
    switch (statusName?.toLowerCase()) {
      case "delivered":
        return {
          color: "bg-green-50 text-green-600 border-green-200",
          icon: CheckCircle2,
        };
      case "processing":
        return {
          color: "bg-orange-50 text-orange-600 border-orange-200",
          icon: Clock,
        };
      case "shipped":
        return {
          color: "bg-blue-50 text-blue-600 border-blue-200",
          icon: Truck,
        };
      case "cancelled":
        return {
          color: "bg-red-50 text-red-600 border-red-200",
          icon: XCircle,
        };
      case "pending":
        return {
          color: "bg-orange-50 text-orange-600 border-orange-200",
          icon: AlertTriangle,
        };
      case "approved":
        return {
          color: "bg-blue-50 text-blue-600 border-blue-200",
          icon: CheckCircle2,
        };
      case "refunded":
        return {
          color: "bg-purple-50 text-purple-600 border-purple-200",
          icon: Banknote,
        };
      case "rejected":
        return {
          color: "bg-red-50 text-red-600 border-red-200",
          icon: XCircle,
        };
      case "return requested":
        return {
          color: "bg-orange-500 text-white border-orange-600",
          icon: RotateCcw,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-500 border-gray-200",
          icon: Clock,
        };
    }
  };

  const { color, icon: Icon } = getBadgeConfig(safeStatus);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-solid shadow-sm ${color} ${className}`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {safeStatus}
    </span>
  );
}
