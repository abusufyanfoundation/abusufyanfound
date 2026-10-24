# Abu Sufyan Al-Alma'iyy Foundation website

This is the website of the Abu Sufyan Al-Alma'iyy Foundation, which gives the Qur'an and Islamic books to students of knowledge, Islamic schools and mosques.

The site has two sides. The public side is what visitors see: they read about the Foundation, give money, pay for specific books, and apply for books. The admin side is where the team runs everything. It is at `/admin` and needs a login.

This file explains how it all works in plain words. The last section is for whoever looks after the code.

## What visitors can do

- **Give to a campaign.** They choose where the gift goes, then pay online with Paystack or by bank transfer.
- **Pay for specific books.** They choose books from the list and pay, and the Foundation buys exactly those books.
- **Apply for books.** When a batch is open, individuals, mosques and schools can apply for books from it.
- **Track an application.** With the reference number and the phone number they applied with, anyone can see where their application stands.
- **Ask for a book that is not on a list.** This is a separate request form.

Everyone who applies or asks for a book has to give an email address, and ticks a box to say they have read the privacy notice. The site saves the date and time of that, and which version of the notice they saw.

## Campaigns and batches

A **campaign** is a fund with a name. There are two kinds.

A **general campaign** is a normal fundraiser with a target amount. Gifts go towards that target.

A **batch-based campaign** is a fundraiser that keeps going and buys books in rounds. Each round is a **batch**: Batch 1, Batch 2 and so on. Every batch has its own target and its own money, so Batch 3 starts at zero even if the earlier batches raised a lot.

Two campaigns can be live at the same time, one of each kind. If you try to switch on a second one of the same kind, the site asks you to switch the other off first.

### How a batch moves along

1. **Draft.** The batch is being prepared. The website takes donations for it, and you add its books and pickup locations. Applicants cannot see it.
2. **Open.** The target is reached, the books are bought, and people can apply. The system only lets a batch open once its raised amount has reached its target.
3. **Closed.** Applications have ended and you review them.
4. **Fulfilled.** The books have been given out. This is what counts as a completed batch.

Between batches, the home page says the next batch opens soon, and people can still give to the Foundation in general.

### The amount raised

The raised amount is typed in by an admin. The site does not work it out. Type the total from the bank account, including what came through Paystack, because Paystack pays out to the same account.

The box is locked until you press **Edit amount**. After typing a new figure, press **Review change**. It shows the old amount, the new amount and the difference, and only then can you confirm. The site will not accept a total lower than what has already been paid through the website.

The website updates as soon as you confirm. Every change is saved in the activity list with the old and new figure and the name of the person who made it.

## Applying for books

There are three kinds of applicants.

- **Individuals** choose one book and get one copy. They collect it from one of the batch's pickup locations.
- **Mosques** can choose up to two different books and get one copy of each. They give a reference person, who needs a different phone number from theirs.
- **Schools** can choose up to two different books and ask for several copies of each, up to the limit set on the batch. They also give a reference person.

Each phone number can apply once per batch.

When someone applies, they get a reference like `ASAF-CDQC-B2-032`:

- `ASAF` is the Foundation.
- `CDQC` is the campaign. It is made from the first letters of the main words in the campaign name.
- `B2` is the batch number inside that campaign.
- `032` is the number of this application in the batch.

Requests for a book that is not on any list get a reference like `ASAF-RQ-001`.

An application starts as **pending**, then becomes **approved** or **rejected**. Once the books are handed over it becomes **fulfilled**, and the person appears in the Beneficiaries list.

## Book requests

A book request is for a book that is not on any batch list. Each one has its own page in Book requests.

- **Approve.** The request goes on your list. This does **not** mean the book has been bought.
- **Reject.** The request is closed.
- **Supply this book.** On an approved request, you can add the book to the pre-fund list (as a draft with a price, so nothing shows until you list it) or to a batch that is still in draft. A request can be added only once.
- **Mark as fulfilled.** Use this once the books are handed over. The person is added to Beneficiaries.

A school can ask for several copies in one request. The most copies a school can ask for is set in Site settings, and individuals and mosques always ask for one.

## Emails

The site sends emails from the Foundation's Gmail address. People only get an email about something they did or asked for.

**To visitors:**

- When they apply or ask for a book: a message with their reference.
- When their application or request is approved, rejected or fulfilled. Internal notes are never included.
- When a card payment goes through, or when a bank transfer is confirmed: a receipt.
- When someone chooses bank transfer for books: the bank details and their reference.
- When the status of a book order changes, or when an unpaid transfer order is cancelled.
- To people who gave to a batch: when the batch reaches its target, and when applications open.

**To admins:** one summary email each morning at 8:00, Lagos time. It shows what came in during the last 24 hours and what is waiting for review. On a day with nothing to report, no email is sent.

If an email cannot be sent, nothing else breaks. The action still goes through, and the problem is written to the server log.

Invitations to join the team and password reset emails are sent by Supabase, using the same Gmail address and the same look.

## The admin area

Everything is in the menu on the left. Team and Site settings only show for super admins.

- **Overview.** What needs attention, how the live campaigns are doing, recent donations and recent activity.
- **Campaigns.** Create and edit campaigns, switch them on or off, set the amount raised. A batch-based campaign shows all its batches with their money.
- **Batches.** All batches, grouped by campaign. Inside a batch you set the target and the amount raised, add books and pickup locations, and change its status.
- **Applications.** Review what people applied for, approve or reject, and mark as fulfilled.
- **Beneficiaries.** Everyone who has received books, and what they received.
- **Books.** The books people can pay for on the website.
- **Book requests.** Requests for books that are not on any list.
- **Donations.** Every gift made through the website, where it went, and whether it was paid. You can download the list as a spreadsheet, and each download is written to the activity list.
- **Orders.** What people paid for when they chose specific books, from paid through to distributed. This is where you confirm that a bank transfer has arrived.
- **Activity.** A record of what every admin did and when.
- **Team.** Invite and manage admins. Super admins only.
- **Site settings.** The name and description of the site, contact details, social links, the banner, bank accounts and the switches below. Super admins only.
- **My profile.** Your own name and password.

