"use client"
import { ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import Sidebar from './_components/Sidebar';
import Header from './_components/Header';
import { UserCourseListProvider } from '../_context/UserCourseListContext';

function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, isLoaded } = useUser();

    return (
        <UserCourseListProvider>
            <div>
                {/* Only show sidebar if user is authenticated */}
                {isLoaded && user && (
                    <div className='md:w-64 hidden md:block'>
                        <Sidebar />
                    </div>
                )}
                <div className={isLoaded && user ? 'md:ml-64' : ''}>
                    <Header />
                    <div className='p-5 '>
                        {children}
                    </div>
                </div>
            </div>
        </UserCourseListProvider>
    )
}
export default DashboardLayout