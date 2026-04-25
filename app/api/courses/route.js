import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        if (id) {
            const course = await prisma.course.findUnique({
                where: { id },
                include: { lessons: true }
            });
            return NextResponse.json(course);
        }
        const courses = await prisma.course.findMany({
            include: { lessons: true }
        });
        return NextResponse.json(courses);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { id, title, description, price, level, image } = data;

        if (id && id.length > 10) { // Simple check if it's a real cuid or just a number
            // Update existing
            const course = await prisma.course.update({
                where: { id },
                data: { title, description, price: parseFloat(price), level, image }
            });
            return NextResponse.json(course);
        } else {
            // Create new
            const course = await prisma.course.create({
                data: { title, description, price: parseFloat(price), level, image }
            });
            return NextResponse.json(course);
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save course' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Delete associated lessons first (or let Prisma handle if cascade is set)
        await prisma.lesson.deleteMany({ where: { courseId: id } });
        await prisma.course.delete({ where: { id } });
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
    }
}
