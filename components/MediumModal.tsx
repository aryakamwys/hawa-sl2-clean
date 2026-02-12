"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface MediumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MediumModal({ isOpen, onClose }: MediumModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShow(true), 100);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center transform transition-all duration-500 ${show ? "scale-100 translate-y-0" : "scale-90 translate-y-4"}`}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Read Hawa on Medium</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              For more information checkout our medium article
            </p>
          </div>

          <a 
            href="https://medium.com/@hawaairinfo" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-3 bg-white text-black font-medium rounded-xl outline outline-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Read Article</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
