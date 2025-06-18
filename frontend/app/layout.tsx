import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers"; // Import the client component
import { AppSidebarLoader } from "./side-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Terminal Chat - Multimodal LLM UI for Developers",
  description:
    "AI Terminal Chat offers a powerful, terminal-inspired UI for developers to interact with multiple Large Language Models (LLMs) including Gemini, OpenAI, Grok, and DeepSeek. Streamline your AI development and conversations with a unified interface.",
  keywords: [
    "AI chat",
    "LLM UI",
    "Gemini AI",
    "OpenAI",
    "Grok",
    "DeepSeek",
    "developer tools",
    "terminal UI",
    "AI development",
    "chatbot",
    "multimodal AI",
    "code generation",
    "natural language processing",
  ],
  openGraph: {
    title: "AI Terminal Chat - Multimodal LLM UI for Developers",
    description:
      "Interact with Gemini, OpenAI, Grok, and DeepSeek LLMs through a sleek, terminal-style interface designed for developers.",
    url: "https://aiterminal.chat",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Terminal Chat - Multimodal LLM UI for Developers",
    description:
      "Interact with Gemini, OpenAI, Grok, and DeepSeek LLMs through a sleek, terminal-style interface designed for developers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AppSidebarLoader />
          <main className="flex-1 w-full">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
