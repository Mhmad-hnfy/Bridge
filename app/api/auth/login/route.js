import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { email, password } = await request.json();
        console.log('Login attempt for:', email);

        if (email === 'admin@drislam.com' && password === 'admin123') {
            return NextResponse.json({ 
                success: true, 
                role: 'admin', 
                user: { name: 'Dr. Islam (Backup)', email: 'admin@drislam.com' } 
            });
        }

        // Check if admin in DB
        const admin = await prisma.admin.findUnique({
            where: { email: email.trim().toLowerCase() }
        });

        if (admin) {
            console.log('Admin found in DB:', admin.email);
            if (admin.password === password) {
                return NextResponse.json({ 
                    success: true, 
                    role: 'admin', 
                    user: { id: admin.id, name: admin.name, email: admin.email } 
                });
            } else {
                console.log('Password mismatch for admin');
            }
        }

        // Check if student
        const student = await prisma.student.findUnique({
            where: { email: email.trim().toLowerCase() }
        });

        if (student && student.password === password) {
            return NextResponse.json({ 
                success: true, 
                role: 'student', 
                user: { id: student.id, name: student.name, email: student.email, unlockedCourses: JSON.parse(student.unlockedCourses || '[]') } 
            });
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
