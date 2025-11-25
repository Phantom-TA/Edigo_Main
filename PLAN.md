# PLAN.md - Edigo System Enhancement Implementation

## Overview
Transform Edigo from a single-user course generator into a full teacher-student learning platform with role-based access, course enrollment, real-time chat, and CIF-based course generation.

---

## PHASE 1: Database Schema & User Role System

### 1.1 Create User Table & Role System
- Add `Users` table to schema with fields:
  - `id` (primary key)
  - `clerkId` (unique, from Clerk)
  - `email`, `fullName`, `profileImage`
  - `role` (ENUM: 'TEACHER' | 'STUDENT')
  - `createdAt`, `updatedAt`

### 1.2 Update Course Schema
- Add `creatorId` foreign key to `CourseList` (references Users)
- Add `isPublished` boolean (default: false)
- Keep existing fields for backward compatibility

### 1.3 Create Enrollment System Tables
- Add `CourseEnrollments` table:
  - `id`, `courseId`, `studentId`, `enrolledAt`, `progress` (JSON)
- Add `StudentLearningPlans` table:
  - `id`, `studentId`, `planTitle`, `domain`, `duration`, `topics` (JSON), `planOutput` (JSON), `createdAt`

### 1.4 Create Chat System Tables
- Add `CourseChats` table:
  - `id`, `courseId`, `senderId`, `message` (text), `createdAt`, `isRead`

### 1.5 Migration Strategy
- Create migration script to populate Users table from existing CourseList records
- Link existing courses to migrated users

**Files to modify:**
- `src/app/_configs/Schema.ts`
- Create: `src/lib/migrations/001_add_user_roles.ts`

---

## PHASE 2: Authentication & Role Selection

### 2.1 Enhance Sign-Up Flow
- After Clerk signup, redirect to `/onboarding/role-selection`
- User selects: "I'm a Teacher" or "I'm a Student"
- Create user record in database with selected role
- Redirect to role-appropriate dashboard

### 2.2 Middleware Enhancement
- Add role-based route protection
- Teachers: access `/dashboard/courses-created`, `/create-course`
- Students: access `/dashboard/my-courses`, `/create-learning-plan`
- Both: access `/dashboard` (home), `/course/[id]`

### 2.3 User Sync Hook
- Create Clerk webhook to sync user data on signup/update
- Endpoint: `/api/webhooks/clerk`

**Files to create/modify:**
- Create: `src/app/onboarding/role-selection/page.tsx`
- Create: `src/app/api/webhooks/clerk/route.ts`
- Modify: `src/middleware.ts`
- Create: `src/lib/auth/getUserRole.ts`

---

## PHASE 3: Student Features - Course Discovery & Enrollment

### 3.1 Browse Courses (Dashboard Home for Students)
- Display all published courses (`isPublished = true`)
- Show: Course card with "Enroll" button
- Filters: Category, Level, Duration

### 3.2 Course Preview Modal
- On "Enroll" click: Show modal with:
  - Course description (AI-enhanced summary)
  - Week count, Topics covered
  - Teacher name, Course rating (future)
  - "Confirm Enrollment" button

### 3.3 Enrollment Logic
- Create enrollment record in `CourseEnrollments`
- Add course to student's "My Courses"
- Send notification to teacher (future)

### 3.4 My Courses Route
- New route: `/dashboard/my-courses`
- Display enrolled courses only
- Show progress percentage per course

**Files to create/modify:** ( Change as per the current file structure )
- Modify: `src/app/dashboard/page.tsx`
- Create: `src/app/dashboard/_components/CoursePreviewModal.tsx`
- Create: `src/app/dashboard/_components/EnrollButton.tsx`
- Create: `src/app/dashboard/my-courses/page.tsx`
- Create: `src/app/api/courses/enroll/route.ts`
- Create: `src/lib/courses/enrollStudent.ts`

---
<!-- 

## PHASE 3: Teacher Features - CIF-Based Course Creation (Already Done)

