# Oscar Platform Testing Guide

**Version:** 1.0
**Date:** January 2026
**URL:** https://oscar-zorgcoordinatie-482297690628.europe-west4.run.app

---

## Overview

Oscar is a healthcare coordination platform that connects patients with care providers. This guide explains how to test the complete patient-to-provider flow using dummy test data.

---

## Prerequisites

- A valid email address (to receive test emails)
- Access to a terminal/command line (for API calls)
- Internet connection

---

## Step 1: Create Test Providers

Before testing, you need to create dummy providers in the system. These providers will receive referral emails at YOUR email address.

### Run this command:

```bash
curl -X POST https://oscar-zorgcoordinatie-482297690628.europe-west4.run.app/api/test/seed-providers \
  -H "Content-Type: application/json" \
  -d '{"email": "YOUR-EMAIL@example.com"}'
```

**Replace `YOUR-EMAIL@example.com` with your actual email address.**

### What this creates:

| Provider Type | Name | Location | Postcode |
|---------------|------|----------|----------|
| Fysiotherapie | Test Fysiotherapie Amsterdam | Amsterdam | 1017AB |
| Fysiotherapie | Test Fysiotherapie Rotterdam | Rotterdam | 3011AA |
| Ergotherapie | Test Ergotherapie Amsterdam | Amsterdam | 1018CD |
| Diëtist | Test Diëtist Utrecht | Utrecht | 3511AB |
| Stoppen met Roken | Test Stoppen met Roken Coach | Den Haag | 2511AB |
| GLI | Test GLI Coach Amsterdam | Amsterdam | 1019EF |

---

## Step 2: Complete the Patient Journey

### 2.1 Start the Questionnaire

1. Open your browser
2. Go to: **https://oscar-zorgcoordinatie-482297690628.europe-west4.run.app**
3. Click **"Start de Vragenlijst"** (Start the Questionnaire)

### 2.2 Answer the 12 Questions

Answer all questions about your health situation. The system will recommend care pathways based on your answers.

### 2.3 View Results

After completing the questionnaire, you'll see a results page showing:
- Recommended care pathways (Fysiotherapie, Ergotherapie, etc.)
- Explanation of each recommendation

### 2.4 Start the Intake Form

Click **"Ga door naar intake"** to continue to the intake form.

### 2.5 Complete the Intake Form

The intake form has several sections:

#### Pathway-Specific Questions
Answer questions related to your recommended care pathways.

#### Personal Details
| Field | Test Value |
|-------|------------|
| Naam (Name) | Test Patient |
| E-mail | your-email@example.com |
| Telefoon (Phone) | 0612345678 |
| Geboortedatum (Birth date) | Any date |

#### Location (Important!)
| Field | Test Value |
|-------|------------|
| **Postcode** | **1017AB** |
| Plaats (City) | Amsterdam |

**Use postcode `1017AB` to match with Amsterdam test providers.**

#### Availability
Select some available time slots for appointments.

#### Insurance (Optional)
Can be left empty for testing.

### 2.6 Submit the Form

Click **"Verstuur Aanvraag"** (Submit Request)

---

## Step 3: Verify the Results

### 3.1 Check Your Email

You should receive two emails:

1. **Provider Invitation Email**
   - Subject: "Oscar - Nieuwe patiënt beschikbaar in Amsterdam"
   - Contains a secure link to view patient details
   - Shows patient initials, location, and care pathway

2. **Patient Confirmation Email**
   - Subject: "Oscar - Bevestiging van uw aanmelding"
   - Confirms the intake was submitted
   - Lists the selected care pathways

### 3.2 Test the Provider Portal

1. Open the provider invitation email
2. Click the **"Bekijk Details & Accepteer"** button
3. You'll be taken to the secure provider portal
4. Enter the verification code (sent to provider email)
5. View the patient details and accept/decline the referral

### 3.3 Check Firebase Console (Optional)

If you have access to Firebase Console:

1. Go to **Firestore Database**
2. Check these collections:
   - `referrals` - Contains the new referral
   - `referral_invites` - Contains invites sent to providers
   - `encrypted_referral_data` - Contains encrypted patient data

---

## Test Postcodes Reference

Use these postcodes to test matching with different provider types:

| Postcode | City | Matches With |
|----------|------|--------------|
| **1017AB** | Amsterdam | Fysio, Ergo, GLI |
| **1018CD** | Amsterdam | Ergo |
| **1019EF** | Amsterdam | GLI |
| **3011AA** | Rotterdam | Fysio |
| **3511AB** | Utrecht | Diet |
| **2511AB** | Den Haag | Smoking |

---

## Cleanup After Testing

Remove all test providers when done:

```bash
curl -X DELETE https://oscar-zorgcoordinatie-482297690628.europe-west4.run.app/api/test/seed-providers
```

---

## Troubleshooting

### No email received?
- Check your spam/junk folder
- Verify SMTP settings are configured correctly
- Check that test providers were created successfully

### No providers found error?
- Make sure you ran the seed-providers command first
- Use a postcode that matches test providers (e.g., 1017AB)

### Provider portal not working?
- The link expires after 7 days
- Each link can only be used once
- Check that the token in the URL is complete

---

## Support

For technical issues, contact the development team.

---

*This document is for internal testing purposes only.*
