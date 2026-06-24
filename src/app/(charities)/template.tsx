"use client";

import { m, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { slideUp } from "@/lib/motion";

export default function RouteTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <AnimatePresence mode="wait">
      <m.div
        key={pathname}
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full flex-1 flex flex-col"
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
