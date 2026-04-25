import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { name, email, password, level, phone } = await request.json();

        const existing = await prisma.student.findUnique({ where: { email } });
        if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 });

        const student = await prisma.student.create({
            data: {
                name,
                email,
                password,
                level: level || 'Grade 12',
                phone: phone || ''
            }
        });

        return NextResponse.json({ 
            success: true, 
            role: 'student', 
            user: { id: student.id, name: student.name, email: student.email } 
        });
    } catch (error) {
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
