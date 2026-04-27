import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        if (id) {
            const { data: course, error } = await supabase
                .from('Course')
                .select('*, lessons:Lesson(*)')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return NextResponse.json(course);
        }
        const { data: courses, error } = await supabase
            .from('Course')
            .select('*, lessons:Lesson(*)');
        
        if (error) throw error;
        return NextResponse.json(courses);
    } catch (error) {
        console.error("FETCH COURSES ERROR:", error);
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const { id, title, description, price, level, image, isFree } = data;

        const isFreeCourse = isFree === true || isFree === 'true';
        const parsedPrice = isFreeCourse ? 0 : (parseFloat(price) || 0);

        if (id) {
            const { data: course, error } = await supabase
                .from('Course')
                .update({
                    title,
                    description: description || '',
                    price: parsedPrice,
                    level,
                    image: image || '',
                    isFree: isFreeCourse
                })
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return NextResponse.json(course);
        } else {
            const { data: course, error } = await supabase
                .from('Course')
                .insert([{
                    title,
                    description: description || '',
                    price: parsedPrice,
                    level,
                    image: image || '',
                    isFree: isFreeCourse
                }])
                .select()
                .single();
            
            if (error) throw error;
            return NextResponse.json(course);
        }
    } catch (error) {
        console.error("SAVE COURSE ERROR:", error);
        return NextResponse.json({ error: 'Failed to save course', details: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Delete associated lessons first if not handled by CASCADE
        await supabase.from('Lesson').delete().eq('courseId', id);
        const { error } = await supabase.from('Course').delete().eq('id', id);
        
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE COURSE ERROR:", error);
        return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
    }
}

