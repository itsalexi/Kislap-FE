'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider.js';
import Link from 'next/link';
import { Button } from './ui/button.jsx';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar.jsx';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from './ui/dropdown-menu.jsx';
import { Shield, User, LogOut } from 'lucide-react';

export default function Header() {
    const { user, login, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link
                            href="/"
                            className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
                        >
                            Kislap
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="h-10 w-10 rounded-full p-0 hover:bg-gray-100 transition-colors"
                                    >
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage
                                                src={user.picture}
                                                alt={user.name}
                                            />
                                            <AvatarFallback className="text-sm font-medium">
                                                {user.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                >
                                    <div className="px-3 py-2 border-b">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {user.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user.email}
                                        </p>
                                    </div>

                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center space-x-2"
                                        >
                                            <User className="h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    {user.role === 'ADMIN' && (
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href="/admin"
                                                className="flex items-center space-x-2"
                                            >
                                                <Shield className="h-4 w-4" />
                                                <span>Admin</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                onClick={login}
                                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                            >
                                Login with Google
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
