import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-white" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-white" />;
      default:
        return <CheckCircle className="w-5 h-5 text-white" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.2 }}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${getBgColor()} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 w-[90%] max-w-md`}
      >
        <div className="flex items-center gap-2 flex-1">
          {getIcon()}
          <span className="text-sm md:text-base break-words">{message}</span>
        </div>
        <motion.button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 transition flex-shrink-0"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={18} />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast; 