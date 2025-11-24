"use client"
import Image from 'next/image'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { HiFolderOpen, HiHome, HiOutlineGift, HiOutlineXCircle, HiAcademicCap } from "react-icons/hi";
import { Progress } from "@/components/ui/progress"
import { useUserCourseList } from '../../_context/UserCourseListContext';
import { useUser } from '@clerk/nextjs';

const Sidebar = () => {
    const { user } = useUser();
    const { userCourseList } = useUserCourseList();
    const [userRole, setUserRole] = useState<'TEACHER' | 'STUDENT' | null>(null);
    const path = usePathname();
    const maxCourses = 5;
    const progressValue = Math.min((userCourseList.length / maxCourses) * 100, 100);

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

    const teacherMenu = [
        {
            id: 1,
            name: 'Home',
            icon: <HiHome />,
            path: '/'
        },
        {
            id: 2,
            name: 'My Courses',
            icon: <HiFolderOpen />,
            path: '/dashboard'
        },
        {
            id: 3,
            name: 'Explore',
            icon: <HiFolderOpen />,
            path: '/dashboard/explore'
        },
        {
            id: 4,
            name: 'Upgrade',
            icon: <HiOutlineGift />,
            path: '/dashboard/upgrade'
        },
        {
            id: 5,
            name: 'Logout',
            icon: <HiOutlineXCircle />,
            path: '/dashboard/logout'
        },
    ];

    const studentMenu = [
        {
            id: 1,
            name: 'Home',
            icon: <HiHome />,
            path: '/'
        },
        {
            id: 2,
            name: 'My Enrolled Courses',
            icon: <HiAcademicCap />,
            path: '/dashboard/my-courses'
        },
        {
            id: 3,
            name: 'Explore',
            icon: <HiFolderOpen />,
            path: '/dashboard/explore'
        },
        {
            id: 4,
            name: 'Upgrade',
            icon: <HiOutlineGift />,
            path: '/dashboard/upgrade'
        },
        {
            id: 5,
            name: 'Logout',
            icon: <HiOutlineXCircle />,
            path: '/dashboard/logout'
        },
    ];

    const Menu = userRole === 'STUDENT' ? studentMenu : teacherMenu;
    return (
        <div className='fixed h-full md:w-64 p-5 shadow-md'>
            <Link href="/">
                <Image src={"https://imgs.search.brave.com/keA2VmLtS4-75p6An8tv5vEB1ycHCtlHhpd-wTiZyeQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS12ZWN0b3Iv/Y29sb3JmdWwtbGV0/dGVyLWdyYWRpZW50/LWxvZ28tZGVzaWdu/XzQ3NDg4OC0yMzA5/LmpwZz9zZW10PWFp/c19oeWJyaWQmdz03/NDA"} alt='logo' width={50} height={60} className="cursor-pointer"></Image>
            </Link>
            <hr className='my-5'></hr>
            <ul>
                {Menu.map((item) => (
                    <Link href={item.path} key={item.path}>
                        <li
                            className={`flex items-center gap-6 text-gray-500 p-3 cursor-pointer hover:bg-gray-300 hover:text-black rounded ${item.path === path ? 'bg-gray-200 text-black' : ''}`}
                        >
                            <div className="text-3xl">{item.icon}</div>
                            <h2>{item.name}</h2>
                        </li>
                    </Link>
                ))}
            </ul>
            {userRole === 'TEACHER' && (
                <div className='absolute bottom-20 w-[80%]'>
                    <Progress value={progressValue} className="h-2 bg-violet-100" />
                    <div className="mt-2 font-semibold text-lg text-black">{userCourseList.length} Out of {maxCourses} Course created</div>
                    <div className="text-sm text-gray-500">Upgrade your plan for unlimited course generation</div>
                </div>
            )}

        </div>
    )
}

export default Sidebar