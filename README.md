This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Moderation Backend

The works, aspirations, gallery, document library, admin review, and email notification flows use Supabase and Resend.

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in its SQL Editor.
2. Create an Auth user for each BEM administrator. Promote an administrator by inserting their Auth user ID into `public.profiles` with `role = 'admin'` from the SQL Editor.
3. Copy `.env.example` to `.env.local` and set the Supabase URL, anon key, service-role key, Resend API key, and a sender address on a verified Resend domain. Keep the service-role key and Resend key server-only; never add a `NEXT_PUBLIC_` prefix to them.
4. Restart the development server. Public submissions are held for admin review; only approved works and aspirations are public. A rejected or approved work sends a status email through Resend.

Without these environment values and the SQL setup, backend-backed submissions, admin review, document uploads, and gallery posts remain unavailable. Calendar entries keep a local browser-storage fallback for demo use; with Supabase configured they are shared through `calendar_events`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