Long lists show 25 rows at a time, with page buttons at the bottom.

## Everyday jobs

**Start a new batch.** In Batches, choose New batch, pick the campaign, name the batch and set its target. The site starts collecting donations for it straight away. Then add its books and pickup locations.

**Update the amount raised.** Open the campaign or the batch, press Edit amount, type the new total from the bank, press Review change, check the figures and confirm.

**Open a batch for applications.** Once the raised amount has reached the target and the books are bought, change the batch's status to Open. Check the opening and closing dates first. The people who gave to that batch get an email.

**Handle applications.** Open each one in Applications, set how many copies are approved for each book, and approve or reject it. After the books are handed over, mark it as fulfilled.

**Handle a book request.** Open it in Book requests. Approve or reject it. If you will supply the book, use Supply this book to put it on the pre-fund list or into a draft batch.

**Confirm a bank transfer.** In Orders, find the order, check the money in the bank, and press Confirm payment received. The donor gets a receipt.

**Record books given out another way.** Open the campaign and use its distributions page.

**Show a message to everyone.** In Site settings, turn on the announcement banner, write the text, and add a link if you like. It shows under the menu on every page.

**Change the name or description of the site.** In Site settings. They appear in the header, footer, page titles, search results, link previews and emails. The emails Supabase sends for team invitations and password resets have the name typed into them, so change those too (see the developer section).

**Pause giving or applications.** In Site settings you can pause donations or applications. Visitors see the message you write. Remember to turn it off again.

**Choose how people can pay.** In Site settings you can switch Paystack and bank transfer on or off separately for campaign gifts and for book payments, and set the bank details donors see.

**Add a team member.** In Team, send an invitation.

## Please be careful with

- The raised amount. It is the number the public sees. Check it against the bank before you confirm.
- Switching a campaign off while a batch is collecting. The website stops taking donations for it.
- Saving the raised amount of a batch more than once around its target. Each time it crosses the target, the donors of that batch are emailed, so type the final figure.

## For the developer

The website is built with Next.js 16, React 19, TypeScript and Tailwind CSS 4. Supabase provides the database and the login, Paystack handles payments, and Gmail sends the emails.

Create a `.env.local` file with:

- `NEXT_PUBLIC_SITE_URL`, the public address of the site, with no slash at the end.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, from your Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY`, from the same place. Keep it secret.
- `PAYSTACK_SECRET_KEY`, from your Paystack dashboard.
- `GMAIL_USER`, the Gmail address the emails are sent from.
- `GMAIL_APP_PASSWORD`, a 16-letter app password for that account, written without spaces. It needs 2-Step Verification switched on in the Google account. Do not use the normal password.
- `CRON_SECRET`, any long random text. It protects the daily summary address.

Add the same values in Vercel and redeploy.

Then:

```
npm install
npm run dev
```

The site opens at `http://localhost:3000`. Other commands are `npm run build`, `npm run start` and `npm run lint`.

In Paystack, set the callback address to `/api/paystack/callback` and the webhook address to `/api/paystack/webhook` on your site.

### Emails

The code is in `lib/email`. `notify.ts` has one function for each email, `layout.ts` builds the look of every email, and `daily-summary.ts` builds the morning summary for admins. Emails are sent after the page has responded, so they never slow anything down. Gmail allows about 500 emails a day.

The daily summary is started by a Vercel cron job, set in `vercel.json` to run at 07:00 UTC, which is 8:00 in Lagos. It calls `/api/cron/daily-summary` and needs the `CRON_SECRET`. To try it from your computer, start the site and run `curl.exe -H "Authorization: Bearer YOUR_SECRET" http://localhost:3000/api/cron/daily-summary`. On a free Vercel plan it runs at some point inside that hour.

In the Supabase dashboard:

- Under Authentication, set the Site URL to the real address of the site.
- Set up custom SMTP with `smtp.gmail.com`, port `465`, the same Gmail address and app password, so invitations and password resets come from the Foundation.
- Paste the Foundation's email templates into the Email templates section. Invitations and password resets send people to `/auth/confirm`.
- Switch off new sign-ups, because only invited people should ever have an account.

### Site settings

The name, description, contact details, banner, bank accounts, payment switches and the school copy limit are stored in one row of the `site_settings` table and read through `lib/data/settings.ts`. The copy is kept for 5 minutes and cleared when an admin saves. If the row cannot be read, built-in defaults from `lib/site.ts` are used.

### Where things are

The public site is in `app/(site)` and the admin area in `app/admin`. Most of the rules live in the database, as tables, views and functions in Supabase: the batch numbering, the rule that a batch only opens once it is funded, the application reference format, the limits on applications and book requests, and the record of consent.

Small shared helpers are in `lib/admin`: `flash.ts` sends an admin back to a page with a success or error message, `pagination.ts` holds the page size, and `audit.ts` writes the activity list. `lib/uuid.ts` is the one place that checks an id.

The statistics on the home page come from a database view called `public_impact`. Leave it set to run with the owner's rights. If you switch it to run with the visitor's rights in the Supabase dashboard, the numbers disappear for visitors. The security warning Supabase shows for it is expected.