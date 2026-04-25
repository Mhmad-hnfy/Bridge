import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
        }

        const student = await prisma.student.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                level: true,
                unlockedCourses: true,
                createdAt: true
            }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json(student);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch student profile' }, { status: 500 });
    }
}
