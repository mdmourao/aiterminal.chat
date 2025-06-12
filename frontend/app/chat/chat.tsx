"use client";
import { useState } from "react";
import { Message } from "../models/message";
import { Input } from "./input";
import Messages from "./messages";
import { Welcome } from "./welcome";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4.1-nano");

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/messages", {
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

              switch (event) {
                case "chatDetails":
                  continue;
                case "textDelta":
                  continue;
                case "streamComplete":
                  setIsLoading(false);
                  continue;
                case "error":
                  setIsLoading(false);
                  continue;
                default:
                  console.warn("Unknown SSE event:", event);
                  continue;
              }
            } else if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.messageId && !assistantMessage.id) {
                  assistantMessage.id = data.messageId;
                  setMessages((prev: Message[]) => [...prev, assistantMessage]);
                }

                if (data.content) {
                  assistantMessage.content += data.content;
                  setMessages((prev: Message[]) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: assistantMessage.content }
                        : msg
                    )
                  );
                }

                if (data.finalContent) {
                  assistantMessage.content = data.finalContent;
                  setMessages((prev: Message[]) =>
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
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <div className="flex-1 p-4 overflow-y-auto">
        <Welcome />

        <Messages messages={messages} />
      </div>

      <div>
        <Input
          input={input}
          setInput={setInput}
          handleSubmit={sendMessage}
          isLoading={isLoading}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
      </div>
    </div>
  );
}
