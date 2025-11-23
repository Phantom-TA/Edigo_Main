# Phase 2: Authentication & Role Selection

## What Changed
- Created role selection page (`/onboarding/role-selection`)
- Created user role API endpoint
- Created Clerk webhook for automatic user sync
- Updated middleware to protect onboarding routes
- Updated signup flow to redirect to role selection
- Created `getUserRole` utility for checking user roles

## Files Created/Modified

### Created:
- `src/app/onboarding/role-selection/page.tsx` - Role selection UI
- `src/app/api/user/set-role/route.ts` - API to set user role
- `src/app/api/webhooks/clerk/route.ts` - Clerk webhook handler
- `src/lib/auth/getUserRole.ts` - Utility to get user role

### Modified:
- `src/middleware.ts` - Added onboarding route protection
- `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx` - Redirect to role selection
- `package.json` - Added svix package

## How to Deploy

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Add Environment Variable
Add to your `.env.local`:
```
CLERK_WEBHOOK_SECRET=
```
Note: Leave empty for now. You'll get this from Clerk dashboard after setting up webhook.

### Step 3: Test the Flow
```bash
npm run dev
```

**Test signup flow:**
1. Go to `/sign-up`
2. Create new account
3. Should redirect to `/onboarding/role-selection`
4. Select "Teacher" or "Student"
5. Click Continue
6. Should redirect to `/dashboard`

**Check database:**
- Open Supabase SQL Editor
- Run: `SELECT * FROM users ORDER BY "createdAt" DESC LIMIT 10;`
- Verify new user has correct role

### Step 4: Setup Clerk Webhook (Optional but Recommended)

1. Go to Clerk Dashboard → Webhooks
2. Add new endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`
4. Copy webhook secret
5. Add to `.env.local`: `CLERK_WEBHOOK_SECRET=whsec_xxxxx`
6. Restart dev server

## Existing Features Still Work
- ✅ Login/Logout
- ✅ Dashboard access
- ✅ Course creation
- ✅ Course viewing
- ✅ All previous functionality unchanged

## New Features Ready
- ✅ New users select role during signup
- ✅ Users stored in database with roles
- ✅ Webhook syncs users automatically (when configured)
- ✅ Can check user role via `getUserRole()` utility

## Next: Phase 3
Will add CIF-based course creation for teachers with PDF upload.
