import { processAIChat } from "./src/services/chatService.js";

async function test() {
  console.log("Testing processAIChat...");
  const result = await processAIChat("I need you to book 2 tickets from bangalore to Chennai . mode of travelling is Bus and date of departure is 6th may , morning");
  console.log("RESULT:", result);
}
test();
