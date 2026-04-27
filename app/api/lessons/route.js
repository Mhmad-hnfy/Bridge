import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    try {
        let query = supabase.from('Lesson').select('*');
        if (courseId) {
            query = query.eq('courseId', courseId);
        }
        
        const { data: lessons, error } = await query;
        if (error) throw error;
        
        return NextResponse.json(lessons);
    } catch (error) {
        console.error("FETCH LESSONS ERROR:", error);
        return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { id, title, videoUrl, maxViews, courseId } = data;

        if (id && typeof id === 'string' && id.length > 10) {
            // Update
            const { data: lesson, error } = await supabase
                .from('Lesson')
                .update({ 
                    title, 
                    videoUrl, 
                    maxViews: parseInt(maxViews), 
                    courseId 
                })
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return NextResponse.json(lesson);
        } else {
            // Create
            const { data: lesson, error } = await supabase
                .from('Lesson')
                .insert([{ 
                    title, 
                    videoUrl, 
                    maxViews: parseInt(maxViews), 
                    courseId 
                }])
                .select()
                .single();
            
            if (error) throw error;
            return NextResponse.json(lesson);
        }
    } catch (error) {
        console.error("SAVE LESSON ERROR:", error);
        return NextResponse.json({ error: 'Failed to save lesson' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const { error } = await supabase.from('Lesson').delete().eq('id', id);
        if (error) throw error;
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE LESSON ERROR:", error);
        return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
    }
}

