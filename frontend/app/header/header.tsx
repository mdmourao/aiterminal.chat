"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Moon, Sun, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

const Header = () => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`p-1 flex items-center justify-between border-b border-gray-200`}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>
      <div className="flex items-center gap-2 p-4 ">
        <Terminal className="w-5 h-5" />
        <span className={`text-gray-800`}>aiterminal.chat</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`text-gray-600 text-sm`}>{currentTime}</div>
        <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
          <Sun className="w-5 h-5 text-yellow-300" />
          <Moon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default Header;
