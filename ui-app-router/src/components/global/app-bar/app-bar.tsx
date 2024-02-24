import React from 'react';
import Breadcrumb, { BreadcrumbItem } from '@/components/global/app-bar/breadcrumb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import SignOutIconButton from '@/components/global/app-bar/sign-out-icon-button';
import ThemeToggle from '@/components/global/app-bar/theme-toggle';

interface AppBarProps {
  breadcrumbItems: BreadcrumbItem[];
}

export default async function AppBar({ breadcrumbItems }: AppBarProps) {
  const session = await getServerSession(authOptions);

  return (
    <div className="border-b">
      <div className="flex h-12 items-center px-4">
        {
          breadcrumbItems.length === 0 && <h1 className="text-2xl font-semibold">LangTrace</h1>}
        {breadcrumbItems.length >= 1 && <Breadcrumb items={breadcrumbItems}/>}
        <div className="ml-auto flex items-end space-x-2">
          <ThemeToggle/>
          {session &&
            <SignOutIconButton/>
          }
        </div>
      </div>
    </div>
  );
}
