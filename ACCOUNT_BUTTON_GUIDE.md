# Account Button Implementation Guide

## How the Account Button Works

The account button is located at the bottom of the sidebar and provides authentication functionality for the AI Legal application.

### Visual Appearance

1. **When Not Signed In:**
   - Shows a gray circular button with a "?" symbol
   - Text displays "Guest" and "Not signed in" (when sidebar is expanded)

2. **When Signed In:**
   - Shows user's profile image (if available) or first letter of their name/email
   - Text displays user's name and "Signed in" status (when sidebar is expanded)

### Functionality

#### For Non-Authenticated Users (Guests):
1. Click the circular button at the bottom of the sidebar
2. A menu appears with "Sign in to your account" option
3. Clicking this option triggers the authentication flow (Google OAuth)
4. After successful sign-in, the button updates to show user information

#### For Authenticated Users:
1. Click the circular button showing your avatar/initial
2. A menu appears displaying:
   - Your name and email address
   - "Sign out" option with logout icon
3. Clicking "Sign out" logs you out and returns to guest mode

### Technical Details

- The button is always visible and clickable regardless of sidebar expansion state
- The menu appears above the button (bottom-full positioning)
- When sidebar is collapsed, menu has minimum width of 200px
- When sidebar is expanded, menu stretches to full sidebar width
- Click outside the menu to close it
- All authentication is handled through NextAuth.js with Google OAuth

### User Flow

1. **Initial Visit**: User sees "?" button → clicks → signs in → authenticated
2. **Return Visit**: User sees their avatar → clicks → can sign out if needed
3. **Guest Mode**: Full chat functionality available without sign-in
4. **Authenticated Benefits**: Chat history saved, clickable document citations

The implementation ensures a smooth authentication experience while maintaining the application's functionality for both guest and authenticated users.