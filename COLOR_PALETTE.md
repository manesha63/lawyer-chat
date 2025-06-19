# Lawyer Chat Color Palette Reference

## Primary Brand Colors

### Light Mode
- **Primary Blue**: `#004A84` - Dark blue used for headings, buttons, and branding
- **Light Blue**: `#226EA7` - Used for user message bubbles
- **Gold Accent**: `#C7A562` - Used for buttons, accents, and new chat buttons
- **Light Gold**: `#E1C88E` - Used for welcome message and secondary buttons
- **Gold Hover States**: 
  - `#B59552` - Darker gold for hover on `#C7A562`
  - `#D4B67D` - Darker gold for hover on `#E1C88E`

### Dark Mode
- **Background**: `#1a1b1e` - Main dark background
- **Sidebar/Secondary Background**: `#25262b` - Darker sections and input fields
- **Text Primary**: `#D1D5DB` - Main text color in dark mode
- **Text Muted**: `#8E8E93` - Secondary/muted text
- **Border**: `#2E2E38` - Border color in dark mode
- **White**: `#ffffff` - Used for high contrast text and borders
- **Light Gray**: `#d1d1d1` - Used for button text and borders

## Component-Specific Colors

### Page.tsx (Main Chat Interface)

#### Light Mode
- Header title: `#004A84`
- User message bubble: `#226EA7`
- Assistant text: `#000000` (black) / `text-gray-900`
- Welcome message: `#E1C88E`
- Send button: `#C7A562` (hover: `#B59552`)
- Send button icon: `#004A84`
- Input placeholder: `text-gray-500`
- Citation links: `#004A84` / `text-blue-800` (hover: `text-blue-900`)
- Sources header: `text-gray-800`
- Tool dropdown selected: `bg-blue-50`, `text-blue-700`
- Tool dropdown hover: `bg-gray-100`, `text-gray-700`
- Markdown code blocks: `bg-gray-100`, `text-gray-800`
- Markdown blockquotes: `border-gray-300`, `text-gray-700`
- Markdown links: `text-blue-600` (hover: `text-blue-800`)

#### Dark Mode
- Header title: `#ffffff`
- User message bubble: `#2a2b2f`
- Assistant text: `text-gray-100`
- Welcome message: `#9CA3AF`
- Send button: transparent with `#d1d1d1` border
- Send button hover: `rgba(209, 209, 209, 0.1)`
- Send button icon: `#d1d1d1`
- Input background: `#25262b`
- Input text: `text-gray-100`
- Input placeholder: `text-gray-400`
- Citation links: `text-blue-400` (hover: `text-blue-300`)
- Sources header: `text-gray-300`
- Tool dropdown: `bg-[#25262b]`
- Tool dropdown selected: `bg-blue-900`, `text-blue-200`
- Tool dropdown hover: `bg-gray-700`, `text-gray-300`
- Markdown code blocks: `bg-gray-700`, `text-gray-300`
- Markdown pre blocks: `bg-gray-800`
- Markdown blockquotes: `border-gray-600`, `text-gray-400`
- Markdown links: `text-blue-400` (hover: `text-blue-300`)
- Loading dots: `text-gray-400`

### TaskBar.tsx

#### Light Mode
- Background: `bg-gray-50`
- Border: `border-gray-300`
- Header text: `#004A84`
- New chat button: `#C7A562` (hover: `#B59552`)
- New chat icon: `#004A84`
- Chat history button: `#C7A562` (hover: `#B59552`)
- Clock icon: `#004A84`
- User button: `#C7A562` (hover: `#B59552`)
- User initials: `#004A84`
- Search input: `bg-white`, `text-gray-900`, `placeholder-gray-400`
- Search icon: `text-gray-500`
- Section headers: `#004A84`
- Chat items: `text-gray-700` (hover: `bg-gray-100`)
- Time periods: `text-gray-400`
- Timestamps: `text-gray-400`
- Dropdown menu: `bg-white`
- Sign out hover: `bg-gray-50`, `text-gray-700` → `text-gray-900`
- No chats message: `#E1C88E`
- Divider lines: `bg-gray-300`

#### Dark Mode
- Background: `#1a1b1e`
- Border: `border-gray-500`
- Header text: `#d1d1d1`
- New chat button: transparent with `#d1d1d1` border
- New chat hover: `rgba(209, 209, 209, 0.1)`
- New chat icon: `#ffffff`
- Chat history button: transparent with `#d1d1d1` border
- Clock icon: `#ffffff`
- User button: transparent with `#ffffff` border
- User button hover: `rgba(255, 255, 255, 0.1)`
- User initials: `#d1d1d1`
- Search input: `bg-[#25262b]`, `text-gray-200`, `placeholder-gray-500`
- Search icon: `text-gray-400`
- Section headers: `#ffffff`
- Chat items: `text-gray-300` (hover: `bg-[#25262b]`)
- Time periods: `text-gray-500`
- Dropdown menu: `bg-[#25262b]`
- User info: `text-gray-200`, `text-gray-400` (email)
- Sign out: `text-gray-300` (hover: `bg-gray-700`, `text-white`)
- No chats message: `#9CA3AF`
- Divider lines: `bg-gray-700`

### Sidebar.tsx (Legacy - for logged-in users)

#### Light Mode
- Background: `bg-white/95`
- Toggle button hover: `hover:bg-gray-100`
- Active state: `active:bg-[#C7A562]`, `focus:bg-[#C7A562]`
- Menu icon: `#004A84`
- New chat button: `#C7A562`
- New chat icon: `#004A84`
- New chat text: `#004A84`
- Search input: `bg-white`
- Section headers: `text-gray-700`
- Chat items: `text-gray-700` (hover: `hover:bg-gray-100`)
- Current chat: `bg-white` with `shadow-sm`
- Timestamps: `text-gray-500`
- Account button: `#C7A562`
- Account text: `#004A84`
- Account dropdown: `#f3f4f6`
- Sign out hover: `rgba(0, 74, 132, 0.1)`

