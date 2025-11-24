"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Header from '@/app/dashboard/_components/Header'
import { getCourseById } from '../../action'
import WeeklyRoadmap from './_components/WeeklyRoadmap'
import ChatBot from '../_components/ChatBot'
import { ArrowLeft } from 'lucide-react'

interface Topic {
  topicName: string
  description: string
  videoSearchQuery: string
  testQuizPrompt: string
  completed?: boolean
}

interface Week {
  weekNumber: number
  weekTitle: string
  topics: Topic[]
}

interface CourseData {
  courseName: string
  description: string
  duration: string
  weeks: Week[]
}

const RoadmapPage = () => {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const courseId = params.courseid as string
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<'TEACHER' | 'STUDENT' | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user/role');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const handleBackToDashboard = async () => {
    // If role is not yet loaded, fetch it first
    if (!userRole) {
      try {
        const response = await fetch('/api/user/role');
        if (response.ok) {
          const data = await response.json();
          if (data.role === 'STUDENT') {
            router.push('/dashboard/my-courses');
          } else {
            router.push('/dashboard');
          }
          return;
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    }

    // Use cached role
    if (userRole === 'STUDENT') {
      router.push('/dashboard/my-courses');
    } else {
      router.push('/dashboard');
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const result = await getCourseById(courseId)
        if (result && result.length > 0 && result[0].courseOutput) {
          const parsedData = typeof result[0].courseOutput === 'string'
            ? JSON.parse(result[0].courseOutput)
            : result[0].courseOutput
          setCourseData(parsedData)
        }
      } catch (error) {
        console.error('Error fetching course:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <p className="text-gray-600">Course not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        {user && (
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Dashboard</span>
          </button>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Roadmap</h1>
          <h2 className="text-xl text-gray-600 mb-1">{courseData.courseName}</h2>
          <p className="text-sm text-gray-500">{courseData.description}</p>
          <p className="text-sm text-gray-500 mt-1">Duration: {courseData.duration}</p>
        </div>

        <WeeklyRoadmap weeks={courseData.weeks} courseId={courseId} />
      </div>

      {/* Chat Bot */}
      {user && <ChatBot courseId={courseId} />}
    </div>
  )
}

export default RoadmapPage
