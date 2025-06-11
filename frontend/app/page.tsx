"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Send, Terminal } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function TerminalChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const assistantMessage: Message = {
        id: "",
        role: "assistant",
        content: "",
      };

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              const event = line.slice(7);

              if (event === "chatDetails") {
                continue;
              } else if (event === "textDelta") {
                continue;
              } else if (event === "streamComplete") {
                setIsLoading(false);
                continue;
              } else if (event === "error") {
                setIsLoading(false);
                continue;
              }
            } else if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.messageId && !assistantMessage.id) {
                  assistantMessage.id = data.messageId;
                  setMessages((prev) => [...prev, assistantMessage]);
                }

                if (data.content) {
                  assistantMessage.content += data.content;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: assistantMessage.content }
                        : msg
                    )
                  );
                }

                if (data.finalContent) {
                  assistantMessage.content = data.finalContent;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: data.finalContent }
                        : msg
                    )
                  );
                }
              } catch (error) {
                console.error("Error parsing SSE data:", error);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Terminal Header */}
      <div className="border-b border-green-400/30 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          <span className="text-green-300">aiterminal.chat</span>
        </div>
        <div className="text-green-300 text-sm">{currentTime}</div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-140px)]">
        {/* Welcome Message */}
        <div className="mb-4">
          <div className="text-green-300">{">"} Welcome to Terminal Chat</div>
          <div className="text-green-400/70 text-sm ml-2">
            Type your message and press Enter to chat
          </div>
        </div>

        {/* Messages */}
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            {message.role === "user" ? (
              <div className="flex items-start gap-2">
                <span className="text-green-300 shrink-0">
                  barja@terminal:~$
                </span>
                <span className="text-white break-words">
                  {message.content}
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <span className="text-blue-400 shrink-0">
                  gpt-4.1-nano@system:~$
                </span>
                <div className="text-green-400 break-words whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-blue-400">ai@system:~$</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-green-400/30 p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-green-300 shrink-0">barja@terminal:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your message..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-green-400/50 caret-green-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="text-green-400 hover:text-green-300 disabled:text-green-400/30 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Terminal cursor effect */}
      <style jsx>{`
        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }
        .terminal-cursor::after {
          content: "_";
          animation: blink 1s infinite;
        }
      `}</style>
    </div>
  );
}
