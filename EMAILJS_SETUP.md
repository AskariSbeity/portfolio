# Connect your contact form to your inbox (EmailJS setup)

Your contact form now uses **EmailJS** — a free service that sends form
submissions straight to your email. No server, no database, no hosting
to maintain. Free tier: 200 emails/month, which is plenty for a portfolio.

## 1. Create an account
Go to https://www.emailjs.com/ and sign up (free).

## 2. Connect your email
- In the dashboard, go to **Email Services** → **Add New Service**.
- Choose **Gmail** (or Outlook/whatever you use) and connect
  `askarisbeity@gmail.com`.
- Copy the **Service ID** it gives you (looks like `service_xxxxxxx`).

## 3. Create a template
- Go to **Email Templates** → **Create New Template**.
- Set the **To email** field to your own address:
  `askarisbeity@gmail.com`.
- Set **Reply To** to `{{email}}` (so you can hit "Reply" and it goes
  to the visitor, not to yourself).
- In the template body, use these variables — they match the `name`
  attributes on your form's inputs exactly:

  ```
  New message from your portfolio site:

  Name: {{name}}
  Phone: {{phone}}
  Email: {{email}}

  Message:
  {{message}}
  ```
- Save it and copy the **Template ID** (looks like `template_xxxxxxx`).

## 4. Get your public key
- Go to **Account** → **General**.
- Copy your **Public Key**.

## 5. Plug the three values into script.js
Open `script.js`, find this block near the contact form code, and
replace the placeholders:

```js
const EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
```

Save the file, re-upload/re-deploy your site, and you're done — every
form submission will now land in your inbox within seconds, from
wherever your site is hosted (no laptop needs to be running).

## Testing
Open your site, fill out the contact form, and submit. Check your inbox
(and spam folder the first time). If it fails, open the browser console
(F12) — the error from EmailJS will tell you exactly what's wrong
(usually a typo'd ID or an unverified email service).
