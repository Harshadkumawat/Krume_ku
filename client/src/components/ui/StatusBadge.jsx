import React from "react";
import { motion } from "framer-motion";
import {
  CircleCheck as CheckCircle2,
  Clock,
  Circle as XCircle,
  Truck,
  RotateCcw,
  Banknote,
  TriangleAlert as AlertTriangle,
} from "lucide-react";

export default function StatusBadge({ status, className = "" }) {
  const safeStatus = status ? status.trim() : "Unknown";

  const getBadgeConfig = (statusName) => {
    switch (statusName?.toLowerCase()) {
      case "delivered":
        return {
          color:
            "bg-green-50/80 text-green-700 border-green-300 hover:border-green-400 shadow-green-100",
          icon: CheckCircle2,
        };
      case "processing":
        return {
          color:
            "bg-amber-50/80 text-amber-700 border-amber-300 hover:border-amber-400 shadow-amber-100",
          icon: Clock,
        };
      case "shipped":
        return {
          color:
            "bg-blue-50/80 text-blue-700 border-blue-300 hover:border-blue-400 shadow-blue-100",
          icon: Truck,
        };
      case "cancelled":
        return {
          color:
            "bg-red-50/80 text-red-700 border-red-300 hover:border-red-400 shadow-red-100",
          icon: XCircle,
        };
      case "pending":
        return {
          color:
            "bg-amber-50/80 text-amber-700 border-amber-300 hover:border-amber-400 shadow-amber-100",
          icon: AlertTriangle,
        };
      case "approved":
        return {
          color:
            "bg-blue-50/80 text-blue-700 border-blue-300 hover:border-blue-400 shadow-blue-100",
          icon: CheckCircle2,
        };
      case "refunded":
        return {
          color:
            "bg-cyan-50/80 text-cyan-700 border-cyan-300 hover:border-cyan-400 shadow-cyan-100",
          icon: Banknote,
        };
      case "rejected":
        return {
          color:
            "bg-red-50/80 text-red-700 border-red-300 hover:border-red-400 shadow-red-100",
          icon: XCircle,
        };
      case "return requested":
        return {
          color:
            "bg-orange-500/90 text-white border-orange-600 hover:border-orange-700 shadow-orange-500/30",
          icon: RotateCcw,
        };
      default:
        return {
          color:
            "bg-gray-100/80 text-gray-700 border-gray-300 hover:border-gray-400 shadow-gray-100",
          icon: Clock,
        };
    }
  };

  const { color, icon: Icon } = getBadgeConfig(safeStatus);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 border-solid shadow-sm hover:shadow-md transition-all ${color} ${className}`}
    >
      <Icon size={13} strokeWidth={2.5} />
      {safeStatus}
    </motion.span>
  );
}
