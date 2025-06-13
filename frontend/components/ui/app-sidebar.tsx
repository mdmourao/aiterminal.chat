import { Terminal } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import Image from "next/image";
import { createAuthClient } from "better-auth/client";
import { useEffect, useState } from "react";
import { Chat } from "@/app/models/chat";
import { toast } from "sonner";
import Link from "next/link";
import { clearWarning } from "@/store/warningSlice";
import StripeComponent from "@/app/stripe/stripe";

export function AppSidebar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();
  const [chats, setChats] = useState<Chat[]>([]);

  const warning = useSelector((state: RootState) => state.warning.message);

  useEffect(() => {
    fetchChats();
    dispatch(clearWarning());
  }, [warning, dispatch]);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    fetch("/api/v1/chats")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        return res.json();
      })
      .then(({ data }) => {
        setChats(data);
      })
      .catch((error) => {
        console.error("error getting chats", error);
        toast.error("Failed to load chats. Please try again later.");
      });
  };
  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex items-center gap-2 p-4 ">
          <Terminal className="w-5 h-5" />
          <span className={`text-gray-800`}>aiterminal.chat</span>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <Link href={`/?chat_id=${item.id}`}>
                      {item.title
                        ? item.title
                        : item.messages.length > 0
                        ? item.messages[0].content.substring(0, 20) + "..."
                        : "Empty Chat"}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarContent>
          <StripeComponent></StripeComponent>
        </SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Image
                    src={user?.image || "/default-avatar.png"}
                    className="w-6 h-6 rounded-full ml-2"
                    width={24}
                    height={24}
                    alt="User Avatar"
                  />
                  {user?.name}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    const authClient = createAuthClient();
                    await authClient.signOut();
                    dispatch({
                      type: "auth/logout",
                    });
                  }}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
