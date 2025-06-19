import { motion } from "framer-motion";
import { X } from "lucide-react";

export const CustomLogo = () => (
  <div className="flex items-center gap-1.5">
    <div className="w-6 h-6 bg-gray-300"></div>
    <div className="flex flex-col gap-1.5">
      <div className="w-6 h-1 bg-gray-300"></div>
      <div className="w-4 h-1 bg-gray-300"></div>
    </div>
  </div>
);

export const ToolkitItem = ({ icon, name, delay }) => (
  <motion.div
    className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-800/50 border border-gray-700/50"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ scale: 1.05, backgroundColor: "rgba(55, 65, 81, 0.7)" }}
  >
    <div className="w-10 h-10 text-yellow-400">{icon}</div>
    <span className="font-body font-bold text-sm text-gray-300">{name}</span>
  </motion.div>
);

export const FullscreenImage = ({ src, onClose }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.img
      src={src}
      className="max-w-[90vw] max-h-[90vh] object-contain"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
    />
    <button
      onClick={onClose}
      className="absolute top-6 right-6 text-white hover:text-yellow-400"
    >
      <X size={32} />
    </button>
  </motion.div>
);
