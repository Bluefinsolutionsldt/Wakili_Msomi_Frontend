# Authentication Flow

## Overview

The authentication system has been restructured to have a dedicated authentication page and centralized redirect logic.

## Authentication Flow

### 1. Dedicated Auth Page (`/auth`)

- **Location**: `app/auth/page.tsx`
- **Purpose**: Contains the AuthForm component and handles authentication logic
- **Behavior**:
  - Shows the login/signup form when user is not authenticated
  - Automatically redirects to home page (`/`) when user becomes authenticated
  - Prevents authenticated users from accessing the auth page

### 2. Main Page (`/`)

- **Location**: `app/page.tsx`
- **Purpose**: Main application interface
- **Behavior**:
  - Automatically redirects unauthenticated users to `/auth`
  - Shows loading state while checking authentication status
  - Only renders the main app interface for authenticated users

### 3. Topbar Component

- **Location**: `components/Topbar.tsx`
- **Purpose**: Navigation and user menu
- **Behavior**:
  - Shows "Sign In" button for unauthenticated users (redirects to `/auth`)
  - Shows user dropdown menu for authenticated users
  - Logout button redirects to `/auth` after clearing session

### 4. AuthForm Component

- **Location**: `components/auth/AuthForm.tsx`
- **Purpose**: Login and signup form
- **Behavior**:
  - Only used within the dedicated auth page
  - Handles form validation and API calls
  - Navigation is handled by the parent auth page

## Key Changes Made

1. **Created dedicated auth page** (`app/auth/page.tsx`)
2. **Updated main page** to redirect unauthenticated users to `/auth`
3. **Removed auth modal** from Topbar component
4. **Updated Topbar** to redirect to `/auth` instead of showing modal
5. **Centralized navigation logic** in auth page

## Benefits

- **Cleaner separation**: Auth form is only in one place
- **Better UX**: Dedicated auth page with proper routing
- **Consistent behavior**: All unauthenticated access redirects to same page
- **Easier maintenance**: Auth logic centralized in one location

## Usage

- Users trying to access any protected route will be redirected to `/auth`
- After successful authentication, users are automatically redirected to `/`
- Logout redirects users back to `/auth`
- The auth page prevents authenticated users from accessing it
