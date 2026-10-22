# Abu Sufyan Al-Alma'iyy Foundation website

This is the website of the Abu Sufyan Al-Alma'iyy Foundation, which gives the Qur'an and Islamic books to students of knowledge, Islamic schools and mosques.

The site has two sides. The public side is what visitors see: they read about the Foundation, give money, pay for specific books, and apply for books. The admin side is where the team runs everything. It is at `/admin` and needs a login.

This file explains how it all works in plain words. The last section is for whoever looks after the code.

## What visitors can do

- **Give to a campaign.** They choose where the gift goes, then pay online with Paystack or by bank transfer.
- **Pay for specific books.** They choose books from the list and pay, and the Foundation buys exactly those books.
- **Apply for books.** When a batch is open, students, mosques and schools can apply for books from it.
- **Track an application.** With the reference number and the phone number they applied with, anyone can see where their application stands.
- **Ask for a book that is not on a list.** This is a separate request form.

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

## The admin area

Everything is in the menu on the left. Team and Site settings only show for super admins.

- **Overview.** What needs attention, how the live campaigns are doing, recent donations and recent activity.
- **Campaigns.** Create and edit campaigns, switch them on or off, set the amount raised. A batch-based campaign shows all its batches with their money.
- **Batches.** All batches, grouped by campaign. Inside a batch you set the target and the amount raised, add books and pickup locations, and change its status.
- **Applications.** Review what people applied for, approve or reject, and mark as fulfilled.
- **Beneficiaries.** Everyone who has received books, and what they received.
- **Books.** The books people can pay for on the website.
- **Book requests.** Requests for books that are not on any list.
- **Donations.** Every gift made through the website, where it went, and whether it was paid. You can download the list as a spreadsheet.
- **Orders.** What people paid for when they chose specific books, from paid through to distributed.
- **Activity.** A record of what every admin did and when.
- **Team.** Invite and manage admins. Super admins only.
- **Site settings.** Contact details, social links, the banner, bank accounts and the switches below. Super admins only.
- **My profile.** Your own name and password.

## Everyday jobs

**Start a new batch.** In Batches, choose New batch, pick the campaign, name the batch and set its target. The site starts collecting donations for it straight away. Then add its books and pickup locations.

**Update the amount raised.** Open the campaign or the batch, press Edit amount, type the new total from the bank, press Review change, check the figures and confirm.

**Open a batch for applications.** Once the raised amount has reached the target and the books are bought, change the batch's status to Open. Check the opening and closing dates first.

**Handle applications.** Open each one in Applications, set how many copies are approved for each book, and approve or reject it. After the books are handed over, mark it as fulfilled.

**Record books given out another way.** Open the campaign and use its distributions page.

**Show a message to everyone.** In Site settings, turn on the announcement banner, write the text, and add a link if you like. It shows under the menu on every page.

**Pause giving or applications.** In Site settings you can pause donations or applications. Visitors see the message you write. Remember to turn it off again.

**Choose how people can pay.** In Site settings you can switch Paystack and bank transfer on or off separately for campaign gifts and for book payments, and set the bank details donors see.

**Add a team member.** In Team, send an invitation.

## Please be careful with

- The raised amount. It is the number the public sees. Check it against the bank before you confirm.
- Switching a campaign off while a batch is collecting. The website stops taking donations for it.

## For the developer

The website is built with Next.js 16, React 19, TypeScript and Tailwind CSS 4. Supabase provides the database and the login, and Paystack handles payments.

Create a `.env.local` file with:

- `NEXT_PUBLIC_SITE_URL`, the public address of the site, with no slash at the end.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, from your Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY`, from the same place. Keep it secret.
- `PAYSTACK_SECRET_KEY`, from your Paystack dashboard.

Then:

```
npm install
npm run dev
```

The site opens at `http://localhost:3000`. Other commands are `npm run build`, `npm run start` and `npm run lint`.

In Paystack, set the callback address to `/api/paystack/callback` and the webhook address to `/api/paystack/webhook` on your site.

The public site is in `app/(site)` and the admin area in `app/admin`. Most of the rules live in the database, as tables, views and functions in Supabase: the batch numbering, the rule that a batch only opens once it is funded, the application reference format and the limits on applications.

The statistics on the home page come from a database view called `public_impact`. Leave it set to run with the owner's rights. If you switch it to run with the visitor's rights in the Supabase dashboard, the numbers disappear for visitors. The security warning Supabase shows for it is expected.