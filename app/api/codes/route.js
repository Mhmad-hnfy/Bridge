import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const codes = await prisma.activationCode.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(codes);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch codes' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { courseId, count, maxUses } = data;
        
        if (!courseId) return NextResponse.json({ error: 'Course ID required' }, { status: 400 });

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

        const newCodes = [];
        for (let i = 0; i < (count || 1); i++) {
            const codeStr = `${course.title.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            newCodes.push({
                code: codeStr,
                courseId: course.id,
                course: course.title,
                status: 'Active',
                maxUses: parseInt(maxUses) || 1
            });
        }

        await prisma.activationCode.createMany({ data: newCodes });
        return NextResponse.json({ success: true, count: newCodes.length });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'DB Error: ' + error.message + '. Try running "npx prisma generate" while the server is OFF.' }, { status: 500 });
    }
}

// For validation and unlocking (Student side)
export async function PUT(request) {
    try {
        const { code, courseId, studentId } = await request.json();
        
        const validCode = await prisma.activationCode.findFirst({
            where: { code, courseId }
        });

        if (validCode) {
            // 1. Check if course matches (already handled by findFirst but double check for safety)
            if (validCode.courseId !== courseId) {
                return NextResponse.json({ error: 'This code is for a different course.' }, { status: 400 });
            }

            // 2. Check if usage limit reached
            if (validCode.usedCount >= validCode.maxUses) {
                return NextResponse.json({ error: 'This code has reached its maximum usage limit.' }, { status: 400 });
            }

            // 3. Check if THIS student already used THIS code
            const usedByArr = JSON.parse(validCode.usedBy || '[]');
            if (usedByArr.includes(studentId)) {
                // If they already used it, just return success (re-unlock logic) 
                // But wait, the user wants them to be able to use a NEW code to reset views.
                // If they are entering the SAME code again, we don't increment usedCount but we still reset views?
                // Actually, if they are entering a code, they expect it to work.
            } else {
                // New student using this code
                usedByArr.push(studentId);
                await prisma.activationCode.update({
                    where: { id: validCode.id },
                    data: { 
                        usedCount: validCode.usedCount + 1,
                        usedBy: JSON.stringify(usedByArr),
                        status: (validCode.usedCount + 1) >= validCode.maxUses ? 'Used' : 'Active'
                    }
                });
            }

            // Add course to student's unlocked list
            const student = await prisma.student.findUnique({ where: { id: studentId } });
            if (student) {
                const unlocked = JSON.parse(student.unlockedCourses || '[]');
                if (!unlocked.includes(courseId)) {
                    unlocked.push(courseId);
                    await prisma.student.update({
                        where: { id: studentId },
                        data: { unlockedCourses: JSON.stringify(unlocked) }
                    });
                }

                // RESET VIEWS: If they redeem a code, reset their progress for all lessons in this course
                const lessons = await prisma.lesson.findMany({ where: { courseId } });
                const lessonIds = lessons.map(l => l.id);
                await prisma.lessonProgress.deleteMany({
                    where: {
                        studentId: studentId,
                        lessonId: { in: lessonIds }
                    }
                });
            }

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Invalid or already used code' }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const ids = searchParams.get('ids')?.split(',');

        if (id) {
            // Delete single and potentially relock for student
            const code = await prisma.activationCode.findUnique({ where: { id } });
            if (code && code.studentId && code.status === 'Used') {
                const student = await prisma.student.findUnique({ where: { id: code.studentId } });
                if (student) {
                    let unlocked = JSON.parse(student.unlockedCourses || '[]');
                    unlocked = unlocked.filter(cId => cId !== code.courseId);
                    await prisma.student.update({
                        where: { id: code.studentId },
                        data: { unlockedCourses: JSON.stringify(unlocked) }
                    });
                }
            }
            await prisma.activationCode.delete({ where: { id } });
        } else if (ids) {
            // Bulk delete
            await prisma.activationCode.deleteMany({ where: { id: { in: ids } } });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
