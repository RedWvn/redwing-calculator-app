"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator" // Import Separator for visual enhancements

const hardcodedPassword = "Redwing@123456789!";

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        if (password === hardcodedPassword) {
            localStorage.setItem('loggedIn', 'true');
            router.push('/');
        } else {
            setError('Invalid password');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] py-10 flex justify-center items-center">
            <div className="text-center mb-8"> {/* Added container for header */}
                <h1 className="text-3xl font-bold text-white mb-2">Redwing Drone Cost Calculator</h1>
                <p className="text-gray-400 text-lg">Login to access the application</p>
                <Separator className="my-4 bg-gray-600 opacity-50" /> {/* Added separator for visual break */}
            </div>
            <Card className="w-96 bg-[#0f1115] border-[#1f2937] text-white">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-semibold"> Login</CardTitle> {/* Changed "Login" to "ورود" in CardTitle - just an example, revert if not needed */}
                </CardHeader>
                <CardContent className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <br/>
                            <Input
                                type="password"
                                id="password"
                                placeholder="Enter your secure password" // More professional placeholder
                                className="bg-[#1f2937] border-0 text-white"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500">
                            Login Securely {/* More reassuring button text */}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}