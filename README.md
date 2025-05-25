# NFT Ticket Marketplace

NFT Ticket Marketplace is a modern web application that allows users to purchase, manage, and transfer event tickets as NFTs (Non-Fungible Tokens). The platform ensures secure, authentic, and easily transferable tickets for a variety of events, leveraging blockchain wallet integration for seamless user experience.

## Features

- Browse and purchase tickets for various events as NFTs
- Secure wallet connection and management
- Dashboard for users to view and manage their tickets
- Responsive, modern UI with dark mode support

## Tech Stack & Dependencies

- **Framework:** [Next.js](https://nextjs.org/) (v15)
- **UI & Styling:** Tailwind CSS, Radix UI, Lucide React Icons
- **State & Forms:** React, React Hook Form, Zod
- **Blockchain:** Simulated wallet connection (can be extended for real blockchain integration)
- **Other:** date-fns, recharts, embla-carousel-react, and more

### Main dependencies (from `package.json`):

- `next`
- `react`, `react-dom`
- `@radix-ui/react-*` (various UI primitives)
- `tailwindcss`, `postcss`, `autoprefixer`
- `react-hook-form`, `zod`
- `clsx`, `lucide-react`, `date-fns`, `recharts`
- See `package.json` for the full list.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [pnpm](https://pnpm.io/) (or use npm/yarn, but pnpm is recommended for this project)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dxmaptin/Eureka.git
   cd <project-directory>
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

### Running the Development Server

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### Building for Production

```bash
pnpm build
pnpm start
# or
npm run build && npm start
# or
yarn build && yarn start
```

### Linting

```bash
pnpm lint
# or
npm run lint
# or
yarn lint
```

## Wallet Integration

The app includes a simulated wallet connection for demo purposes. For real blockchain integration, extend the `WalletProvider` in `context/wallet-context.tsx` to connect to actual wallet providers (e.g., MetaMask, WalletConnect).

## Project Structure

- `app/` - Main Next.js app directory (pages, layouts, etc.)
- `components/` - Reusable UI components
- `context/` - React context providers (e.g., wallet)
- `styles/` - Global and component styles
- `public/` - Static assets

## Customization

- Update event data in `app/page.tsx` or connect to a backend for dynamic events.
- Customize UI components in the `components/` directory.

## License

MIT
