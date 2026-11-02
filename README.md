# Abu Sufyan Al-Alma'iyy Foundation – Website Guide

Welcome to the website guide for the Abu Sufyan Al-Alma'iyy Foundation.

The Foundation provides Qur'ans and Islamic books to students of knowledge, Islamic schools and mosques. This website was built to make that work easier to manage, from receiving donations and book requests to reviewing applications and recording the books that have been distributed.

There are two main parts to the website:

- **The public website:** This is where visitors learn about the Foundation, make donations, purchase specific books and apply for books when applications are open.
- **The admin dashboard:** This is where the team manages campaigns, donations, applications, book requests and other activities. You can access it at `/admin`, but you will need an admin account to log in.

This guide walks through what visitors can do, how the different sections work and what the team needs to know when managing the website. There is also a section at the end for whoever handles the technical side.

## 1. What visitors can do on the website

Visitors don't need an account to use the public website. They can:

- **Donate to a campaign:** Choose a campaign they would like to support and make a donation through Paystack or bank transfer.
- **Purchase specific books:** Select books from the available list and pay for them. The Foundation then uses the payment to purchase those particular books.
- **Apply for books:** When a batch is open for applications, individuals, mosques and schools can request books.
- **Check an application:** Applicants can use their reference number and the phone number provided during registration to check the progress of their application.
- **Request a book:** If someone needs a book that isn't currently listed, they can submit a separate request.

Anyone applying for books or submitting a book request must provide an email address and agree to the privacy notice. The website also records when they gave their consent and which version of the privacy notice they saw.

## 2. Understanding campaigns and batches

The Foundation has two types of campaigns, and it's important to understand the difference between them.

**General campaigns**

These are straightforward fundraising campaigns with a target amount. Donations made towards them contribute to reaching that target.

**Batch-based campaigns**

These campaigns are used to fund the Foundation's book distribution in rounds. Each round is called a batch.

For example, the Foundation may have Batch 1, Batch 2 and Batch 3. Each batch has its own fundraising target and keeps its own record of the money raised.

This means that when Batch 1 is completed and the Foundation starts raising money for Batch 2, the new batch starts from zero. Money raised for an earlier batch is not automatically added to the next one.

The website allows one general campaign and one batch-based campaign to run at the same time. However, you cannot have two active campaigns of the same type. You must switch off the existing one before activating another.

### How a batch progresses

Every batch passes through four stages:

**1. Draft**

This is where a batch is being prepared. Donations can already be received, and the admin team can add the books and pickup locations.

However, applicants cannot see or apply for the batch yet.

**2. Open**

Once the fundraising target has been reached and the books have been purchased, the batch can be opened for applications.

The website will not allow this stage unless the amount raised has reached the batch's target.

**3. Closed**

Applications are no longer being accepted. The team can now go through the applications and decide which ones should be approved or rejected.

**4. Fulfilled**

This is the final stage. It means the books have been distributed to the beneficiaries and the batch is complete.

Between batches, the homepage displays a message that the next batch will open soon. People can still support the Foundation through general donations during this period.

### Updating the amount raised

One important thing to understand is that the website does not automatically calculate the total amount raised.

An admin has to enter the figure manually, using the actual total in the Foundation's bank account.

When entering this amount, remember to include donations received through Paystack as well. Paystack payments are eventually paid into the same bank account, so they should be included in the total.

To update the amount:

1. Open the campaign or batch.
2. Click **Edit amount**.
3. Enter the new total.
4. Click **Review change**.
5. Check the previous amount, the new amount and the difference.
6. Confirm the change if everything is correct.

The website will not accept a figure lower than the total already paid through the website.

Once confirmed, the new amount is reflected immediately. The change is also recorded in the Activity section, including the previous figure, the updated figure and the admin who made the change.

## 3. How book applications work

There are three categories of applicants: individuals, mosques and schools.

Each category has slightly different application rules.

**Individuals**

An individual can select one book and receive one copy. They will collect the book from one of the pickup locations provided for that batch.

**Mosques**

A mosque can select up to two different books, with one copy of each.

The mosque must also provide the details of a reference person. This person's phone number must be different from the phone number registered for the mosque.

**Schools**

Schools can request up to two different books and specify how many copies they need of each.

The maximum number of copies allowed is determined by the limit configured for that batch. Schools must also provide a reference person.

**A few rules apply to everyone:**

- Each phone number can only be used to submit one application per batch.
- Applications must be submitted while the batch is open.
- Applicants can use their reference number and registered phone number to track their applications.

