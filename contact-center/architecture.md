# BCCIT Contact Center — Architecture Decision Record

## Decision

Keep the existing e& Egypt mobile number unchanged. Add a separate smart number only after testing and cost/legal checks. Do not purchase hardware in the first phase.

## Call path (target)

Existing number (unchanged)
  -> optional conditional forwarding, only after e& confirms support and tariff
  -> dedicated smart number
  -> approved mobile voice/SIP interconnect
  -> Asterisk IVR
  -> speech recognition adapter
  -> BCCIT AI Core (Groq via Cloudflare Worker)
  -> Egyptian Arabic TTS adapter
  -> caller

Direct calls to the new number follow the same path. If operator forwarding is unavailable or too costly, publish the new number as a separate contact channel while the existing line continues normally.

## Why no GSM gateway now?

A GSM gateway introduces hardware cost, SIM/network compatibility, security, and Egyptian regulatory/operator-terms questions. It is not a prerequisite for building or testing the menu and AI conversation logic. No gateway is approved for purchase until a compliant interconnect is confirmed.

## Runtime split

### Phase 1 — browser simulation
- Static HTML and JSON only.
- No real calls, recording, external requests, or credentials.
- Test menu wording, branches, invalid input, and repeat/back behavior.

### Phase 2 — local PBX proof of concept
- Run Asterisk in a local VM/container or spare computer, if available.
- Test IVR using a SIP softphone on a private test network.
- Do not expose SIP ports publicly or connect a SIM gateway.

### Phase 3 — AI voice loop
- Add a server-side adapter for speech-to-text, Groq responses, and Egyptian Arabic TTS.
- Keep API keys in Cloudflare secrets.
- Add turn timeouts, interruption handling, rate limits, and a fallback message.

### Phase 4 — real number
- Obtain written/official confirmation from the chosen operator/provider for incoming calls, forwarding, SIP/number provisioning, caller ID, business usage, tariffs, and local regulatory requirements.
- Test the new number first. Test conditional forwarding from the old e& line only after explicit confirmation.
- Keep rollback simple: disable forwarding and retain the old number as the primary line.

## Data model (planned, not yet deployed)

- contacts: normalized phone, display name (optional), consent metadata.
- interactions: channel, started_at, ended_at, outcome, linked contact.
- call_events: call/session ID, IVR selection, status, escalation reason.
- leads: interest, course/service, branch, follow-up status.
- knowledge_items: approved answer, category, version, valid_from, valid_until.
- human_tasks: reason, priority, assigned team, status.

## Privacy and safety

- Recording disabled by default; enable only after legal review, clear notice, and suitable consent.
- Store only necessary customer information.
- Avoid sending full phone numbers or sensitive customer data to model prompts.
- Escalate billing disputes, complaints, refunds, and uncertain official facts.
- AI must never claim a registration, booking, payment, or callback has happened unless the backend confirms it.
