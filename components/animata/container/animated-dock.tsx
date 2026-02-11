import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { Menu, X } from "lucide-react";

interface DockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

interface AnimatedDockProps {
  items: DockItem[];
  largeClassName?: string;
  smallClassName?: string;
}

export default function AnimatedDock({ items, largeClassName, smallClassName }: AnimatedDockProps) {
  return (
    <>
      <LargeDock items={items} className={largeClassName} />
      <SmallDock items={items} className={smallClassName} />
    </>
  );
}

const LargeDock = ({
  items,
  className,
}: {
  items: DockItem[];
  className?: string;
}) => {
  const mouseXPosition = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseXPosition.set(e.pageX)}
      onMouseLeave={() => mouseXPosition.set(Infinity)}
      className={cn(
        "mx-auto hidden items-center gap-2 rounded-full px-3 py-2 md:flex",
        "bg-white/60 backdrop-blur-2xl",
        "shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
        "border border-white/40",
        className,
      )}
    >
      {items.map((item) => (
        <DockIcon mouseX={mouseXPosition} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function DockIcon({
  mouseX,
  title,
  icon,
  href,
  active = false,
  onClick,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  href: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distanceFromMouse = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distanceFromMouse, [-100, 0, 100], [48, 56, 48]);
  const heightTransform = useTransform(distanceFromMouse, [-100, 0, 100], [48, 56, 48]);

  const width = useSpring(widthTransform, { mass: 0.1, stiffness: 200, damping: 15 });
  const height = useSpring(heightTransform, { mass: 0.1, stiffness: 200, damping: 15 });

  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link href={href} onClick={handleClick}>
      <motion.div
        ref={ref}
        style={{ width, height } as any}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-200",
          active
            ? "bg-[#005AE1]/15 text-[#005AE1] border-2 border-[#005AE1]"
            : "bg-gray-100/80 text-gray-500 hover:bg-white hover:border-2 hover:border-[#005AE1] hover:text-[#005AE1]",
          !active && "border-2 border-transparent"
        )}
      >
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 8, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 4, x: "-50%" }}
              className="absolute -top-14 left-1/2 z-50"
            >
              {/* Info Card */}
              <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl !px-4 !py-1 shadow-lg border-2 border-[#005AE1]/20">
                <span className="text-base font-semibold text-[#005AE1] whitespace-nowrap">
                  {title}
                </span>
                {/* Arrow pointer */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white/90" />
                <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-[#005AE1]/20" style={{ zIndex: -1 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center justify-center w-6 h-6">
          {icon}
        </div>
      </motion.div>
    </Link>
  );
}

const SmallDock = ({
  items,
  className,
}: {
  items: DockItem[];
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-3 flex flex-col items-center gap-2"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.8,
                  transition: { delay: index * 0.03 },
                }}
                transition={{ delay: (items.length - 1 - index) * 0.03 }}
              >
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                      setIsOpen(false);
                    }
                  }}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-all duration-200",
                    "bg-white/80 backdrop-blur-xl border border-white/50",
                    item.active
                      ? "text-[#005AE1]"
                      : "text-gray-500 hover:text-[#005AE1]"
                  )}
                >
                  <div className="h-5 w-5">{item.icon}</div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-white/60 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/40 text-gray-600 transition-all duration-200 hover:text-[#005AE1]"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>
    </div>
  );
};
