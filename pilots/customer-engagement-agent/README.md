# Customer Engagement AI Agent — Pilot

A portfolio-ready, low-cost pilot for an AI Chatbot + Voice Agent Developer role. It demonstrates FAQ handling, lead qualification, conversation safety, API integration, and a phone voice proof-of-concept.

> Status: starter pilot, not production-ready. Import into a test n8n instance, configure credentials, and test with synthetic data before connecting real customers.

## Reference comparison

| Reference | Strength | Trade-off | Decision |
|---|---|---|---|
| [n8n multi-channel OpenAI RAG + Supabase](https://n8n.io/workflows/11807-answer-multi-channel-support-queries-with-openai-rag-and-supabase/) | Input guards, multi-channel normalisation, grounded support, human escalation and reporting | More infrastructure and newer n8n node versions | Borrow guardrails, handoff policy and a channel-neutral message contract |
| [Supabase/Postgres RAG workflow](https://github.com/yennares/n8n-supabase-postgres-rag-chatbot-workflow) | Document retrieval and persistent conversation history | Needs pgvector/schema/credentials; not voice-focused | Phase 2: replace synthetic FAQ with retrieval and session storage |
| [n8n AI voice tutorial](https://github.com/theohidekii/n8n-AI-Voice-Agent) | Speech → LLM → TTS concept | Tutorial-level; audio transport requires verification | Use Twilio speech transcription webhook for a small first demo |
| [Twilio + OpenAI Realtime sample](https://github.com/twilio-samples/speech-assistant-openai-realtime-api-node) | Low-latency, two-way audio over WebSockets | Separate Node.js service and telephony setup | Future phase if real-time streaming/barge-in is required |
| [n8n RAG Agent / lead capture](https://github.com/alihassanml/N8N-Rag-Agents) | Combines knowledge answers and lead capture | Several integrations; small community project | Keep MVP lead schema small and provider-neutral |

## Scope

Included: chat webhook, input validation, short answers, lead-intent signal, handoff signal, Twilio inbound speech-to-text via Gather and spoken TwiML response, synthetic FAQ and test plan.

Not included yet: production RAG, durable history, CRM writes, WhatsApp/email adapters, monitoring dashboard, outbound calling, real-time WebSocket voice, or production security review. The voice proof-of-concept is not a full-duplex real-time agent.

## Architecture

~~~text
Website/demo client ──POST /webhook/customer-chat──┐
                                                   ├─ Validate/normalise ─ OpenAI API
Twilio inbound call ─ SpeechResult ─ /webhook/voice┘
Chat webhook returns JSON; voice webhook returns TwiML to Twilio.
~~~

## Setup

1. Use a test n8n instance on a publicly reachable HTTPS URL. Keep workflows inactive while configuring.
2. Create an OpenAI API credential in n8n. Never put API keys in workflow JSON or Git.
3. Import workflows/customer-chat-webhook.json.
4. Configure the OpenAI credential on the HTTP Request node. This uses the OpenAI Responses API; verify model/API access for your account.
5. The chat workflow expects JSON:
   ~~~json
   { "message": "Apakah produk ini tersedia?", "sessionId": "demo-session-01", "channel": "web", "customer": { "name": "Demo" } }
   ~~~
6. Import workflows/twilio-speech-voice-poc.json, configure its OpenAI credential, then set Twilio's inbound Voice URL to the production URL of the voice-inbound webhook (HTTP POST).
7. Validate Twilio request signatures before exposing any production endpoint. This sample is for a controlled pilot only.
8. Run docs/TEST-PLAN.md. Do not use real customer personal data until access control, privacy, retention, rate limiting and audit logging exist.

## Synthetic FAQ and safety

The workflows use clearly marked synthetic demo content. Replace it only with approved public product information. The agent must not invent unknown facts, reveal private data, or follow instructions embedded in customer messages that conflict with its role. Requests for a person, complaints, account-specific/payment matters, and uncertainty should be handed to a human.

## Success criteria

- [ ] Chat webhook returns valid JSON for normal input.
- [ ] Unknown FAQ does not produce invented product facts.
- [ ] Lead intent is structured output, not an automatic CRM write.
- [ ] Explicit handoff and sensitive cases are flagged.
- [ ] Voice endpoint returns valid TwiML and speaks a concise answer.
- [ ] Empty input is handled safely.
- [ ] No secrets or real customer data are committed.
- [ ] Another developer can repeat setup and tests.

## Production hardening

- Validate Twilio signatures; use HTTPS.
- Add webhook authentication, rate limits and payload size limits.
- Add idempotency/deduplication for retries.
- Require human approval before outbound messages, CRM writes, or outbound calls.
- Add retention/deletion policy, consent language, audit logs, monitoring, alerting and spend limits.
- Keep keys in n8n credentials/secret manager; never commit .env.

## References
- https://n8n.io/workflows/11807-answer-multi-channel-support-queries-with-openai-rag-and-supabase/
- https://github.com/yennares/n8n-supabase-postgres-rag-chatbot-workflow
- https://github.com/theohidekii/n8n-AI-Voice-Agent
- https://github.com/twilio-samples/speech-assistant-openai-realtime-api-node
- https://github.com/alihassanml/N8N-Rag-Agents