### Application reference numbers

Every application receives a unique reference number.

For example:

`ASAF-CDQC-B2-032`

Here's what each part means:

- `ASAF` identifies the Foundation.
- `CDQC` identifies the campaign. It is generated from the first letters of the main words in the campaign name.
- `B2` identifies Batch 2 within that campaign.
- `032` is the application's number in that batch.

Requests for books that are not listed in any batch have a different reference format, such as:

`ASAF-RQ-001`

### Application statuses

When an application is submitted, it starts as **Pending**.

The admin team can then approve or reject it after reviewing the details.

Once the books have been handed over to the beneficiary, the application should be marked as **Fulfilled**.

At that point, the beneficiary is also added to the Beneficiaries section, where the team can see who has received books and what was given to them.

## 4. Handling book requests

Sometimes, someone may need a book that isn't available on the website or included in any current batch.

Rather than turning them away, the website provides a separate Book Request form.

Every request submitted through this form appears in the **Book requests** section of the admin dashboard.

There are a few actions the team can take:

**Approve a request**

Approving a request means the Foundation has accepted it for consideration. It does not mean the book has already been purchased.

**Reject a request**

This closes the request.

**Supply this book**

If the Foundation decides to provide the requested book, the admin can add it to either:

- The pre-fund book list, where it remains a draft until it is published with a price.
- A batch that is still in the draft stage.

A request can only be added to the supply list once.

**Mark as fulfilled**

Once the requested book has been handed over, mark the request as fulfilled. The person will then be included in the Beneficiaries section.

One additional rule applies to school requests: a school can request multiple copies of a book, but the maximum number of copies is controlled by the setting in Site settings. Individuals and mosques can only request one copy.

## 5. How email notifications work

The website uses the Foundation's Gmail account to send email notifications.

Visitors receive emails related to activities they have personally carried out or requests they have submitted.

For example, they receive an email when:

- They submit an application or book request. The email contains their reference number.
- Their application or request is approved, rejected or marked as fulfilled.
- A card payment is successful or a bank transfer is confirmed. They receive a receipt.
- They choose bank transfer when purchasing books. The email contains the bank details and their payment reference.
- The status of their book order changes.
- An unpaid bank transfer order is cancelled.
- A batch they donated to reaches its fundraising target.
- Applications open for a batch they supported.

Internal admin notes are never included in emails sent to applicants.

**Emails sent to admins**

The admin team receives a daily summary email every morning at 8:00 AM Lagos time.

It contains a summary of activities from the previous 24 hours, including new submissions and items that still need attention.

If there is nothing to report, the system simply skips sending the email.

**What happens if an email fails?**

An email failure does not stop the main action from going through. For example, an application can still be submitted even if the confirmation email fails to send.

The error is recorded in the server logs so it can be investigated.

Team invitations and password reset emails are handled by Supabase, but they use the same Gmail account and are designed to match the Foundation's other emails.

## 6. Getting around the admin dashboard

Once you log in, you'll find the different sections in the menu on the left.

Here's what each section is used for:

**Overview**

This is the first page you see after logging in. It gives you a general picture of what's happening, including items that need attention, active campaign progress, recent donations and recent admin activities.

**Campaigns**

This is where campaigns are created and managed. You can edit campaign details, activate or deactivate campaigns and update the amount raised.

For batch-based campaigns, you can also see all their batches and the funds raised for each one.

**Batches**

Here you'll find all the batches, organised under their respective campaigns.

You can create new batches, set fundraising targets, update amounts raised, add books and pickup locations, and move batches through their different stages.

**Applications**

This section contains all book applications submitted by visitors. You can review each application, approve or reject it, adjust the number of copies approved for each book and eventually mark the application as fulfilled.

**Beneficiaries**

Whenever books are successfully distributed, the recipients are recorded here. You can check who received books and what they received.

**Books**

This section manages the books visitors can purchase directly through the website.

**Book requests**

Here you'll find requests for books that are not currently listed. You can review them, approve or reject them, and arrange to supply approved requests.

**Donations**

This section keeps a record of donations made through the website. You can see where each donation was directed and whether payment has been completed.

Donation records can also be downloaded as a spreadsheet. Each download is recorded in the Activity section.

**Orders**

Orders contain records of people who paid for specific books. You can follow an order from payment through to distribution.

This is also where you confirm that a bank transfer has actually arrived in the Foundation's account.

