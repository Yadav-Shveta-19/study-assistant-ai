# Study Assistant

An AI-powered study tool that turns a topic or pasted notes into a concise summary, key points, flashcards, and a quiz. It is intentionally an interactive learning workspace—not a chatbot.

## Features

- Gemini-powered, schema-validated study material generation
- Flip-card study mode with shuffle, restart, keyboard controls, and progress tracking
- One-question-at-a-time quiz with review and retest-incorrect flow
- Dark mode and local session history
- PDF study-notes export and flashcards JSON export
- Offline, timeout, rate-limit, invalid-response, and stale-request handling

## Architecture

`client/` is a Vite + React + Tailwind application. `server/` is an Express API that owns the Gemini key and validates all model output before returning it to the browser.

## Setup

1. Copy `server/.env.example` to `server/.env`.
2. Add a Google AI Studio `GEMINI_API_KEY` to that file.
3. Run `npm run install:all` from the project root.
4. Run `npm run dev`.
5. Open the client address shown in the terminal (normally `http://localhost:5173`).

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Server-only Google Gemini API key |
| `PORT` | No | Backend port; default `8787` |
| `CLIENT_ORIGIN` | No | Allowed frontend origin; default `http://localhost:5173` |

## Deployment

Deploy `client/` to Vercel with `npm run build` and set `VITE_API_URL` to the Render backend URL. Deploy `server/` to Render using `npm start`, then add its environment variables in Render's dashboard. Never add `GEMINI_API_KEY` to Vercel.

## AI usage and safeguards

The server requests JSON only, strips accidental code fences, parses it, and validates its shape. The browser never receives raw Gemini text. Requests have a timeout and cancellation mechanism; invalid or incomplete model responses get a clear retry path.

## Known limitations

Generated content quality varies by topic. Session history stays on the device because it uses localStorage.

## Future improvements

Authentication, cloud-synced study history, spaced repetition, accessibility audits, and automated end-to-end tests.

## Time spent

Designed as a focused take-home implementation; further visual polish and test coverage would be the next investment.

## Screenshots / demo video

Add deployed-app screenshots and a short walkthrough link here before submission.
