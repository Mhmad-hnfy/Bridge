import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const lessonId = searchParams.get('lessonId');
        const studentId = searchParams.get('studentId');

        if (!lessonId || !studentId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

        let progress = await prisma.lessonProgress.findUnique({
            where: { studentId_lessonId: { studentId, lessonId } }
        });

        const viewsUsed = progress?.viewsUsed || 0;
        const allowed = lesson.maxViews === 0 || viewsUsed < lesson.maxViews;

        return NextResponse.json({ 
            allowed, 
            viewsRemaining: lesson.maxViews > 0 ? lesson.maxViews - viewsUsed : 'Unlimited' 
        });
    } catch (error) {
        return NextResponse.json({ error: 'Check failed' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { lessonId, studentId } = await request.json();

        if (!lessonId || !studentId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        // Admins might not pass through here, but just in case:
        // Actually, admins don't have studentId, or their role bypasses this.
        
        if (!prisma.lessonProgress) {
            return NextResponse.json({ error: 'System Error: Database client needs a restart. Please restart the server.' }, { status: 500 });
        }

        let progress = await prisma.lessonProgress.findUnique({
            where: {
                studentId_lessonId: { studentId, lessonId }
            }
        });

        if (progress) {
            // GRACE PERIOD: If viewed in the last 10 minutes, don't count as a new view
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
            if (progress.updatedAt > tenMinutesAgo) {
                return NextResponse.json({ allowed: true, viewsRemaining: lesson.maxViews > 0 ? lesson.maxViews - progress.viewsUsed : 'Unlimited' });
            }

            if (lesson.maxViews > 0 && progress.viewsUsed >= lesson.maxViews) {
                return NextResponse.json({ allowed: false, message: 'Views exhausted. Please enter another activation code.' });
            }
            
            // Increment views
            progress = await prisma.lessonProgress.update({
                where: { id: progress.id },
                data: { viewsUsed: progress.viewsUsed + 1 }
            });
        } else {
            // First view
            if (lesson.maxViews > 0 && 0 >= lesson.maxViews) {
                 return NextResponse.json({ allowed: false, message: 'Lesson has 0 max views allowed.' });
            }

            progress = await prisma.lessonProgress.create({
                data: {
                    studentId,
                    lessonId,
                    viewsUsed: 1
                }
            });
        }

        return NextResponse.json({ allowed: true, viewsRemaining: lesson.maxViews > 0 ? lesson.maxViews - progress.viewsUsed : 'Unlimited' });
    } catch (error) {
        console.error('View tracking error:', error);
        return NextResponse.json({ error: 'Database Error: ' + error.message }, { status: 500 });
    }
}