**Activity**

This is the website's record of admin actions. It helps the team keep track of who did what and when.

**Team**

This section allows authorised admins to invite and manage other team members. It is only available to super admins.

**Site settings**

This is where the main website settings are managed, including the Foundation's name, description, contact details, social media links, announcement banner, bank accounts and payment options.

Only super admins can access this section.

**My profile**

Here, each admin can update their own name and password.

For sections with long lists, the website displays 25 records per page. You can move between pages using the navigation buttons at the bottom.

## 7. Common tasks the team will perform

Here are some of the things you'll likely need to do regularly.

### Starting a new batch

1. Go to **Batches**.
2. Click **New batch**.
3. Select the campaign the batch belongs to.
4. Enter the batch name and fundraising target.
5. Save the batch.
6. Add the books that will be distributed and the available pickup locations.

As soon as the batch is created, the website can begin collecting donations for it.

Remember that the batch remains in Draft until the team is ready to open applications.

### Updating the fundraising amount

1. Open the relevant campaign or batch.
2. Click **Edit amount**.
3. Enter the latest total from the bank account.
4. Click **Review change**.
5. Check the figures carefully.
6. Confirm the update.

Always make sure the amount matches the actual bank balance before confirming.

### Opening a batch for applications

Before opening a batch, make sure the fundraising target has been reached and the books have been purchased.

Then:

1. Open the batch.
2. Check the opening and closing dates.
3. Change its status to **Open**.

Once the batch opens, people who donated towards it will receive an email notification.

### Reviewing applications

Go to **Applications** and open the application you want to review.

Check the applicant's details and the books requested. You can specify the number of copies approved for each book before approving or rejecting the application.

After the books have been handed over, return to the application and mark it as fulfilled.

### Processing a book request

Open **Book requests** and select the request you want to handle.

You can approve or reject it. If the Foundation intends to supply the book, use **Supply this book** to add it to the pre-fund list or a draft batch.

Once the book has been given to the requester, mark the request as fulfilled.

### Confirming a bank transfer

When someone pays through bank transfer, the order will remain unpaid until an admin confirms that the money has arrived.

To confirm it:

1. Go to **Orders**.
2. Find the relevant order.
3. Check the payment in the Foundation's bank account.
4. Click **Confirm payment received**.

The donor will receive a payment receipt after confirmation.

### Recording other book distributions

If books are distributed through an arrangement that isn't recorded through the normal application process, you can still keep track of it.

Open the relevant campaign and use its distributions page to record the distribution.

### Displaying an announcement on the website

If there's an important message the Foundation wants everyone to see, you can display it using the announcement banner.

Go to **Site settings**, enable the announcement banner, enter your message and optionally add a link.

The announcement will appear below the navigation menu on every page.

### Changing the Foundation's name or description

You can update these details under **Site settings**.

Keep in mind that the name and description appear in several places, including the website header, footer, page titles, search results, link previews and emails.

There is one additional step: Supabase has separate email templates for team invitations and password resets. If the Foundation's name changes, those templates should be updated as well. See the developer section below.

### Pausing donations or applications

There may be times when the Foundation needs to temporarily stop receiving donations or book applications.

You can do this under **Site settings**.

When either option is paused, visitors will see the message you provide. Remember to switch it back on when the restriction is no longer needed.

### Managing payment options

Under **Site settings**, you can decide which payment methods are available.

Paystack and bank transfer can be enabled or disabled separately for:

- Campaign donations.
- Book purchases.

You can also update the bank account details displayed to visitors.

### Inviting a new team member

Go to **Team** and send an invitation to the person you want to add.

Only super admins can manage team members.

## 8. A few things to be careful about

There are some actions that deserve extra attention because they can affect the website or the Foundation's records.

- **Updating the amount raised:** Always check the bank balance before confirming a new figure. This is the amount visitors see on the public website.
- **Deactivating a campaign:** If you switch off a campaign while one of its batches is still collecting donations, the website will stop accepting donations for it.
- **Donor notifications:** Emails informing donors that a batch has reached its target or that applications have opened are sent only once per batch. They will not be sent again, even if the batch status or fundraising amount is changed later.

Please take a moment to check these details before making changes.

---

# 9. Technical notes for the developer

This section is intended for whoever maintains the website or works on its code.

The project is built with:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase for the database and authentication
- Paystack for payments
- Gmail for email notifications

### Setting up the project

Create a `.env.local` file in the project root and add the following environment variables:

