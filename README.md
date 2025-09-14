## n8n Chat UI (Next.js)

A production-ready, responsive chat UI built with Next.js App Router that proxies user messages to an n8n webhook and renders formatted responses. Users can send up to 5 messages per browser session; the remaining counter is shown in the header.

### Features
- Client chat UI with **Markdown** and code highlighting
- API proxy to `N8N_WEBHOOK_URL`
- 5-message cap tracked via HTTP-only cookie
- Remaining messages indicator
- Responsive Tailwind styling

### Prerequisites
- Node 18+
- An n8n webhook URL ready to receive `{ message, history }`

### Environment
Create `.env.local` in the project root:

```
N8N_WEBHOOK_URL=https://your-n8n-host/webhook/your-id
MAX_MESSAGES=5
NEXT_PUBLIC_MAX_MESSAGES=5
```

The app POSTs JSON like:

```json
{
  "message": "Hello",
  "history": [
    { "id": "uuid", "role": "user", "content": "Hi" },
    { "id": "uuid", "role": "assistant", "content": "Hello!" }
  ]
}
```

The n8n workflow should respond as either JSON with `reply` (preferred) or plain text. Example JSON response:

```json
{ "reply": "**Hello!** Here is some markdown.\n\n```ts\nconsole.log('code');\n```" }
```

### Develop

```bash
npm run dev
```

Open http://localhost:3000

### Deploy
- Vercel or any Node host.
- Ensure `N8N_WEBHOOK_URL` is set in the deployment environment.

### Notes
- Message limit resets after 24h (cookie max-age). Adjust in `app/api/chat/route.ts`.
- To change the limit, update `MAX_MESSAGES` and `NEXT_PUBLIC_MAX_MESSAGES` in `.env.local`.
- Users can reset their limit by clicking "Reset Limit" button when limit is reached.
- Reset clears both message count and session ID, starting fresh.
