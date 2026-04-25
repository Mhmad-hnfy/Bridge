import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    try {
        const lessons = await prisma.lesson.findMany({
            where: courseId ? { courseId } : {}
        });
        return NextResponse.json(lessons);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { id, title, videoUrl, maxViews, courseId } = data;

        if (id && typeof id === 'string' && id.length > 10) {
            // Update
            const lesson = await prisma.lesson.update({
                where: { id },
                data: { title, videoUrl, maxViews: parseInt(maxViews), courseId }
            });
            return NextResponse.json(lesson);
        } else {
            // Create
            const lesson = await prisma.lesson.create({
                data: { title, videoUrl, maxViews: parseInt(maxViews), courseId }
            });
            return NextResponse.json(lesson);
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save lesson' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.lesson.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
    }
}
