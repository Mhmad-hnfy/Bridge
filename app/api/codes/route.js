import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { data: codes, error } = await supabase
            .from('ActivationCode')
            .select('*')
            .order('createdAt', { ascending: false });
            
        if (error) throw error;
        return NextResponse.json(codes);
    } catch (error) {
        console.error("FETCH CODES ERROR:", error);
        return NextResponse.json({ error: 'Failed to fetch codes' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { courseId, count, maxUses } = data;
        
        if (!courseId) return NextResponse.json({ error: 'Course ID required' }, { status: 400 });

        const { data: course, error: courseError } = await supabase
            .from('Course')
            .select('*')
            .eq('id', courseId)
            .single();
            
        if (courseError || !course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

        const newCodes = [];
        for (let i = 0; i < (count || 1); i++) {
            const codeStr = `${course.title.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            newCodes.push({
                code: codeStr,
                courseId: course.id,
                course: course.title,
                status: 'Active',
                maxUses: parseInt(maxUses) || 1,
                usedBy: '[]'
            });
        }

        const { error: insertError } = await supabase.from('ActivationCode').insert(newCodes);
        if (insertError) throw insertError;
        
        return NextResponse.json({ success: true, count: newCodes.length });
    } catch (error) {
        console.error("GENERATE CODES ERROR:", error);
        return NextResponse.json({ error: 'Failed to generate codes: ' + error.message }, { status: 500 });
    }
}

// For validation and unlocking (Student side)
export async function PUT(request) {
    try {
        const { code, courseId, studentId } = await request.json();
        
        const { data: validCode, error: fetchError } = await supabase
            .from('ActivationCode')
            .select('*')
            .eq('code', code)
            .eq('courseId', courseId)
            .single();

        if (validCode) {
            // Check usage limit
            if (validCode.usedCount >= validCode.maxUses) {
                return NextResponse.json({ error: 'This code has reached its maximum usage limit.' }, { status: 400 });
            }

            // Check if THIS student already used THIS code
            const usedByArr = JSON.parse(validCode.usedBy || '[]');
            if (!usedByArr.includes(studentId)) {
                // New student using this code
                usedByArr.push(studentId);
                const { error: updateError } = await supabase
                    .from('ActivationCode')
                    .update({ 
                        usedCount: validCode.usedCount + 1,
                        usedBy: JSON.stringify(usedByArr),
                        status: (validCode.usedCount + 1) >= validCode.maxUses ? 'Used' : 'Active'
                    })
                    .eq('id', validCode.id);
                
                if (updateError) throw updateError;
            }

            // Add course to student's unlocked list
            const { data: student, error: studentError } = await supabase
                .from('Student')
                .select('*')
                .eq('id', studentId)
                .single();
                
            if (student) {
                const unlocked = JSON.parse(student.unlockedCourses || '[]');
                if (!unlocked.includes(courseId)) {
                    unlocked.push(courseId);
                    await supabase
                        .from('Student')
                        .update({ unlockedCourses: JSON.stringify(unlocked) })
                        .eq('id', studentId);
                }

                // RESET VIEWS: If they redeem a code, reset their progress for all lessons in this course
                const { data: lessons } = await supabase
                    .from('Lesson')
                    .select('id')
                    .eq('courseId', courseId);
                
                const lessonIds = lessons.map(l => l.id);
                await supabase
                    .from('LessonProgress')
                    .delete()
                    .eq('studentId', studentId)
                    .in('lessonId', lessonIds);
            }

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Invalid or already used code' }, { status: 400 });
        }
    } catch (error) {
        console.error("REDEEM CODE ERROR:", error);
        return NextResponse.json({ error: 'Validation failed' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const ids = searchParams.get('ids')?.split(',');

        if (id) {
            const { error } = await supabase.from('ActivationCode').delete().eq('id', id);
            if (error) throw error;
        } else if (ids) {
            const { error } = await supabase.from('ActivationCode').delete().in('id', ids);
            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE CODES ERROR:", error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}