### 3.1 Update Course Creation Form
- Modify `/create-course-simple` to be teacher-only
- Required fields: Course Title, Duration, Upload CIF (PDF), Optional Important Topics
- Remove old multi-step wizard OR consolidate both approaches

### 3.2 Implement PDF Processing
- Install: `pdf-parse` package
- Extract text from uploaded CIF PDF
- Pass extracted content to AI prompt generation

### 3.3 Enhanced AI Prompt for Weekly Planner
- New prompt structure:
  ```
  Generate a weekly course planner based on this Course Information File (CIF):
  [EXTRACTED PDF CONTENT]

  Duration: [X weeks]
  Additional Topics: [User provided topics if any]

  Create a JSON structure with:
  - Weekly breakdown with major topics
  - Subtopics under each week
  - YouTube search queries for each topic
  - Sample quiz prompts
  ```

### 3.4 Weekly Planner Display Enhancement
- Update roadmap UI to show:
  - Week number + Major topic (collapsible)
  - Subtopics list with checkboxes
  - Recommended videos (2 YouTube embeds per topic)
  - Sample quiz preview (AI-generated)

**Files to create/modify:**
- Modify: `src/app/create-course-simple/page.tsx`
- Modify: `src/app/create-course-simple/action.ts`
- Create: `src/lib/pdf/extractPdfContent.ts`
- Modify: `src/app/_configs/AiModels.ts` (new prompt template)
- Modify: `src/app/course/[courseid]/roadmap/_components/WeeklyRoadmap.tsx`

--- -->

## PHASE 4: Teacher Dashboard - Courses Created

### 4.1 Create Courses-Created Route
- New route: `/dashboard/courses-created`
- Display all courses where `creatorId = currentUser.id` AND `role = TEACHER`
- Show: Course card grid with edit/delete/publish options

### 4.2 Update Dashboard Home
- For teachers: Show "Create Course" CTA + Recent courses
- For students: Show "Browse Courses" + Enrolled courses preview

### 4.3 Update Sidebar Navigation
- Teachers see: Home, Courses Created, Create Course, Explore, Upgrade
- Students see: Home, My Courses, Create Learning Plan, Explore, Upgrade

**Files to create/modify:**
- Create: `src/app/dashboard/courses-created/page.tsx`
- Modify: `src/app/dashboard/_components/Sidebar.tsx`
- Modify: `src/app/dashboard/page.tsx`
- Create: `src/app/dashboard/_components/TeacherDashboard.tsx`
- Create: `src/app/dashboard/_components/StudentDashboard.tsx`

---

## PHASE 6: Real-Time Chat System (ClassBot)

### 6.1 Chat UI Component
- Floating chat button (bottom-right corner) on course pages
- Opens chat panel when clicked
- Design: Similar to reference image with "ClassBot" branding

### 6.2 Chat Backend - Choose One:
**Option A: Supabase Realtime (Recommended - already using Supabase)**
- Use Supabase Realtime subscriptions
- Store messages in `CourseChats` table
- Subscribe to changes on course page

**Option B: Pusher/Ably (If more features needed)**
- Install Pusher Channels
- Create chat channel per course

### 6.3 Chat Features
- Show all students + teacher in course
- Real-time message delivery
- Message history (load last 50 messages)
- Typing indicators
- Online status (future)

### 6.4 Access Control
- Only enrolled students + course creator can access chat
- Verify enrollment before loading chat

**Files to create/modify:**
- Create: `src/app/course/[courseid]/_components/ChatBot.tsx`
- Create: `src/app/course/[courseid]/_components/ChatPanel.tsx`
- Create: `src/app/course/[courseid]/_components/MessageList.tsx`
- Create: `src/app/api/chat/send-message/route.ts`
- Create: `src/app/api/chat/get-messages/route.ts`
- Create: `src/lib/chat/initializeChat.ts` (Supabase realtime setup)
- Modify: `src/app/course/[courseid]/page.tsx` (add ChatBot component)
- Modify: `src/app/course/[courseid]/roadmap/page.tsx` (add ChatBot component)

