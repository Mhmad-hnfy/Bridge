import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const students = await prisma.student.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(students);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }
}
