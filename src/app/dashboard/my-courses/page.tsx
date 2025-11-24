'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface EnrolledCourse {
  id: number;
  courseId: string;
  enrolledAt: Date;
  progress: any;
}

interface CourseDetails {
  courseId: string;
  name: string;
  level?: string;
  courseBanner?: string;
  courseOutput?: any;
}

export default function MyCoursesPage() {
  const { user } = useUser();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [coursesDetails, setCoursesDetails] = useState<CourseDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get enrolled course IDs from API
      const enrollmentResponse = await fetch('/api/courses/enrolled');
      if (!enrollmentResponse.ok) {
        throw new Error('Failed to fetch enrollments');
      }
      const enrollmentData = await enrollmentResponse.json();
      const enrollments = enrollmentData.enrollments || [];
      setEnrolledCourses(enrollments);

      // Fetch details for each course
      const courseIds = enrollments.map((e: EnrolledCourse) => e.courseId);
      if (courseIds.length > 0) {
        // Fetch course details from your existing API
        const response = await fetch(
          `/api/get-all-courses?enrolled=true&ids=${courseIds.join(',')}`
        );

        if (response.ok) {
          const data = await response.json();
          setCoursesDetails(data);
        }
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (courseId: string) => {
    const enrollment = enrolledCourses.find((e) => e.courseId === courseId);
    if (!enrollment || !enrollment.progress) return 0;

    // Calculate progress based on completed chapters
    const progress = enrollment.progress as any;
    const completed = Object.values(progress).filter((v) => v === true).length;
    const total = Object.keys(progress).length;

    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Enrolled Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 rounded-lg h-64"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Enrolled Courses</h1>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            You haven&apos;t enrolled in any courses yet.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Enrolled Courses</h1>
        <span className="text-gray-600">
          {enrolledCourses.length} course{enrolledCourses.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesDetails.map((course) => {
          const progress = getProgressPercentage(course.courseId);

          return (
            <Link
              key={course.courseId}
              href={`/course/${course.courseId}/roadmap`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Course Banner */}
              <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                {course.courseBanner ? (
                  <img
                    src={course.courseBanner}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                    {course.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {course.name}
                </h3>

                {course.level && (
                  <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold mb-3">
                    {course.level}
                  </span>
                )}

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <button className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                  Continue Learning
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
