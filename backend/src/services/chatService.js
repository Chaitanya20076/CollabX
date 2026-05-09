import {
  generateAIResponse,
} from "../ai/sarvamClient.js";

import {
  searchWeb,
} from "../websearch/tavilySearch.js";

import {
  buildTicketDraft,
  detectIntent,
  getQuickSuggestions,
} from "./intentService.js";

export const processAIChat =
  async (message, history = [], attachments = []) => {
    const cleanMessage =
      String(message || "").trim();

    let finalPrompt = cleanMessage;

    const lower =
      cleanMessage.toLowerCase();

    const detectedIntent =
      detectIntent(cleanMessage);

    // SMART WEB SEARCH DETECTION

    const webTriggers = [
      "latest",
      "today",
      "news",
      "current",
      "trending",
      "movie",
      "movies",
      "flight",
      "flights",
      "hotel",
      "weather",
      "score",
      "release",
      "price",
      "booking",
      "tickets",
      "showtimes",
      "restaurants",
      "events",
      "concert",
      "nearby",
      "availability",
    ];

    const shouldSearchWeb =
      webTriggers.some((word) => lower.includes(word)) &&
      detectedIntent.needsWebSearch;

    // WEB SEARCH

    let webResults = [];

    if (shouldSearchWeb) {
      webResults =
        await searchWeb(cleanMessage);

      finalPrompt += `

LIVE WEB SEARCH RESULTS:
${JSON.stringify(webResults)}

Use these results carefully and accurately.
Do not hallucinate.
`;
    } else if (detectedIntent.needsWebSearch) {
      finalPrompt += `

LIVE WEB SEARCH RESULTS:
[]

Live results are unavailable. Give a safe fallback and ask for confirmation before claiming availability.
`;
    }

    const safeAttachments = Array.isArray(attachments)
      ? attachments
          .filter((item) => item?.name)
          .slice(0, 5)
          .map((item) => ({
            name: item.name,
            type: item.type,
            size: item.size,
          }))
      : [];

    finalPrompt = `
USER MESSAGE:
${finalPrompt}

COLLABX TASK CONTEXT:
Answer as the CollabX ticketing/support assistant.
Keep the reply focused on resolving the user's ticketing, booking, payment, refund, cancellation, or support need.
Detected intent: ${detectedIntent.label}
Priority: ${detectedIntent.priority}
Attached files or images: ${JSON.stringify(safeAttachments)}
If the message is outside this scope, politely redirect to CollabX support work.
When details are missing, ask the next 1 to 3 useful questions instead of guessing.
`;

    const aiReply =
      await generateAIResponse(
        finalPrompt,
        history
      );

    let widget = null;
    let cleanReply = aiReply;

    // Parse ACTION tags
    const mcqMatch = aiReply.match(/\[ACTION:MCQ\s*\|\s*([\s\S]*?)\]/i);
    if (mcqMatch) {
      const options = mcqMatch[1].split('|').map(o => o.trim());
      widget = { type: 'mcq', options };
      cleanReply = cleanReply.replace(mcqMatch[0], '').trim();
    } else {
      const seatMatch = aiReply.match(/\[ACTION:SEAT_SELECTION(?:\|([\s\S]*?))?\]/i);
      if (seatMatch) {
        const mode = seatMatch[1] ? seatMatch[1].trim().toLowerCase() : 'movie';
        widget = { type: 'seat_selection', mode };
        cleanReply = cleanReply.replace(seatMatch[0], '').trim();
      } else {
        const summaryMatch = aiReply.match(/\[ACTION:SUMMARY\s*\|\s*([\s\S]*?)\]/i);
        if (summaryMatch) {
          const details = summaryMatch[1].split('|').map(o => o.trim());
          widget = { type: 'summary', details };
          cleanReply = cleanReply.replace(summaryMatch[0], '').trim();
        }
      }
    }

    return {
      reply: cleanReply,
      widget: widget,
      intent: detectedIntent,
      ticketDraft:
        buildTicketDraft(cleanMessage, detectedIntent),
      suggestions:
        getQuickSuggestions(detectedIntent),
      usedWebSearch:
        shouldSearchWeb && webResults.length > 0,
    };
  };
