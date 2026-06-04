export const askGemini = async (prompt) => {
  try {
    const res = await fetch("http://localhost:5000/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    return data.response || "No answer from Gemini.";
  } catch (err) {
    console.error("Client error:", err);
    return "Something went wrong talking to Gemini.";
  }
};