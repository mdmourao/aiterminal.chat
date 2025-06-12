"use client";
import { useDispatch, useSelector } from "react-redux";
import Chat from "./chat/chat";
import Header from "./header/header";
import { AppDispatch, RootState } from "@/store";
import { createAuthClient } from "better-auth/client";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      dispatch({ type: "auth/loginRequest" });

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
              type: "auth/loginSuccess",
              payload: { user: data.data },
            });
          } else {
            dispatch({
              type: "auth/loginFailure",
              payload: { error: "User not found" },
            });
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          dispatch({
            type: "auth/loginFailure",
            payload: { error: error.message },
          });
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen flex flex-col relative">
        <div
          className={isAuthenticated ? "" : "blur-[1px] pointer-events-none"}
        >
          <Header />
          <Chat />
        </div>

        {!isAuthenticated && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <button
              className="bg-white text-gray-800 px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100"
              onClick={() => {
                const authClient = createAuthClient();

                (async () => {
                  await authClient.signIn.social({
                    provider: "google",
                    callbackURL: window.location.origin,
                  });
                })();
              }}
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </>
  );
}
