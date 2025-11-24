"use client"
import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Header = () => {
  const { user, isLoaded } = useUser();

  return (
    <div className='flex justify-between p-5 shadow-sm items-center'>
      <div>
        <Link href="/">
          <Image
            src="https://imgs.search.brave.com/keA2VmLtS4-75p6An8tv5vEB1ycHCtlHhpd-wTiZyeQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS12ZWN0b3Iv/Y29sb3JmdWwtbGV0/dGVyLWdyYWRpZW50/LWxvZ28tZGVzaWdu/XzQ3NDg4OC0yMzA5/LmpwZz9zZW10PWFp/c19oeWJyaWQmdz03/NDA"
            alt="logo"
            width={50}
            height={50}
          />
        </Link>
      </div>

      <div className='flex items-center gap-3'>
        {!isLoaded ? (
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
        ) : user ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <div className="flex gap-3">
            <Link href="/sign-in">
              <Button variant="outline" className="font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-violet-600 hover:bg-violet-700 font-semibold">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Header