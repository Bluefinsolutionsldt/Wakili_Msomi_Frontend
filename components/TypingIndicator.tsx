"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Scale } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex items-start space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 max-w-6xl mx-auto group">
      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-gray-700/30 flex-shrink-0">
        <AvatarImage src="/wakilimsomi.jpeg" alt="Wakili Msomi" />
        <AvatarFallback className="bg-gradient-to-br from-[#FFD45E] to-[#e6bf55] text-black">
          <Scale className="h-3 w-3 sm:h-4 sm:w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1 sm:space-y-2 items-start flex flex-col">
        <div className="flex items-center space-x-2">
          <span className="text-xs sm:text-sm font-medium text-gray-300 pr-3">
            Wakili Msomi
          </span>
        </div>

        <div className="relative max-w-[85%] sm:max-w-[80%] bg-gray-800/60 backdrop-blur-sm rounded-2xl rounded-tl-md px-3 sm:px-4 py-2 sm:py-3 border border-gray-700/50">
          <div className="flex items-center space-x-1">
            <motion.div
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0,
              }}
            />
            <motion.div
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.2,
              }}
            />
            <motion.div
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.4,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
