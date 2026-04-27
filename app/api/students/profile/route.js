import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
        }

        const { data: student, error } = await supabase
            .from('Student')
            .select('id, name, email, level, unlockedCourses, createdAt')
            .eq('id', id)
            .single();

        if (error || !student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error("FETCH PROFILE ERROR:", error);
        return NextResponse.json({ error: 'Failed to fetch student profile' }, { status: 500 });
    }
}