- `NEXT_PUBLIC_SITE_URL` – The public website URL, without a trailing slash.
- `NEXT_PUBLIC_SUPABASE_URL` – The Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – The Supabase anonymous key.
- `SUPABASE_SERVICE_ROLE_KEY` – The Supabase service role key. Keep this private.
- `PAYSTACK_SECRET_KEY` – The secret key from the Paystack dashboard.
- `GMAIL_USER` – The Gmail address used to send website emails.
- `GMAIL_APP_PASSWORD` – A 16-character Gmail app password, entered without spaces. Two-Step Verification must be enabled on the Google account. Do not use the account's normal password.
- `CRON_SECRET` – A long, random secret used to protect the daily summary endpoint.

Add these same environment variables to the Vercel project and redeploy.

To install the dependencies and start the development server, run:

```bash
npm install
npm run dev
```

The website should then be available at:

`http://localhost:3000`

Other available commands include:

```bash
npm run build
npm run start
npm run lint
```

### Paystack configuration

In the Paystack dashboard, configure the following URLs using the deployed website's domain:

- **Callback URL:** `/api/paystack/callback`
- **Webhook URL:** `/api/paystack/webhook`

Make sure both point to the correct production domain.

### Email implementation

The email-related code is located in `lib/email`.

The main files are:

- `notify.ts` contains the functions responsible for sending individual email notifications.
- `layout.ts` controls the general layout and appearance shared by the emails.
- `daily-summary.ts` builds the daily summary email sent to admins.

Email notifications are sent after the main page response, so they don't hold up the user's action while waiting for an email to be delivered.

Gmail allows approximately 500 emails per day.

**Daily admin summary**

The daily summary is triggered by a Vercel cron job configured in `vercel.json`.

It runs at 07:00 UTC, which is 8:00 AM in Lagos.

The cron job calls:

`/api/cron/daily-summary`

It also requires the `CRON_SECRET` environment variable.

To test the endpoint locally, start the development server and run:

```bash
curl.exe -H "Authorization: Bearer YOUR_SECRET" http://localhost:3000/api/cron/daily-summary
```

On Vercel's free plan, cron jobs may run at any point within the scheduled hour rather than at an exact minute.

### Supabase configuration

A few things need to be configured in the Supabase dashboard.

**Authentication settings**

- Set the Site URL to the actual deployed website address.
- Configure custom SMTP using Gmail.
- Use `smtp.gmail.com` as the SMTP host.
- Set the port to `465`.
- Use the same Gmail address and app password configured in the environment variables.
- Add the Foundation's email templates under the Email Templates section.
- Make sure invitation and password reset emails redirect users to `/auth/confirm`.

New public sign-ups should be disabled. Admin accounts are created through invitations, so visitors should not be able to register for admin access themselves.

### How Site settings are stored

The website's main settings are stored in a single row in the `site_settings` table.

These include:

- Website name and description.
- Contact details.
- Social media links.
- Announcement banner.
- Bank account details.
- Payment method switches.
- Maximum number of copies a school can request.

The settings are retrieved through:

`lib/data/settings.ts`

To reduce unnecessary database requests, the settings are cached for five minutes. When an admin saves changes, the cache is cleared so the updated information can be used immediately.

If the settings row cannot be retrieved, the website falls back to the default values defined in `lib/site.ts`.

### Project structure and important files

The public-facing website is located in:

`app/(site)`

The admin dashboard is located in:

`app/admin`

A large part of the website's business rules is handled directly in Supabase through database tables, views and functions.

These include:

- Batch numbering.
- Preventing a batch from opening before it is fully funded.
- Generating application reference numbers.
- Enforcing application and book request limits.
- Recording privacy notice consent.

There are also some shared helper files worth knowing about:

- `lib/admin/flash.ts` handles success and error messages when admins are redirected after an action.
- `lib/admin/pagination.ts` controls the number of records displayed per page.
- `lib/admin/audit.ts` records admin activities.
- `lib/uuid.ts` handles ID validation in one central location.

**Homepage statistics**

The statistics displayed on the homepage are retrieved from a Supabase database view called:

`public_impact`

One important detail: this view must remain configured to run with the database owner's permissions.

If you change it to run with the visitor's permissions in the Supabase dashboard, the statistics will no longer appear to public visitors.

Supabase may display a security warning for this configuration. That warning is expected for the current implementation.

---

This covers the main things the Foundation's team needs to know about using the website, as well as the technical details needed to maintain it.
