# BCCIT AI Contact Center — Foundation

**Status:** Phase 1 — software-only foundation  
**Branch:** `contact-center-foundation`  
**Locale:** Egyptian Arabic (`ar-EG`)  
**Timezone:** `Africa/Cairo`

## Goal

Build a unified customer-contact layer for BCCIT Academy without changing the existing Etisalat number, purchasing telephony hardware, or disturbing the deployed AI Team.

## Phase 1 deliverables

- `ivr-menu.json`: editable Arabic IVR menu configuration.
- `ivr-demo.html`: browser-based DTMF/menu simulation. It does not place or receive real calls.
- `architecture.md`: approved target architecture, boundaries, and rollout gates.

## Approved call menu

1. Languages and translation
2. Technology and computers
3. Accounting and business
4. Personal development and vocational training
5. Prices, offers, and registration
6. Branches and working hours

The caller can repeat the menu. Unknown or missing input must not create a customer record or invent a response.

## Target architecture

- Existing e& Egypt mobile number: keep unchanged and operational.
- New dedicated mobile number: acquire only after operator coverage, tariff, and business-use terms are confirmed.
- PBX: Asterisk/FreePBX for IVR and call routing, first tested locally or in a disposable sandbox.
- AI: reuse the existing Cloudflare Worker/Groq integration through a dedicated contact-center API module.
- Data: Cloudflare D1 for leads, interactions, and approved knowledge records, after schema review.
- Speech: speech-to-text and Egyptian Arabic text-to-speech are separate adapters; no provider is assumed free until tested.
- Human escalation: create a callback/task record when a live handoff is unavailable.

## Important boundaries

- No live telephony is connected in Phase 1.
- No SIM forwarding codes are activated by this project.
- No GSM gateway or other telecom hardware is purchased.
- No audio recording is enabled by default.
- No API keys, phone numbers, or customer data belong in this repository.
- The existing deployed Worker and catalog are not modified by this foundation branch.

## Acceptance tests for Phase 1

- Every menu option is selectable by mouse and keyboard.
- Invalid input gives a clear retry message.
- The caller can return to the main menu.
- The demo clearly identifies itself as a simulation.
- No network request, paid service, microphone, or phone permission is required.
