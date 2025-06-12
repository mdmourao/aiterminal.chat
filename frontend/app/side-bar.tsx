"use client";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

export function AppSidebarLoader() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return <>{isAuthenticated && <AppSidebar />}</>;
}
