import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { code, studentId } = await request.json();

        if (!code || !studentId) {
            return NextResponse.json({ error: 'Code and Student ID are required' }, { status: 400 });
        }

        // Find the active code
        const { data: validCode, error: codeError } = await supabase
            .from('ActivationCode')
            .select('*')
            .eq('code', code)
            .eq('status', 'Active')
            .single();

        if (codeError || !validCode) {
            return NextResponse.json({ error: 'Invalid or already used code.' }, { status: 400 });
        }

        // Mark code as used
        const { error: updateCodeError } = await supabase
            .from('ActivationCode')
            .update({ status: 'Used' })
            .eq('id', validCode.id);
        
        if (updateCodeError) throw updateCodeError;

        // Add course to student's unlocked list
        const { data: student, error: studentError } = await supabase
            .from('Student')
            .select('*')
            .eq('id', studentId)
            .single();

        if (student) {
            let unlocked = JSON.parse(student.unlockedCourses || '[]');
            if (!unlocked.includes(validCode.courseId)) {
                unlocked.push(validCode.courseId);
                const { error: updateStudentError } = await supabase
                    .from('Student')
                    .update({ unlockedCourses: JSON.stringify(unlocked) })
                    .eq('id', studentId);
                
                if (updateStudentError) throw updateStudentError;
            } else {
                // Course already unlocked, this is a top-up code to reset views
                // Get all lessons in this course
                const { data: lessons } = await supabase
                    .from('Lesson')
                    .select('id')
                    .eq('courseId', validCode.courseId);
                
                const lessonIds = lessons.map(l => l.id);
                
                // Delete existing progress for these lessons for this student
                if (lessonIds.length > 0) {
                    const { error: deleteProgressError } = await supabase
                        .from('LessonProgress')
                        .delete()
                        .eq('studentId', studentId)
                        .in('lessonId', lessonIds);
                    
                    if (deleteProgressError) throw deleteProgressError;
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