#### Dark Mode
- Background: `dark:bg-[#1a1b1e]`
- Toggle button hover: `hover:bg-[#25262b]`
- Menu icon: `#e5e7eb`
- New chat button: `#25262b`
- New chat icon: `#ffffff`
- New chat text: `#ffffff`
- Search input: `dark:bg-[#25262b]`, `dark:text-dark-text`
- Section headers: `dark:text-dark-muted`
- Chat items: `dark:text-dark-muted` (hover: `dark:hover:bg-[#25262b]`)
- Current chat: `dark:bg-[#25262b]`
- Account button: `#25262b`
- Account text: `#ffffff`
- Account dropdown: `#25262b`
- Account info: `#f3f4f6`, `#9ca3af` (email)
- Sign out text: `#f3f4f6`
- Sign out hover: `rgba(229, 231, 235, 0.1)`

### DarkModeToggle.tsx

#### Light Mode
- Border: `#004A84`
- Toggle ball: `#004A84`
- Sun icon: `text-white`

#### Dark Mode
- Border: `#ffffff`
- Toggle ball: `#ffffff`
- Moon icon: `text-gray-800`

### Auth Pages (signin/error)

#### Sign In Page
- Background: `bg-gray-50`
- Header: `#004A84`
- Card: `bg-white`, `border-gray-200`
- Error background: `bg-red-50`, `border-red-200`
- Error text: `text-red-600`
- Input border: `border-gray-300`
- Input focus: `focus:ring-blue-500`
- Input text: `text-gray-900`, `placeholder-gray-600`
- Sign in button: `#C7A562` (hover: `#B59552`)
- Button text: `#004A84`
- Divider: `border-gray-300`
- Divider text: `text-gray-500`
- Google button: `#C7A562` (hover: `#B59552`)
- Guest button: `#E1C88E` (hover: `#D4B67D`)
- Loading spinner: `border-blue-600`

#### Error Page
- Background gradient: `from-gray-50 via-blue-50 to-gray-100`
- Logo gradient: `from-blue-600 to-blue-700`
- Header: `#004A84`
- Subtitle: `text-gray-600`
- Card: `bg-white`, `border-gray-200`
- Error icon background: `bg-red-100`
- Error icon: `text-red-600`
- Title: `text-gray-900`
- Message: `text-gray-600`
- Suggestion: `text-gray-500`
- Try again button: `#C7A562` (hover: `#B59552`)
- Back button: `#E1C88E` (hover: `#D4B67D`)
- Button text: `#004A84`
- Footer text: `text-gray-500`, `text-gray-400`

### ChatHistorySidebar.tsx (Legacy component)

- Background: `bg-white`
- Border: `border-gray-200`
- Toggle button: `bg-white`, `border-gray-300` (hover: `bg-gray-50`)
- Divider line: `bg-gray-300`
- Header: `#004A84`
- New chat hover: `hover:bg-gray-100`
- New chat icon: `#004A84`
- Empty state: `text-gray-500`, icon: `text-gray-300`
- Current chat: `bg-blue-50`, `border-blue-200`
- Chat hover: `hover:bg-gray-50`
- Chat title: `text-gray-900`
- Chat preview: `text-gray-500`
- Timestamp: `text-gray-400`
- Delete button: `text-gray-500` (hover: `bg-gray-200`)
- Footer: `text-gray-500`
- Scrollbar: `bg-gray-100` (track), `bg-gray-300` (thumb), `bg-gray-400` (hover)

### globals.css

#### CSS Variables
- `--background`: `#f9fafb` (light), `#1a1b1e` (dark)
- `--foreground`: `#171717` (light), `#D1D5DB` (dark)

#### Dark Mode Classes
- `.dark .dark\:bg-dark-bg`: `#1a1b1e`
- `.dark .dark\:bg-dark-sidebar`: `#25262b`
- `.dark .dark\:text-dark-text`: `#D1D5DB`
- `.dark .dark\:text-dark-muted`: `#8E8E93`
- `.dark .dark\:border-dark-border`: `#2E2E38`

#### Scrollbar Colors
- Light: `rgba(156, 163, 175, 0.3)` (thumb), transparent (track)
- Light hover: `rgba(156, 163, 175, 0.5)`
- Dark: `rgba(75, 85, 99, 0.5)` (thumb)
- Dark hover: `rgba(75, 85, 99, 0.7)`
- Sidebar scrollbar: `#d1d5db` (thumb), `#9ca3af` (hover)

## Usage Notes

1. **Primary Actions**: Use `#C7A562` (gold) for primary buttons and CTAs
2. **Branding**: Use `#004A84` (dark blue) for headers and branding elements
3. **User Messages**: Use `#226EA7` (light blue) for user-generated content
4. **Assistant/Welcome**: Use `#E1C88E` (light gold) for AI responses and welcome messages
5. **Dark Mode**: Ensure sufficient contrast with `#1a1b1e` background
6. **Hover States**: Always provide hover feedback, especially for interactive elements
7. **Borders**: Use subtle borders in dark mode (`#2E2E38`) to maintain hierarchy
8. **Text Hierarchy**: Use `#D1D5DB` for primary text and `#8E8E93` for muted text in dark mode

## Accessibility Considerations

- Maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Gold on white requires careful implementation for text (better for backgrounds)
- Dark blue (#004A84) provides excellent contrast on light backgrounds
- In dark mode, use pure white (#ffffff) for critical interactive elements