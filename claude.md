# Kanji Learn - Claude Code Configuration

## Project Overview

Kanji Learn is a Japanese language learning tool that visualizes kanji information and decomposition in interactive 2D/3D graph form. It helps learners understand the relationships between kanji characters, their radicals, and components.

**Live Site**: [thekanjimap.com](https://thekanjimap.netlify.app)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: v19 RC
- **TypeScript**: v5.7
- **Styling**: Tailwind CSS v4
- **State Management**: Jotai (for global state), Zustand (for stores)
- **UI Components**: Radix UI primitives
- **Visualization**: react-force-graph (2D & 3D)
- **Animations**: Framer Motion
- **Deployment**: Netlify

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [id]/              # Individual kanji detail pages
│   ├── list/              # Kanji list view
│   ├── radicals/          # Radicals reference page
│   ├── about/             # About page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Radix UI component wrappers (shadcn/ui style)
│   ├── graph-2D.tsx      # 2D force graph visualization
│   ├── graph-3D.tsx      # 3D force graph visualization
│   ├── draw-input.tsx    # Handwriting recognition input
│   ├── kanji-card.tsx    # Kanji display card
│   ├── kanji-filter.tsx  # Filter controls
│   └── ...               # Other components
└── lib/                   # Utility functions and shared logic
    ├── store.tsx          # Zustand store
    ├── handwriting.ts     # Handwriting recognition logic
    └── utils.ts           # Utility functions
```

## Development Guidelines

### Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run with Turbopack (faster)
npm run turbo

# Build for production
npm run build

# Lint code
npm run lint
```

### Code Conventions

1. **Components**
   - Use functional components with TypeScript
   - Prefer client components (`"use client"`) only when necessary (interactivity, hooks)
   - Server components by default for better performance
   - Use descriptive component names (e.g., `KanjiCard`, `GraphControls`)

2. **Styling**
   - Use Tailwind CSS utility classes
   - Follow the existing pattern for UI components (shadcn/ui style)
   - Use `cn()` utility from `lib/utils.ts` for conditional classes
   - Responsive design: mobile-first approach

3. **State Management**
   - Use Jotai atoms for simple global state
   - Use Zustand for more complex stores (see `lib/store.tsx`)
   - Keep component state local when possible

4. **File Naming**
   - Components: kebab-case (e.g., `kanji-card.tsx`)
   - Pages: Next.js convention (`page.tsx`, `layout.tsx`)
   - Utilities: kebab-case (e.g., `handwriting.ts`)

5. **TypeScript**
   - Always use proper typing, avoid `any`
   - Define interfaces for component props
   - Use type inference where appropriate

### Important Patterns

1. **Server/Client Component Split**
   - Many pages have an `inner.tsx` file for client-side logic
   - The `page.tsx` file handles server-side rendering and data fetching
   - Example: `app/[id]/page.tsx` (server) → `app/[id]/inner.tsx` (client)

2. **Graph Visualization**
   - 2D and 3D graphs show kanji relationships
   - Nodes represent kanji or radicals
   - Edges represent decomposition relationships
   - Graph data is processed from KanjiVG data

3. **Kanji Data Sources**
   - KanjiVG: Decomposition and stroke order
   - Jisho.org: Dictionary information, meanings, readings
   - Kanji Alive: Radical information
   - AnimCJK: Stroke animations

### Working with Kanji Data

- Kanji are indexed by their Unicode character or ID
- Each kanji has metadata: readings (kunyomi/onyomi), meanings, JLPT level, frequency rank
- Radicals are special components that form the basis of kanji
- The graph shows how kanji decompose into simpler components

### Performance Considerations

- Use Next.js Image component for images
- Implement proper code splitting
- Be mindful of graph rendering performance (large datasets)
- Use React.memo() for expensive components
- Leverage Next.js caching strategies

### Testing Changes

Before committing:
1. Test on both desktop and mobile viewports
2. Check dark/light theme appearance
3. Verify graph interactions work smoothly
4. Test search and filter functionality
5. Ensure page navigation works correctly

### Common Tasks

**Adding a new page:**
- Create `app/your-page/page.tsx` (server component)
- If interactivity needed, create `app/your-page/inner.tsx` (client component)
- Update navigation in header component if needed

**Adding a new UI component:**
- Create in `components/` directory
- Follow Radix UI + Tailwind pattern for consistency
- Add proper TypeScript types

**Modifying kanji display:**
- Check `components/kanji.tsx` and `components/kanji-card.tsx`
- Kanji data structure is defined in `lib/index.ts`

### Accessibility

- Use semantic HTML elements
- Ensure proper ARIA labels
- Maintain keyboard navigation
- Test with screen readers when possible
- Follow Radix UI accessibility patterns

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- WebGL support required for 3D graphs

## Data Attribution

This project uses data from multiple open-source sources (see README.md for full credits):
- KanjiVG (CC BY-SA 3.0)
- Jisho.org
- Kanji Alive (CC 4.0)
- AnimCJK (Arphic Public License)

When modifying data processing, respect the licenses of source data.

## Deployment

- Automatic deployment via Netlify on push to main branch
- Preview deployments for pull requests
- Environment variables managed in Netlify dashboard

## Need Help?

- Check the [Next.js 15 documentation](https://nextjs.org/docs)
- Review [Radix UI components](https://www.radix-ui.com/)
- See [Tailwind CSS docs](https://tailwindcss.com/docs)
- Consult the original data sources for kanji information

## Notes for Claude Code

- This is an educational project focused on Japanese language learning
- The codebase uses modern React patterns (App Router, Server Components)
- Performance is important due to graph visualizations with many nodes
- Mobile experience is crucial as many language learners use mobile devices
- Maintain the clean, minimal UI aesthetic
- Be careful when modifying data processing logic - kanji data is complex
