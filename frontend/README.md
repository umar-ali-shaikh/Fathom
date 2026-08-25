# Fathom Navigator

FATHOM — NEXT.JS FRONTEND + COMPLETE AUTHENTICATION

Act as a Senior Full-Stack/Frontend Architect with 15+ years of production experience.

I have an existing Fathom application with a React/Vite frontend and an existing backend.

Your job is to migrate/refactor the frontend to Next.js App Router and implement the remaining frontend features while maintaining the existing backend integration.

The application must have production-ready authentication with:

Email + Password

Google OAuth 2.0

The application must NOT contain Messages, Chat, DM or any messaging functionality.

1. NON-NEGOTIABLE RULES

Use:

Next.js

App Router

JavaScript/JSX unless the existing project requires TypeScript

Server Components by default

Client Components only where necessary

next/image

next/link

Proper layouts

Loading states

Error boundaries

Metadata

Responsive design

Production-quality architecture

Do NOT:

Rewrite working backend functionality unnecessarily

Invent backend APIs

Invent fake authentication

Hardcode credentials

Hardcode API URLs

Put secrets in client-side code

Turn the entire application into "use client"

Introduce Redux/Zustand unnecessarily

2. ABSOLUTELY NO MESSAGING

Do NOT create:

Messages
Chat
DM
Conversation
Thread
ThreadList
ThreadView
MessageBubble
MessageComposer
MessagesProvider
/messages
messaging APIs
messaging sockets
real-time messaging

Do not add Messages to navigation.

The final navigation should contain:

Home
Explore
Activity
Create
Profile

Settings should be accessible through Profile/settings UI.

3. CURRENT APPLICATION

The existing frontend already has:

Authentication
├── Login
├── Register
└── Auth Context

Shared UI
├── Avatar
├── Skeleton
├── EmptyState
├── TabBar
├── Icons
├── Buttons
└── Design Tokens

App Shell
├── Header
├── User Avatar
├── Username
├── Logout
└── Navigation

Feed
├── Post Cards
├── Images
├── Likes
├── Comments
├── Share
├── Skeleton
└── Empty State

Post Detail
├── Post
├── Comments
├── Reply Threading
├── Comment Composer
└── Deleted Comments

Profile
├── Profile Header
├── Avatar
├── Stats
├── Bio
├── Edit Profile
├── Follow Requests
├── Follow Lists
├── Post Grid
├── Private Profile
├── Empty State
└── Loading State

These existing modules are already considered live and should be migrated without regression.

4. FIRST STEP — AUDIT THE REPOSITORY

Before modifying anything, inspect the complete project.

Inspect:

package.json
frontend structure
backend structure
API services
routes
authentication
Auth Context
User model
Auth controller
JWT/session
cookies
environment variables
styles
design tokens
components
hooks
contexts

Determine:

What can be reused?

What must be migrated?

What APIs already exist?

How authentication currently works?

Whether Google OAuth already exists in backend.

Whether JWT or cookies are used.

Whether refresh tokens exist.

What environment variables already exist.

What could break during migration.

Do not start blindly rewriting the application.

5. NEXT.JS ARCHITECTURE

Use App Router.

Recommended architecture:

src/
├── app/
│ ├── (auth)/
│ │ ├── login/
│ │ │ └── page.jsx
│ │ ├── register/
│ │ │ └── page.jsx
│ │ └── oauth/
│ │ └── callback/
│ │ └── page.jsx
│ │
│ ├── (main)/
│ │ ├── layout.jsx
│ │ ├── page.jsx
│ │ ├── explore/
│ │ │ └── page.jsx
│ │ ├── activity/
│ │ │ └── page.jsx
│ │ ├── profile/
│ │ │ ├── page.jsx
│ │ │ ├── edit/
│ │ │ ├── followers/
│ │ │ └── following/
│ │ ├── post/
│ │ │ └── [id]/
│ │ ├── create/
│ │ │ └── page.jsx
│ │ └── settings/
│ │ └── page.jsx
│
├── components/
│ ├── ui/
│ ├── layout/
│ └── shared/
│
├── features/
│ ├── auth/
│ │ ├── components/
│ │ ├── hooks/
│ │ ├── services/
│ │ └── ...
│ ├── post/
│ ├── profile/
│ ├── explore/
│ ├── activity/
│ ├── create-post/
│ └── settings/
│
├── lib/
│ ├── api/
│ ├── auth/
│ ├── constants/
│ └── utils/
│
├── hooks/
├── providers/
└── styles/

Adapt this structure to the existing repository instead of blindly recreating everything.

6. AUTHENTICATION — BOTH METHODS

The application MUST support:

Email + Password +
Google OAuth 2.0

Do not remove the existing email/password authentication.

The final auth architecture should be:

                    ┌── Email + Password ──┐
                    │                      │

User ───────────────┤ ├──→ Backend
│ │
└── Google OAuth ──────┘
↓
Authenticated
↓
Session/Cookie
↓
Fathom App

7. EMAIL/PASSWORD AUTH

Preserve and migrate:

Register

Name
Email
Password
Confirm Password
Register

Login

Email
Password
Login

