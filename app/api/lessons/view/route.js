import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const lessonId = searchParams.get('lessonId');
        const studentId = searchParams.get('studentId');

        if (!lessonId || !studentId) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

        const { data: lesson, error: lessonError } = await supabase
            .from('Lesson')
            .select('*, course:Course(*)')
            .eq('id', lessonId)
            .single();
            
        if (lessonError || !lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

        if (lesson.course.isFree) {
            return NextResponse.json({ allowed: true, viewsRemaining: 'Unlimited' });
        }

        const { data: progress } = await supabase
            .from('LessonProgress')
            .select('*')
            .eq('studentId', studentId)
            .eq('lessonId', lessonId)
            .single();

        const viewsUsed = progress?.viewsUsed || 0;
        const allowed = lesson.maxViews === 0 || viewsUsed < lesson.maxViews;

        return NextResponse.json({ 
            allowed, 
            viewsRemaining: lesson.maxViews > 0 ? lesson.maxViews - viewsUsed : 'Unlimited' 
        });
    } catch (error) {
        console.error("VIEW CHECK ERROR:", error);
        return NextResponse.json({ error: 'Check failed' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { lessonId, studentId } = await request.json();

        if (!lessonId || !studentId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const { data: lesson, error: lessonError } = await supabase
            .from('Lesson')
            .select('*, course:Course(*)')
            .eq('id', lessonId)
            .single();
            
        if (lessonError || !lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        if (lesson.course.isFree) {
            return NextResponse.json({ allowed: true, viewsRemaining: 'Unlimited' });
        }

        let { data: progress } = await supabase
            .from('LessonProgress')
            .select('*')
            .eq('studentId', studentId)
            .eq('lessonId', lessonId)
            .single();

        if (progress) {
            // GRACE PERIOD: If viewed in the last 10 minutes, don't count as a new view
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
            if (new Date(progress.updatedAt) > tenMinutesAgo) {
                return NextResponse.json({ allowed: true, viewsRemaining: lesson.maxViews > 0 ? lesson.maxViews - progress.viewsUsed : 'Unlimited' });
            }

            if (lesson.maxViews > 0 && progress.viewsUsed >= lesson.maxViews) {
                return NextResponse.json({ allowed: false, message: 'Views exhausted. Please enter another activation code.' });
            }
            
            // Increment views
            const { data: updatedProgress, error: updateError } = await supabase
                .from('LessonProgress')
                .update({ 
                    viewsUsed: progress.viewsUsed + 1,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', progress.id)
                .select()
                .single();
            
            if (updateError) throw updateError;
            progress = updatedProgress;
        } else {
            // First view
            if (lesson.maxViews > 0 && 0 >= lesson.maxViews) {
                 return NextResponse.json({ allowed: false, message: 'Lesson has 0 max views allowed.' });
            }

            const { data: newProgress, error: insertError } = await supabase
                .from('LessonProgress')
                .insert([{
                    studentId,
                    lessonId,
                    viewsUsed: 1
                }])
                .select()
                .single();
            
            if (insertError) throw insertError;
            progress = newProgress;
        }

        return NextResponse.json({ allowed: true, viewsRemaining: lesson.maxViews > 0 ? lesson.maxViews - progress.viewsUsed : 'Unlimited' });
    } catch (error) {
        console.error('View tracking error:', error);
        return NextResponse.json({ error: 'Database Error: ' + error.message }, { status: 500 });
    }
}

