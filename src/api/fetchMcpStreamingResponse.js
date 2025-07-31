// ──────────────── src/api/fetchMcpStreamingResponse.js ────────────────

// export async function fetchMcpStreamingResponse(text, userId, token, onMessageCallback) {
//   const sessionRes = await fetch("http://http://192.168.101.7:8000/mcp", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       text,
//       user_id: userId,
//     }),
//   });

//   const reader = sessionRes.body.getReader();
//   const decoder = new TextDecoder("utf-8");

//   let endpoint = null;

//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;

//     const chunk = decoder.decode(value, { stream: true });
//     const match = chunk.match(/data:\s*(.*)/);
//     if (match) {
//       endpoint = match[1].trim();
//       break;
//     }
//   }

//   if (!endpoint) throw new Error("MCP endpoint not received");

//   const eventSource = new EventSource(`http://http://192.168.101.7:8000${endpoint}`);

//   eventSource.onmessage = (event) => {
//     onMessageCallback(event.data);
//   };

//   eventSource.onerror = (err) => {
//     eventSource.close();
//     throw new Error("MCP SSE 연결 실패: " + err.message);
//   };
// }
