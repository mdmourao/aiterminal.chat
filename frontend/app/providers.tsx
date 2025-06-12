"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SidebarProvider>{children}</SidebarProvider>
      <Toaster position="top-right" />
    </Provider>
  );
}
