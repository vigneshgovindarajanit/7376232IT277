# Frontend Assessment

This frontend implements the Stage 2 campus notifications assessment in React with Material UI.

## What is included

- `All Notifications` page with protected API fetch, type filter, page size control, and pagination UI
- `Priority Inbox` page with top `n` unread notifications ranked by `Placement > Result > Event`, then by recency
- Persistent `viewed` vs `new` notification state using `localStorage`
- Notification details page
- Registration, authentication, and logging integration for the Affordmed protected APIs
- Vite dev server configured to run on `http://localhost:3000`

## Run locally

1. Open the project folder:
   `cd frontend`
2. Install dependencies:
   `npm install`
3. Start the app:
   `npm run dev`
4. Open:
   `http://localhost:3000`

## Assessment flow

1. Click `Connect API`.
2. Register once using your own:
   - college email
   - name
   - mobile number
   - GitHub username
   - roll number
   - access code from the assessment email
3. Save the returned `clientID` and `clientSecret`.
4. Authenticate with the same values to generate a bearer token.
5. Use the app pages:
   - `/` for all notifications
   - `/priority` for the ranked unread priority inbox

## Required submission checklist

1. Keep this frontend inside the same GitHub repository.
2. Record a video showing:
   - desktop view
   - mobile responsive view
   - registration/authentication flow
   - all notifications page
   - priority inbox page
   - viewed vs new state
   - filters and top `n` control
3. Commit frequently instead of doing a single final commit.

## Validation

- `npm run lint`
- `npm run build`
