"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TutorialStep {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

export interface TutorialNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TutorialStep[];
  currentStep?: number;
  title?: string;
  className?: string;
}

export function TutorialNotification({
  isOpen,
  onClose,
  steps,
  currentStep = 0,
  title = "Tutorial",
  className,
}: TutorialNotificationProps) {
  const step = steps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && step && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Card */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className={cn(
                "relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl pointer-events-auto",
                "border border-gray-100",
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  {step.icon && (
                    <motion.div
                      key={`icon-${currentStep}`}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                    >
                      {step.icon}
                    </motion.div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {title} • Step {currentStep + 1} of {steps.length}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                <motion.div
                  key={`content-${currentStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="text-gray-700"
                >
                  {step.description}
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="px-6 pb-4">
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "h-1 flex-1 origin-left rounded-full",
                        index <= currentStep
                          ? "bg-blue-500"
                          : "bg-gray-200"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                >
                  Skip
                </motion.button>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {}}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                    >
                      Previous
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {}}
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
                      currentStep < steps.length - 1
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-green-500 hover:bg-green-600"
                    )}
                  >
                    {currentStep < steps.length - 1 ? "Next" : "Got it!"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Simple version with auto-play functionality
export interface SimpleTutorialNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  title: string;
  description: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
  className?: string;
  detailedDescription?: string; // For expanded explanation
}

export function SimpleTutorialNotification({
  isOpen,
  onClose,
  icon,
  title,
  description,
  autoClose = false,
  autoCloseDelay = 5000,
  className,
  detailedDescription,
}: SimpleTutorialNotificationProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -50, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, y: -10, scale: 0.95 }}
          transition={{
            delay: 0.2,
            type: "spring",
            stiffness: 100,
            damping: 15,
            duration: 0.5,
          }}
          className={cn(
            "fixed top-6 left-6 z-50 mx-auto max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl",
            "border-2 border-blue-500/20",
            className
          )}
          role="alert"
          aria-live="polite"
        >
          <div className="p-5 relative">
            {/* Info button in top left */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowDetails(!showDetails)}
              className="absolute -top-2 -left-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-bold shadow-lg hover:bg-blue-600 transition-colors z-10"
              title="Klik untuk penjelasan lebih lanjut"
            >
              ?
            </motion.button>

            {/* Icon and Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.4,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="mb-4 flex items-center gap-3"
            >
              {icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl">
                  {icon}
                </div>
              )}
              <div>
                <h4 className="font-bold text-gray-900">{title}</h4>
                <p className="text-xs text-gray-500">Tutorial</p>
              </div>

              <button
                onClick={onClose}
                className="ml-auto rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.6,
                duration: 0.4,
              }}
              className="text-sm text-gray-700 leading-relaxed"
            >
              {description}
            </motion.div>

            {/* Detailed explanation - appears when "?" is clicked */}
            <AnimatePresence>
              {showDetails && detailedDescription && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="text-sm text-gray-600 leading-relaxed"
                  >
                    {detailedDescription}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress indicator for auto-close */}
            {autoClose && (
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                className="mt-4 h-1 origin-left bg-blue-500 rounded-full"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