---

## PHASE 7: Student Learning Plan Creation (Only visible to STUDENT user, Auto added to enrolled courses)

### 7.1 Create Learning Plan Form
- New route: `/dashboard/create-learning-plan`
- Form fields (per reference image):
  - Trending Domains (dropdown with suggestions)
  - Duration (in hours)
  - Wanted Topics (textarea)
  - Any Other Needs (textarea)
- "Generate" button

### 7.2 AI Generation for Learning Plans
- Create personalized roadmap using Groq AI
- Prompt: "Create a personalized learning roadmap for: [domain], Duration: [X hours], Focus topics: [topics], Additional needs: [needs]"
- Store in `StudentLearningPlans` table

### 7.3 Display Learning Plans
- View in `/dashboard/my-learning-plans`
- Show week-by-week breakdown (similar to course roadmap)
- Progress tracking with checkboxes
- Recommended resources (YouTube videos, articles)

**Files to create/modify:**
- Create: `src/app/dashboard/create-learning-plan/page.tsx`
- Create: `src/app/dashboard/create-learning-plan/action.ts`
- Create: `src/app/dashboard/my-learning-plans/page.tsx`
- Create: `src/app/dashboard/my-learning-plans/[planId]/page.tsx`
- Create: `src/lib/ai/generateLearningPlan.ts`

---

## PHASE 8: Integration & Testing

### 8.1 Update Existing Routes
- Ensure all course routes check enrollment for students
- Teachers can always view their own courses
- Add role checks to API routes

### 8.2 UI/UX Consistency
- Update all components to use role-aware navigation
- Consistent styling across teacher/student views
- Mobile responsiveness for chat component

### 8.3 Testing Checklist
- [ ] Teacher can create course with PDF upload
- [ ] Weekly planner generated from CIF content
- [ ] Student can browse and enroll in courses
- [ ] Enrollment modal shows course preview
- [ ] Chat works in real-time between teacher and students
- [ ] Student learning plans generate correctly
- [ ] Role-based routing works correctly
- [ ] Migration from old data successful

---

## PHASE 9: Polish & Optimization

### 9.1 Move API Keys to Server-Side
- Move `NEXT_PUBLIC_GROQ_API_KEY` to server-only
- Create API routes for AI generation
- Prevent client-side exposure

### 9.2 Add Loading States
- Course generation progress indicators
- Chat message sending states
- Enrollment confirmation feedback

### 9.3 Error Handling
- PDF upload validation (file type, size)
- Enrollment error handling (already enrolled, course full)
- Chat connection error handling

---

## TECHNOLOGY STACK ADDITIONS

### New Packages Required:
```json
{
  "pdf-parse": "^1.1.1",           // PDF text extraction
  "@supabase/realtime-js": "^2.x", // Real-time chat (if not using Pusher)
  "react-markdown": "^9.x",        // Markdown rendering in chat
  "date-fns": "^3.x"               // Date formatting for chat messages
}
```

### Database Changes:
- 4 new tables: Users, CourseEnrollments, StudentLearningPlans, CourseChats
- Foreign key relationships established
- Indexes on frequently queried fields

### Integration Points:
- Clerk webhooks for user sync
- Supabase Realtime for chat
- Groq AI for CIF-based generation + learning plans

---

## ROLLOUT STRATEGY

1. **Phase 1-2** (Database + Auth): Foundation - allows role selection
2. **Phase 3-4** (Teacher Features): Teachers can create CIF-based courses
3. **Phase 5** (Student Enrollment): Students can discover and enroll
4. **Phase 6** (Chat): Enable communication
5. **Phase 7** (Learning Plans): Student personalization
6. **Phase 8-9** (Testing + Polish): Production-ready

**Estimated Implementation**: Phased rollout over 4-6 development sprints

---

## SUCCESS METRICS
- Role selection completion rate
- Courses created with CIF vs without
- Student enrollment rate
- Chat engagement (messages per course)
- Learning plan completion rate
