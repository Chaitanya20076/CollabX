import { generateAIResponse } from "./src/ai/sarvamClient.js";

async function test() {
  const history = [
    { role: "user", content: "Book a movie" },
    { role: "assistant", content: "To help you book a movie, I'll need a few details. 1. Could you share your preferred location or city? 2. Do you have a preferred theater chain or time slot?" },
  ];
  console.log("Generating response...");
  const res = await generateAIResponse("Bangalore around 3-5pm", history);
  console.log("Raw Response:\n", res);
  
  let widget = null;
  let cleanReply = res;

  const mcqMatch = res.match(/\[ACTION:MCQ\s*\|\s*([\s\S]*?)\]/i);
  if (mcqMatch) {
    const options = mcqMatch[1].split('|').map(o => o.trim());
    widget = { type: 'mcq', options };
    cleanReply = cleanReply.replace(mcqMatch[0], '').trim();
  }
  console.log("Parsed Reply:", cleanReply);
  console.log("Parsed Widget:", widget);
}
test();
