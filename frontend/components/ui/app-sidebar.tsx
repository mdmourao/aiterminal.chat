import { Terminal, Sparkles } from "lucide-react";

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
import { Badge } from "./badge";
import { Progress } from "./progress";
import { Button } from "./button";

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

  const refetchUserInfo = () => {
    fetch("/api/v1/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          dispatch({
            type: "auth/updateUserInfo",
            payload: { user: data.data },
          });
          toast.success("Messages information updated successfully.");
        }
      })
      .catch(() => {});
  };

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

  if (!user) {
    return <></>;
  }

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
                  {user.name}

                  <Badge>{user.subscription.plan}</Badge>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  {user.subscription.plan === "free" ? (
                    <form
                      action="/api/v1/subscriptions/create-checkout-session"
                      method="POST"
                      className="flex items-center gap-2"
                    >
                      <input
                        type="hidden"
                        name="lookup_key"
                        value="aiterminal.chat-pricing1"
                      />
                      <Sparkles />
                      <button id="checkout-and-portal-button" type="submit">
                        Upgrade to Pro ($7.99/mo)
                      </button>
                    </form>
                  ) : (
                    <form
                      action="/api/v1/subscriptions/create-portal-session"
                      method="POST"
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="cancel" value="true" />
                      <Sparkles />
                      <button id="cancel-subscription-button" type="submit">
                        Manage Subscription
                      </button>
                    </form>
                  )}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem disabled>
                  <div className="w-full max-w-sm">
                    <div className="mb-2 text-sm font-medium text-gray-700">
                      {user.subscription.creditsQuota -
                        user.subscription.credits}
                      /{user.subscription.creditsQuota} Free Messages
                    </div>
                    <Progress
                      value={
                        ((user.subscription.creditsQuota -
                          user.subscription.credits) /
                          user.subscription.creditsQuota) *
                        100
                      }
                      className="w-full"
                    />
                    <div className="mb-2 text-sm font-medium text-gray-700">
                      {user.subscription.premiumCreditsQuota -
                        user.subscription.premiumCredits}
                      /{user.subscription.premiumCreditsQuota} Premium Messages
                    </div>
                    <Progress
                      value={
                        ((user.subscription.premiumCreditsQuota -
                          user.subscription.premiumCredits) /
                          user.subscription.premiumCreditsQuota) *
                        100
                      }
                      className="w-full"
                    />
                  </div>
                </DropdownMenuItem>

                <Button
                  className="flex justify-center m-2"
                  variant="outline"
                  onClick={refetchUserInfo}
                >
                  Refresh Messages
                </Button>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={async () => {
                    const authClient = createAuthClient({
                      baseURL: process.env.BASE_URL,
                    });

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
