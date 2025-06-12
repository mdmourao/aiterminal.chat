export async function POST(req: Request) {
  const { content } = await req.json();

  // Copy all original headers
  const headers = new Headers(req.headers);
  // Ensure content-type is set correctly
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${process.env.API_BASE_URL}api/v1/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "gpt-4.1-nano",
      content: content,
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  // Return the SSE stream with proper headers
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
