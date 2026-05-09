import { generateAIResponse } from "./backend/src/ai/sarvamClient.js";

async function test() {
  const history = [
    { role: "user", content: "Book a movie" },
    { role: "assistant", content: "To help you book a movie, I'll need a few details. 1. Could you share your preferred location or city? 2. Do you have a preferred theater chain or time slot?" },
    { role: "user", content: "Bangalore around 3-5pm" }
  ];
  console.log("Generating response...");
  const res = await generateAIResponse("Bangalore around 3-5pm", history);
  console.log("Response:", res);
}
test();
