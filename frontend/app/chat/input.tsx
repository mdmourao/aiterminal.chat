"use client";
import { Send } from "lucide-react";

interface InputProps {
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  input: string;
  setInput: (input: string) => void;
}

export function Input(props: InputProps) {
  return (
    <div className=" border p-4 flex items-center justify-between border-green-600/30 ">
      <form
        onSubmit={props.handleSubmit}
        className="w-full flex items-start gap-2"
      >
        <span className={`text-green-500 shrink-0`}>
          {props.selectedModel}@terminal:~$
        </span>
        <textarea
          value={props.input}
          placeholder="Enter your message..."
          disabled={props.isLoading}
          rows={4}
          onChange={(e) => {
            props.setInput(e.target.value);
          }}
          className={`flex-1 bg-transparent border-none outline-none text-black placeholder-gray-500 caret-green-400 resize-none max-h-[360px] overflow-y-auto`}
        />
        <button
          type="submit"
          disabled={props.isLoading || !props.input.trim()}
          className={`text-green-600 hover:text-green-500 disabled:text-green-600/30 transition-colors`}
        >
          <Send className="w-6 h-6 mt-2" />
        </button>
      </form>
    </div>
  );
}
