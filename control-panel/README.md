# AI Drive-Thru Control Panel

Next.js-based Control Panel for managing the AI Drive-Thru system.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query + Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **UI Icons**: Lucide React
- **Notifications**: Sonner

## Project Structure

```
control-panel/
├── app/                      # Next.js app directory
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── providers.tsx        # React Query provider
│   ├── branches/            # Branch management pages
│   ├── menus/               # Menu management pages
│   └── categories/          # Category management pages
├── components/              # Reusable components
│   ├── AppLayout.tsx        # Main app layout with sidebar
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── branches/            # Branch-specific components
│   ├── menus/               # Menu-specific components
│   └── categories/          # Category-specific components
├── lib/                     # Utility libraries
│   ├── api-client.ts        # Axios configuration
│   └── api/                 # API service functions
│       ├── branches.ts
│       ├── menus.ts
│       ├── categories.ts
│       ├── items.ts
│       ├── variants.ts
│       ├── addons.ts
│       └── keywords.ts
├── types/                   # TypeScript type definitions
│   └── api.ts              # API types matching backend models
└── hooks/                   # Custom React hooks

```

## Setup Instructions

### 1. Install Dependencies

```bash
cd control-panel
npm install
```

### 2. Configure Environment

Copy the `.env.local` file and update if needed:

```bash
# Already exists with default values
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Ensure Backend is Running

Make sure the backend API is running at `http://localhost:8000`:

```bash
# From project root
python main.py
```

## Implemented Features

### ✅ Core Infrastructure
- [x] Next.js project setup with TypeScript
- [x] Tailwind CSS configuration
- [x] React Query for data fetching
- [x] Axios API client with interceptors
- [x] Error handling and notifications
- [x] TypeScript types for all API models

### ✅ Branch Management
- [x] List all branches
- [x] Create new branch
- [x] Edit branch details
- [x] Delete branch
- [x] Toggle branch active status
- [x] Form validation with Zod

### ✅ Menu Management
- [x] List all menus
- [x] Filter menus by branch
- [x] Create new menu (bilingual)
- [x] Edit menu details
- [x] Delete menu
- [x] Publish menu
- [x] Validate menu
- [x] View menu details page
- [x] Menu status indicators

### ✅ Category Management
- [x] View categories within menu
- [x] Create new category (bilingual)
- [x] Edit category details
- [x] Delete category
- [x] Set display order
- [x] Toggle category active status

## Remaining Work

### 📋 Item Management (High Priority)
Need to create:
- `/app/categories/[id]/page.tsx` - Category detail page showing items
- `/components/items/ItemFormModal.tsx` - Item create/edit form
- Item list view with variants and add-ons
- Item detail management

### 📋 Variant & Add-on Management
Need to create:
- `/components/items/VariantFormModal.tsx` - Variant form
- `/components/items/AddOnFormModal.tsx` - Add-on form
- Variant type selector (size, style, temperature, custom)
- Default variant per type validation

### 📋 Keyword Management
Need to create:
- `/components/items/KeywordManager.tsx` - Keyword management component
- Add/remove keywords for items
- Bilingual keyword support

### 📋 Dashboard Page
Need to create:
- `/app/dashboard/page.tsx` - System overview
- Health status indicators
- Statistics cards
- Recent activity log

### 📋 Settings Page
Need to create:
- `/app/settings/page.tsx` - System settings
- AI model configuration
- Voice settings
- System parameters

## API Integration

All API endpoints are integrated via service functions in `lib/api/`:

```typescript
// Example usage
import { branchesApi, menusApi, categoriesApi } from '@/lib/api'

// Get all branches
const branches = await branchesApi.getAll()

// Create menu
const menu = await menusApi.create({
  branch_id: 1,
  name_ar: 'القائمة الرئيسية',
  name_en: 'Main Menu'
})

// Validate menu
const validation = await menusApi.validate(menuId)
```

## Form Validation

All forms use Zod schemas for validation:

```typescript
const schema = z.object({
  name_ar: z.string().min(1).max(200),
  name_en: z.string().min(1).max(200),
  // ... more fields
})
```

## State Management

- **React Query**: Server state (API data)
- **Zustand**: Client state (if needed for global UI state)

## Styling Conventions

- Use Tailwind utility classes
- Follow mobile-first responsive design
- Consistent spacing: `px-4 py-2`, `space-x-3`, etc.
- Color scheme:
  - Primary: Blue (`blue-600`)
  - Success: Green (`green-600`)
  - Warning: Yellow (`yellow-600`)
  - Error: Red (`red-600`)

## Component Patterns

### Modal Components
All modal forms follow this pattern:
- Fixed overlay with z-50
- Centered modal with max-width
- Close button (X icon)
- Form with validation
- Cancel/Submit buttons

### List/Grid Pages
- AppLayout wrapper
- Header with title, description, and action buttons
- Loading spinner during fetch
- Grid of cards for data
- Empty state with CTA

## Development Guidelines

1. **Type Safety**: Always use TypeScript types from `types/api.ts`
2. **Error Handling**: Let the API client interceptor handle errors
3. **Loading States**: Show spinners during mutations
4. **Optimistic Updates**: Use React Query's `onSuccess` to invalidate queries
5. **Form Validation**: Use Zod schemas with React Hook Form
6. **Accessibility**: Include proper ARIA labels and keyboard navigation

## Build Commands

```bash
# Development
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Testing

Currently no tests implemented. Recommended to add:
- Jest + React Testing Library for unit tests
- Playwright for E2E tests

## Deployment

The Control Panel can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any platform supporting Next.js

## Backend API Reference

Base URL: `http://localhost:8000/api/v1`

### Branch Endpoints
- `GET /branches` - List branches
- `POST /branches` - Create branch
- `GET /branches/{id}` - Get branch
- `PUT /branches/{id}` - Update branch
- `DELETE /branches/{id}` - Delete branch

### Menu Endpoints
- `GET /menus` - List menus
- `POST /menus` - Create menu
- `GET /menus/{id}` - Get menu
- `GET /menus/{id}/full` - Get full menu with categories/items
- `PUT /menus/{id}` - Update menu
- `DELETE /menus/{id}` - Delete menu
- `POST /menus/{id}/publish` - Publish menu
- `GET /menus/{id}/validate` - Validate menu

### Category Endpoints
- `GET /categories` - List categories
- `POST /categories` - Create category
- `GET /categories/{id}` - Get category
- `PUT /categories/{id}` - Update category
- `DELETE /categories/{id}` - Delete category

### Item, Variant, Add-on, Keyword Endpoints
See backend documentation for complete API reference.

## License

Same as parent project

---

**Status**: Phase 4 - Partially Complete
- Core infrastructure: ✅ Complete
- Branch management: ✅ Complete
- Menu management: ✅ Complete
- Category management: ✅ Complete
- Item management: 📋 Pending
- Variant/Add-on management: 📋 Pending
- Keyword management: 📋 Pending
- Dashboard: 📋 Pending
- Settings: 📋 Pending
