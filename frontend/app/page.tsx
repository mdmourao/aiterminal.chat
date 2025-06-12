import Chat from "./chat/chat";
import Header from "./header/header";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <Chat />
    </div>
  );
}
