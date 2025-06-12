export function Welcome() {
  return (
    <div className="mb-4">
      <div className="text-green-500">{">"} Welcome to AI Terminal Chat</div>
      <div className="text-green-500 text-sm ml-2">
        <span className="text-gray-500">m:</span> to change model{" "}
        <span className="text-gray-500">clear</span> to clear chat and start new
      </div>
    </div>
  );
}
