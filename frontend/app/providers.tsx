"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { SidebarProvider } from "@/components/ui/sidebar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SidebarProvider>{children}</SidebarProvider>
    </Provider>
  );
}
