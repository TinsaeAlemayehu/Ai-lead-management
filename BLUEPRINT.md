# AuraLead AI: System Architecture Blueprint

## 1. System Overview
AuraLead AI is an agentic lead qualification system designed to sit between lead generation sources and a CRM. It automates the initial contact, qualification, and appointment booking process using Gemini AI.

## 2. Infrastructure Diagram (Text-based)
```text
[Sources] -> [Webhook/API] -> [Express Server] -> [Gemini AI]
                                     |                |
                                     v                v
                              [Firestore DB] <-> [Admin Dashboard]
                                     |
                                     v
                              [Automation/CRM Hub] (Make.com/HubSpot)
```

## 3. Data Flow
1. **Intake**: Webhook receives lead data (Name, Phone, Source).
2. **First Contact**: System triggers automated WhatsApp/SMS via Twilio.
3. **AI Dialogue**: Lead replies; Gemini analyzes context, qualifies against criteria.
4. **Scoring**: Gemini assigns a score (HOT, WARM, COLD) based on intent and sentiment.
5. **Booking**: If HOT/WARM, sends a Calendly link or proposed slots.
6. **Sync**: Data pushed to CRM (HubSpot) and internal Firestore.
7. **Alert**: Agent notified via real-time dashboard or SMS.

## 4. API Design

### POST `/api/leads/webhook`
- **Desc**: Receive leads from external platforms (FB Ads, Webforms).
- **Body**: `{ name: string, phone: string, email: string, source: string }`
- **Response**: `{ success: true, leadId: string }`

### POST `/api/messages/webhook`
- **Desc**: Receive SMS/WhatsApp replies from Twilio.
- **Body**: `{ From: string, Body: string }`
- **Response**: Sends back TwiML or triggers AI response.

## 5. AI Prompts
- **Qualification Assistant**: "You are a professional sales assistant for [Business]. Your goal is to find out if the lead has a budget over $5k and needs the solution within 30 days."
- **Lead Summarizer**: "Summarize the following conversation in 3 sentences, highlighting the main objection and the urgency level."

## 6. Lead Scoring Logic
- **Budget** (0-30 pts): Matches target range?
- **Urgency** (0-30 pts): Immediate need?
- **Engagement** (0-20 pts): Prompt replies?
- **Sentiment** (0-20 pts): Positive language?
- **Total**: >70 = HOT, 40-70 = WARM, <40 = COLD.

## 7. MVP Roadmap
1. **Core API**: Lead intake and thread management in Firestore.
2. **AI Logic**: Single prompt for qualification and summary.
3. **Dashboard**: Live table of leads and their conversation history.
4. **CRM Mock**: Webhook to push data to a placeholder endpoint.
