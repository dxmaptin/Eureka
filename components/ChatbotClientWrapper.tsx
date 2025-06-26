"use client";
import dynamic from "next/dynamic";
const Chatbot = dynamic(() => import("./chatbot"), { ssr: false });

export default function ChatbotClientWrapper() {
  return <Chatbot />;
} 