Also provide:

Logout
Session persistence
Protected routes
Validation
Loading states
Error states
Session expiration handling

Do not change existing backend behavior unless required.

8. GOOGLE OAUTH

Add:

Continue with Google

to BOTH:

Login
Register

Google authentication must be a real OAuth 2.0 integration.

Do not create a fake Google button that simply logs in a dummy user.

9. GOOGLE OAUTH FLOW

Implement:

User
↓
Continue with Google
↓
Google OAuth
↓
Google consent/authentication
↓
OAuth callback
↓
Backend verifies Google identity
↓
Find existing user
OR
Create new user
↓
Create session/token
↓
Next.js receives authenticated session
↓
Redirect to /

The backend must verify the Google identity.

Never trust Google profile data directly from the browser.

10. EXISTING GOOGLE USER

If the Google account already exists:

Google Login
↓
Verify identity
↓
Find user
↓
Create session
↓
Redirect /

Do not create duplicate users.

11. NEW GOOGLE USER

If the Google account does not exist:

Google Login
↓
Verify identity
↓
Create user
↓
Store provider information
↓
Create session
↓
Redirect /

Use the existing backend User model where possible.

12. ACCOUNT LINKING

If the backend supports account linking:

Existing Email Account +
Google Account
↓
Linked Account

If backend does not support it:

Do not fake it.

Do not automatically merge accounts.

Report the backend requirement.

Keep authentication secure.

Never merge accounts simply because email addresses appear similar without a verified linking flow.

13. BACKEND AUTH AUDIT

Before implementing Google OAuth inspect:

Auth routes
User model
Auth controller
JWT implementation
Cookie handling
Password authentication
Google OAuth support
OAuth callback
Refresh tokens
Access tokens
Session handling
Environment variables

If Google OAuth already exists:

Integrate with it.

If Google OAuth does not exist:

Clearly identify the backend changes required.

Do not invent endpoints.

14. AUTH ENVIRONMENT VARIABLES

Never hardcode secrets.

Possible configuration:

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

Only expose browser-safe variables using NEXT_PUBLIC_*.

Never expose:

GOOGLE_CLIENT_SECRET

to client-side code.

Follow the existing backend configuration if it already has Google credentials.

15. OAUTH SECURITY

Implement proper:

state
PKCE where appropriate
secure cookies
HTTPS in production
redirect URI validation
CSRF protection

Handle:

OAuth denied
Invalid state
Missing code
Expired code
Invalid code
Google failure
Backend failure
Network failure
Session creation failure

Never expose raw OAuth errors, tokens or secrets to the user.

16. SESSION MANAGEMENT

First determine whether the backend uses:

JWT
HTTP-only cookies
Access token
Refresh token
Session cookies

Prefer secure HTTP-only cookies when supported.

Do not store sensitive tokens in localStorage unless the existing backend architecture explicitly requires it.

The auth system should expose something similar to:

const {
user,
isAuthenticated,
isLoading,
login,
register,
loginWithGoogle,
logout,
refreshSession
} = useAuth();

Do not duplicate authentication state across components.

17. PROTECTED ROUTES

Protect authenticated routes:

