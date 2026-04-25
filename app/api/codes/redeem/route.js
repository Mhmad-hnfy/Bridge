import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { code, studentId } = await request.json();

        if (!code || !studentId) {
            return NextResponse.json({ error: 'Code and Student ID are required' }, { status: 400 });
        }

        // Find the active code
        const validCode = await prisma.activationCode.findFirst({
            where: { code, status: 'Active' }
        });

        if (!validCode) {
            return NextResponse.json({ error: 'Invalid or already used code.' }, { status: 400 });
        }

        // Mark code as used
        await prisma.activationCode.update({
            where: { id: validCode.id },
            data: { status: 'Used', studentId: studentId }
        });

        // Add course to student's unlocked list
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        if (student) {
            let unlocked = JSON.parse(student.unlockedCourses || '[]');
            if (!unlocked.includes(validCode.courseId)) {
                unlocked.push(validCode.courseId);
                await prisma.student.update({
                    where: { id: studentId },
                    data: { unlockedCourses: JSON.stringify(unlocked) }
                });
            } else {
                // Course already unlocked, this is a top-up code to reset views
                // Get all lessons in this course
                const lessons = await prisma.lesson.findMany({ where: { courseId: validCode.courseId } });
                const lessonIds = lessons.map(l => l.id);
                
                // Delete existing progress for these lessons for this student
                if (lessonIds.length > 0) {
                    await prisma.lessonProgress.deleteMany({
                        where: {
                            studentId: studentId,
                            lessonId: { in: lessonIds }
                        }
                    });
                }
            }
        } else {
             return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, courseId: validCode.courseId });
    } catch (error) {
        console.error("Redeem error:", error);
        return NextResponse.json({ error: 'Failed to redeem code' }, { status: 500 });
    }
}
