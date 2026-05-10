# CollabX Presentation Notes

## Demo URLs

- Frontend: http://127.0.0.1:5173
- Backend health: http://127.0.0.1:5000/health
- API base used by the demo frontend: http://127.0.0.1:5000/api

## Best Demo Flow

1. Open the frontend and sign in.
2. Go to the dashboard and click "Chat With CollabX AI".
3. Try: "Book movie tickets for today".
4. Answer the assistant prompts, select an option, choose seats, and generate the summary ticket.
5. Return to dashboard to show bookings, payments, refunds, ticket history, activity, and chat history.

## Presentation Highlights

- AI chatbot with intent detection for bookings, refunds, payments, ticket status, and complaints.
- Interactive widgets: inline input, MCQ options, seat selection, QR-enabled ticket summary, and PDF download.
- CollabX Payments demo checkout: method selection, scanable QR, phone confirmation page, payment polling, and automatic e-ticket generation.
- Resilient fallback workflow keeps the demo functional even if live AI or web search is unavailable.
- Dashboard includes tickets, bookings, payments, refunds, realtime activity, and chat history.
- Backend exposes `/health` for quick demo readiness checks.

## Local Commands

Backend:

```bash
cd backend
set PORT=5000
npm run start
```

Razorpay keys are optional for demo mode. When these keys exist in `backend/.env`, CollabX opens real Razorpay Checkout. Without keys, it uses an internal mock checkout so the chat can still generate a paid e-ticket.

```bash
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

For the CollabX Payments QR to open on a phone, run the frontend on your laptop's LAN IP instead of `127.0.0.1`, then open that same LAN URL in the browser before generating the QR.

Frontend:

```bash
cd frontend
set VITE_API_URL=http://127.0.0.1:5000/api
npm run dev -- --host 127.0.0.1 --port 5173
```
