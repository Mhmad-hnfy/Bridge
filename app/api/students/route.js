import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: students, error } = await supabase
            .from('Student')
            .select('*')
            .order('createdAt', { ascending: false });
            
        if (error) throw error;
        return NextResponse.json(students);
    } catch (error) {
        console.error("FETCH STUDENTS ERROR:", error);
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }
}

