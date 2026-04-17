# IELTS AI Tutor

A premium IELTS preparation platform with conversational AI tutor experience.

## Features

- **Speaking Module**: Complete IELTS speaking test practice with AI examiner
- **Conversational AI**: Real-time, natural conversation experience
- **Admin Dashboard**: Organization management and analytics
- **Superadmin Console**: Platform-level configuration
- **Fully Responsive**: Works on desktop, tablet, and mobile

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── modules/           # Modules overview
│   ├── speaking/          # Speaking module
│   ├── admin/             # Admin dashboard
│   └── superadmin/        # Superadmin console
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── layout/           # Layout components
└── types/                # TypeScript types

```

## Routes

- `/` - Landing page
- `/modules` - IELTS modules overview
- `/speaking` - Speaking module landing
- `/speaking/test/instructions` - Test instructions
- `/speaking/test/part-1` - Speaking Part 1
- `/speaking/test/part-2` - Speaking Part 2 (Cue Card)
- `/speaking/test/part-3` - Speaking Part 3 (Discussion)
- `/speaking/test/result` - Test results
- `/admin` - Admin dashboard
- `/superadmin` - Superadmin console

## Demo Notes

- This is a **frontend-only** demo
- All data is **mock/placeholder**
- Recording features show "Coming Soon"
- No authentication required (all routes are open)
- Backend integration is the next phase

## License

Educational demonstration purposes only.
