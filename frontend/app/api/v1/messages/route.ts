export async function POST(req: Request) {
  const body = await req.json();

  const headers = new Headers({
    "Content-Type": "application/json",
  });
  headers.set("Authorization", req.headers.get("authorization") || "");
  headers.set("cookie", req.headers.get("cookie") || "");

  const response = await fetch(`${process.env.API_BASE_URL}api/v1/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
