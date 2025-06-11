"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Send, Terminal, Sun, Moon, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

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
  const [selectedModel, setSelectedModel] = useState("gpt-4.1-nano");
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedModels = [
    {
      group: "Gemini Models",
      models: [
        {
          value: "gemini-2.5-flash",
          label: "Gemini 2.5 flash",
          provider: "gemini",
          premium: false,
        },
        {
          value: "gemini-2.5-pro",
          label: "Gemini 2.5 pro",
          provider: "gemini",
          premium: false,
        },
      ],
    },
    {
      group: "OpenAI Models",
      models: [
        {
          value: "o4-mini",
          label: "o4 mini",
          provider: "openai",
          premium: false,
        },
        {
          value: "gpt-4.1-nano",
          label: "4.1 nano",
          provider: "openai",
          premium: false,
        },
        {
          value: "o3-mini",
          label: "o3 mini",
          provider: "openai",
          premium: false,
        },
        {
          value: "o3",
          label: "o3",
          provider: "openai",
          premium: true,
        },
      ],
    },
    {
      group: "Claude Models",
      models: [
        { value: "", label: "4 sonnet", provider: "claude", premium: true },
        {
          value: "",
          label: "4 sonnet reasoning",
          provider: "claude",
          premium: true,
        },
      ],
    },
    {
      group: "Grok Models",
      models: [
        { value: "grok-3", label: "3", provider: "grok", premium: true },
        {
          value: "grok-3-mini",
          label: "3 mini",
          provider: "grok",
          premium: false,
        },
      ],
    },
    {
      group: "Deepseek Models",
      models: [
        {
          value: "deepseek-reasoner",
          label: "v3",
          provider: "deepseek",
          premium: false,
        },
        {
          value: "deepseek-reasoner-r1",
          label: "r1",
          provider: "deepseek",
          premium: false,
        },
      ],
    },
  ];
  const flatModels = groupedModels.flatMap((g) => g.models);
  const totalModels = flatModels.length;

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

  useEffect(() => {
    setShowModelMenu(
      input.trim().toLowerCase().startsWith("model:") ||
        input.trim().toLowerCase().startsWith("m:") ||
        input.trim().toLowerCase().startsWith("models:")
    );
  }, [input]);

  useEffect(() => {
    setHighlightedIndex(showModelMenu ? 0 : -1);
  }, [showModelMenu]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    } else {
      const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setTheme(prefers);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

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
          model: selectedModel,
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

  const resizeTextarea = () => {
    const ta = inputRef.current;
    if (ta) {
      ta.style.height = "auto";
      const maxHeight = 200;
      ta.style.height = Math.min(ta.scrollHeight, maxHeight) + "px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showModelMenu) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => (i + 1) % totalModels);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => (i - 1 + totalModels) % totalModels);
        return;
      }
      if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        const m = flatModels[highlightedIndex];
        setSelectedModel(m.value);
        setInput("");
        setShowModelMenu(false);
        inputRef.current?.focus();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowModelMenu(false);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen font-mono overflow-hidden ${
        theme === "dark" ? "bg-black text-green-600" : "bg-white text-black"
      }`}
    >
      {/* Terminal Header */}
      <div
        className={`border-b p-4 flex items-center justify-between ${
          theme === "dark" ? "border-green-600/30" : "border-gray-300"
        }`}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          <span
            className={`${
              theme === "dark" ? "text-green-500" : "text-gray-800"
            }`}
          >
            aiterminal.chat
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`${
              theme === "dark" ? "text-green-300" : "text-gray-600"
            } text-sm`}
          >
            {currentTime}
          </div>
          <button
            onClick={toggleTheme}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Welcome Message */}
        <div className="mb-4">
          <div className="text-green-500">{">"} Welcome to Terminal Chat</div>
          <div className="text-green-500 text-sm ml-2">
            Type your message and press Enter to chat
          </div>
        </div>

        {/* Messages */}
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            {message.role === "assistant" ? (
              <div className="flex items-start gap-2">
                <span className="text-blue-400 shrink-0">
                  gpt-4.1-nano@system:~$
                </span>
                <div
                  className={`${
                    theme === "dark" ? "text-white" : "text-black"
                  } break-words whitespace-pre-wrap`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        // local copied state for animation & icon swap
                        const [copied, setCopied] = useState(false);
                        if (!inline && match) {
                          return (
                            <div className="relative group">
                              <SyntaxHighlighter
                                style={tomorrow}
                                language={match[1]}
                                PreTag="div"
                                {...props}
                              >
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    String(children)
                                  );
                                  setCopied(true);
                                  setTimeout(() => setCopied(false), 1500);
                                }}
                                className={`absolute top-2 right-2 flex items-center justify-center p-1 rounded text-xs transition-all duration-300
                            ${
                              copied
                                ? "bg-green-500 text-white shadow-[0_0_8px_rgba(0,255,0,0.7)] animate-pulse"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 group-hover:bg-gray-300 dark:group-hover:bg-gray-600"
                            }`}
                              >
                                {copied ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  "Copy"
                                )}
                              </button>
                            </div>
                          );
                        }
                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <span
                  className={`${
                    theme === "dark" ? "text-green-500" : "text-green-500"
                  } shrink-0`}
                >
                  {selectedModel}@terminal:~$
                </span>
                <span
                  className={`${
                    theme === "dark" ? "text-white" : "text-black"
                  } break-words`}
                >
                  {message.content}
                </span>
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-green-600/30 p-4 relative">
        <form onSubmit={handleSubmit} className="flex items-start gap-2">
          <span
            className={`${
              theme === "dark" ? "text-green-500" : "text-green-500"
            } shrink-0`}
          >
            {selectedModel}@terminal:~$
          </span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              resizeTextarea();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter your message..."
            disabled={isLoading}
            rows={3}
            className={`flex-1 bg-transparent border-none outline-none ${
              theme === "dark"
                ? "text-white placeholder-white-200/50"
                : "text-black placeholder-gray-500"
            } caret-green-400 resize-none max-h-[360px] overflow-y-auto`}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`${
              theme === "dark"
                ? "text-green-600 hover:text-green-500 disabled:text-green-600/30"
                : "text-green-600 hover:text-green-500 disabled:text-green-600/30"
            } transition-colors`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {showModelMenu && (
          <div className="absolute left-20 bottom-16 bg-white dark:bg-black text-black dark:text-white border border-green-600 rounded p-2">
            {groupedModels.map((grp) => (
              <div key={grp.group}>
                <div className="text-green-500 px-2 py-1">{grp.group}</div>
                {grp.models.map((m) => {
                  const globalIdx = flatModels.findIndex(
                    (fm) => fm.value === m.value
                  );
                  const isHl = globalIdx === highlightedIndex;
                  return (
                    <button
                      key={m.value}
                      onClick={() => {
                        setSelectedModel(m.value);
                        setInput("");
                        setShowModelMenu(false);
                        inputRef.current?.focus();
                      }}
                      className={`block w-full text-left px-2 py-1 ${
                        isHl ? "bg-green-600/30" : "hover:bg-green-600/20"
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
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
