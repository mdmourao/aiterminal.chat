"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import rehypeRaw from "rehype-raw";

import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Message } from "../models/message";

interface MessagesProps {
  messages: Message[];
}

export default function Messages(props: MessagesProps) {
  return (
    <>
      {props.messages.map((message) => (
        <div key={message.id} className="mb-4">
          {message.role === "assistant" ? (
            <div className="flex items-start gap-2">
              <span className="text-blue-400 shrink-0">
                gpt-4.1-nano@system:~$
              </span>
              <div className={`text-black break-words whitespace-pre-wrap`}>
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    // ts-ignore-next-line
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");

                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={tomorrow}
                          PreTag="div"
                          language={match[1]}
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </Markdown>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <span className={`text-green-500 shrink-0`}>
                {message.model || "user"}@terminal:~$
              </span>
              <span className={`text-black break-words`}>
                {message.content}
              </span>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
