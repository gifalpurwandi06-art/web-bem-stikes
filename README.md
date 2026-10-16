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

## Project Structure Overview

This project follows the standard Next.js App Router structure, where each folder has a distinct responsibility.

```markdown
web-bem-stikes/
├── app/
│ ├── api/ # Server-side route handlers for API endpoints
│ ├── dashboard/ # Route-based pages for dashboard features
│ ├── aspirasi/ # Page and UI for aspirations module
│ ├── dokumen/ # Page and UI for document module
│ ├── galeri/ # Page and UI for gallery module
│ ├── karya/ # Page and UI for works module
│ ├── kegiatan/ # Page and UI for activity/calendar module
│ ├── konsultasi/ # Page and UI for consultation module
│ ├── struktur/ # Page and UI for organizational structure
│ ├── globals.css # Global styling and shared CSS rules
│ ├── layout.tsx # Root app layout for all pages
│ └── page.tsx # Homepage route /
├── lib/
│ ├── supabase/ # Supabase client/server configuration and helpers
│ ├── calendar-events.ts # Calendar related utilities
│ ├── use-admin-session.ts # Custom hook for admin session logic
│ └── use-calendar-events.ts # Custom hook for calendar data access
├── public/ # Static assets such as images and icons
├── supabase/
│ └── schema.sql # Database schema and SQL setup for persistence
├── .env.example # Example environment variables
├── .gitignore # Git ignore rules
├── next.config.ts # Next.js configuration
├── next-env.d.ts # TypeScript Next.js environment declarations
├── package.json # Project scripts and dependencies
├── tsconfig.json # TypeScript compiler settings
├── postcss.config.mjs # PostCSS configuration
├── eslint.config.mjs # Linting rules
├── README.md # Project documentation
└── ...
```

### Folder responsibilities

- `app/`: main application route structure. In Next.js, this folder is responsible for pages, layouts, and route handlers. It groups the app into functional modules based on URL paths.
- `app/api/`: handles server-side endpoints and backend-like logic such as moderation actions, data operations, and API responses.
- `lib/`: stores reusable logic, helper functions, hooks, and service abstractions used across multiple pages/features.
- `lib/supabase/`: centralizes Supabase connection and configuration, ensuring data access stays separated from UI code.
- `public/`: stores static files that are served directly by the browser without bundling.
- `supabase/`: stores database schema and infrastructure definitions for persistence-related setup.
- Root config files (`package.json`, `next.config.ts`, `tsconfig.json`, etc.): manage the framework, dependencies, TypeScript, linting, and build behavior of the project.

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
