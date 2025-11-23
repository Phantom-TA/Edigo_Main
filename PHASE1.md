# Phase 1: Database Schema Implementation

## What Changed
- Updated `src/app/_configs/Schema.ts` with 4 new tables
- Added `creatorId` and `isPublished` fields to CourseList
- All existing features still work (backward compatible)

## How to Deploy

### Step 1: Run SQL in Supabase SQL Editor
Copy and paste this SQL into Supabase SQL Editor:

```sql
-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    "clerkId" VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    "fullName" VARCHAR(255),
    "profileImage" VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create CourseEnrollments table
CREATE TABLE IF NOT EXISTS "courseEnrollments" (
    id SERIAL PRIMARY KEY,
    "courseId" VARCHAR(255) NOT NULL,
    "studentId" INTEGER NOT NULL,
    "enrolledAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    progress JSONB DEFAULT '{}'
);

-- Create StudentLearningPlans table
CREATE TABLE IF NOT EXISTS "studentLearningPlans" (
    id SERIAL PRIMARY KEY,
    "studentId" INTEGER NOT NULL,
    "planTitle" VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL,
    topics JSONB DEFAULT '[]',
    "planOutput" JSONB NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create CourseChats table
CREATE TABLE IF NOT EXISTS "courseChats" (
    id SERIAL PRIMARY KEY,
    "courseId" VARCHAR(255) NOT NULL,
    "senderId" INTEGER NOT NULL,
    message TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "isRead" BOOLEAN DEFAULT FALSE
);

-- Add new columns to existing courseList table
ALTER TABLE "courseList"
ADD COLUMN IF NOT EXISTS "creatorId" INTEGER,
ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN DEFAULT FALSE;

-- Migrate existing data: Create users from existing course creators
INSERT INTO users ("clerkId", email, "fullName", "profileImage", role)
SELECT DISTINCT
    "createdBy" as "clerkId",
    COALESCE(username || '@edigo.app', 'user_' || "createdBy" || '@edigo.app') as email,
    COALESCE(username, 'Course Creator') as "fullName",
    "userProfileImage" as "profileImage",
    'TEACHER' as role
FROM "courseList"
WHERE "createdBy" NOT IN (SELECT "clerkId" FROM users)
ON CONFLICT ("clerkId") DO NOTHING;

-- Link existing courses to users
UPDATE "courseList" c
SET "creatorId" = u.id
FROM users u
WHERE c."createdBy" = u."clerkId"
AND c."creatorId" IS NULL;

-- Migrate publish status
UPDATE "courseList"
SET "isPublished" = publish
WHERE "isPublished" IS NULL;
```

### Step 2: Test Your App
```bash
npm run dev
```

Test these features (should all work):
- Login
- View dashboard
- Create course
- View course
- Edit course

## What's Ready (Not Active Yet)
- Users table (populated with existing creators)
- Course enrollments table (empty, ready for Phase 5)
- Learning plans table (empty, ready for Phase 7)
- Chat table (empty, ready for Phase 6)

## Next: Phase 2
Will add role selection UI and separate teacher/student dashboards.
