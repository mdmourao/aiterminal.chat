import { Message } from "./message";

export interface Chat {
  id: string;
  title: string | null;
  messages: Message[];
}
