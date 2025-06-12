"use client";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Model } from "../models/model";
import {} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { getLogoFromProvider } from "./utils";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface InputProps {
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  input: string;
  setInput: (input: string) => void;
}

export function Input(props: InputProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [textareaRows, setTextareaRows] = useState(4);
  const [showDropdownModels, setShowDropdownModels] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault();
        if (props.input.trim()) {
          props.handleSubmit(e);
        }
      } else {
        const lines =
          (e.target as HTMLTextAreaElement).value.split("\n").length + 1;
        setTextareaRows(Math.min(Math.max(lines, 4), 10));
      }
    }
  };

  useEffect(() => {
    const lines = props.input.split("\n").length;
    setTextareaRows(Math.min(Math.max(lines, 4), 10));
  }, [props.input]);

  useEffect(() => {
    if (!showDropdownModels && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showDropdownModels]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/v1/models")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        return res.json();
      })
      .then(({ data }) => {
        setModels(data);
      })
      .catch((error) => {
        console.error("error getting models", error);
        toast.error("Failed to load models. Please try again later.");
      });
  }, []);

  return (
    <div className=" border p-4 flex items-center justify-between border-green-600/30 ">
      <form
        onSubmit={props.handleSubmit}
        className="w-full flex items-start gap-2"
      >
        <DropdownMenu
          open={showDropdownModels}
          onOpenChange={setShowDropdownModels}
        >
          <DropdownMenuTrigger asChild>
            <span className={`text-green-500 shrink-0`}>
              {props.selectedModel}@terminal:~$
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Models</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {models.map((model) => {
              return (
                <DropdownMenuCheckboxItem
                  key={model.value}
                  checked={props.selectedModel === model.value}
                  onClick={() => {
                    props.setSelectedModel(model.value);
                    setShowDropdownModels(false);

                    if (props.input === "m:") {
                      props.setInput("");
                    }
                  }}
                >
                  <Image
                    src={getLogoFromProvider(model.provider)}
                    alt={model.label}
                    width={30}
                    height={30}
                    className="w-4 h-4 mr-2 inline"
                  />
                  <span className="text-green-500">{model.label}</span>
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <textarea
          ref={textareaRef}
          value={props.input}
          placeholder="Enter your message..."
          disabled={props.isLoading}
          rows={textareaRows}
          onChange={(e) => {
            if (e.target.value === "m:") {
              setShowDropdownModels(true);
            }
            props.setInput(e.target.value);
          }}
          onKeyDown={handleKeyDown}
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