/
/explore
/activity
/profile
/profile/edit
/profile/followers
/profile/following
/post/*
/create
/settings

Public routes:

/login
/register

If the backend supports public profile/post pages, follow the actual backend behavior.

18. AUTH UI

Login:

Fathom

Welcome back

Email
[________________]

Password
[________________]

[ Login ]

──────── OR ────────

[ G Continue with Google ]

Don't have an account?
Create account

Register:

Fathom

Create your account

Name
[________________]

Email
[________________]

Password
[________________]

Confirm Password
[________________]

[ Register ]

──────── OR ────────

[ G Continue with Google ]

Already have an account?
Login

Use the existing Fathom design system.

Use official Google branding for the Google button.

19. AUTH STATES

Implement:

Initializing
Authenticated
Unauthenticated
Logging in
Registering
Google OAuth loading
Logging out
Session expired
OAuth error

Google button during authentication:

Connecting...

Prevent duplicate OAuth requests.

20. ERROR HANDLING

Handle:

Invalid email
Invalid password
Incorrect credentials
Existing email
Weak password
Password mismatch
Google authentication cancelled
Google authentication failed
OAuth callback failure
Session expired
Backend unavailable
Network failure

Never display:

JWT tokens
Stack traces
Google client secrets
Internal backend errors
OAuth credentials

21. SESSION EXPIRATION

If API returns 401:

API request
↓
401
↓
Refresh session if supported
↓
Success → continue
↓
Failure
↓
Clear auth state
↓
Redirect /login

Prevent infinite refresh loops.

22. LOGOUT

Logout must:

Clear backend session/cookie.

Clear frontend auth state.

Clear cached user data where necessary.

Redirect to /login.

23. EXISTING FRONTEND MIGRATION

Migrate these without feature regression:

Login
Register
Feed
Post Detail
Comments
Profile
Edit Profile
Followers
Following
Follow Requests

The current implementation already marks these as live, so preserve their behavior.

24. EXPLORE

Implement:

/explore

Features:

SearchBar

Debounced search

Search results

Suggested accounts

Recent searches

ExploreGrid

Empty state

No-result state

Design:

Responsive CSS Grid

1x1 tiles

2x2 tiles

Mosaic layout

Desktop hover

Mobile touch interaction

25. ACTIVITY

Implement:

/activity

Features:

Notifications

Follow requests

Likes

Comments

New followers

Confirm request

Reject request

Read/unread

Activity grouping

Create:

ActivityItem
FollowRequestItem
ActivityList
ActivitySkeleton

Add unread badge to navigation.

26. CREATE POST

Implement:

/create

Flow:

Select files
↓
Preview
↓
Upload
↓
Caption
↓
Publish

Features:

Image preview

Remove image

Upload progress

Per-file retry

Upload errors

Caption counter

2200 character limit

Validation

Loading

Publish state

Success

Error handling

Caption counter appears around 80% of the 2200-character limit.

Only support multiple images if the backend supports them.

27. SETTINGS

Implement:

/settings

Only implement features supported by the backend.

Possible:

Account
Profile
Privacy
Security
Theme
Notifications
Logout

Do not invent APIs.

28. DESIGN SYSTEM

Preserve the existing Fathom design tokens:

CSS variables
Spacing
Radius
Shadows
Motion
Light theme
Dark theme

Use existing:

Avatar
Skeleton
EmptyState
Button
Icons
TabBar

Do not replace the design system with random colors or arbitrary styling.

29. RESPONSIVE DESIGN

Support:

320px
360px
375px
390px
414px
768px
1024px
1280px+
Large Desktop

Mobile-first.

Desktop should use a persistent sidebar/left navigation when appropriate.

Do not simply stretch the mobile bottom navigation across desktop.

30. PERFORMANCE

Optimize:

next/image
Lazy loading
API requests
Search debounce
Client components
Bundle size
Rendering
Re-renders

Use Server Components by default.

Use Client Components only where interaction/state requires them.

31. ACCESSIBILITY

Implement:

Semantic HTML
Keyboard navigation
Focus states
aria-label
Proper labels
Alt text
Accessible forms
Screen-reader status

32. SEO

Use Next.js metadata for public pages:

Profile
Post Detail
Explore

Private pages should have appropriate indexing behavior.

33. MIGRATION PHASES

Execute in this order:

PHASE 1
Repository Audit
↓
PHASE 2
Next.js App Router Setup
↓
PHASE 3
Authentication
├── Email Login
├── Email Register
├── Google OAuth
├── Session
├── Protected Routes
└── Logout
↓
PHASE 4
Shared UI Migration
↓
PHASE 5
Existing Features Migration
├── Feed
├── Post
├── Comments
├── Profile
└── Follow
↓
PHASE 6
Explore
↓
PHASE 7
Activity
↓
PHASE 8
Create Post
↓
PHASE 9
Settings
↓
PHASE 10
Desktop UX
↓
PHASE 11
QA
↓
PHASE 12
Production Optimization

34. AUTH TEST MATRIX

Test all:

TestExpectedRegisterAccount createdLoginAuthenticatedWrong passwordErrorExisting emailErrorGoogle new userAccount createdGoogle existing userLogged inGoogle cancelSafe errorOAuth failureSafe errorRefresh browserSession preservedExpired sessionProper handlingLogoutSession clearedUnauthenticated protected routeRedirect loginAuthenticated login pageRedirect appropriately

35. FRONTEND TEST MATRIX

Also test:

Feed
Post Detail
Comments
Replies
Profile
Edit Profile
Followers
Following
Follow Requests
Explore
Activity
Create Post
Settings
Navigation
Responsive UI
Loading states
Empty states
Error states
Authentication
Logout

36. CODE QUALITY

Avoid:

Duplicate components
Duplicate API logic
Huge components
Hardcoded API URLs
Hardcoded users
Fake production data
Unnecessary dependencies
Unnecessary global state
useEffect for everything
use client everywhere

Prefer:

Feature-based architecture
Reusable components
Small components
Custom hooks
Centralized API services
Constants
Utilities
Clear naming
Consistent error handling

37. IMPORTANT EXECUTION RULE

Do not immediately start creating files.

First:

Inspect repository.

Inspect frontend.

Inspect backend.

Inspect authentication.

Inspect API endpoints.

Inspect User model.

Inspect Google OAuth support.

Inspect environment variables.

Produce a concise migration/audit report.

Then start implementation.

Do not stop after creating the architecture.

Actually implement the application.

Do not replace working functionality unnecessarily.

38. FINAL DELIVERABLE

At the end provide:

Files created
Files modified
Files removed
Routes implemented
Components created
Authentication architecture
Google OAuth implementation
API integrations
Environment variables required
Backend changes required
Remaining issues
Commands to run
Development setup
Production build status
QA/test results

Most importantly:

EMAIL/PASSWORD +
GOOGLE OAUTH
↓
PRODUCTION AUTH
↓
NEXT.JS FATHOM

And:

Messages / Chat / DM / Messaging are completely excluded from this project.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/49785cd4-a6ed-4334-8497-c885bcccbdcc).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
