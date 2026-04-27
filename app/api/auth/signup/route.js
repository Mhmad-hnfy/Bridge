import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { name, email, password, level, phone } = await request.json();

        const { data: existing } = await supabase
            .from('Student')
            .select('id')
            .eq('email', email)
            .single();
            
        if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 });

        const { data: student, error } = await supabase
            .from('Student')
            .insert([{
                name,
                email,
                password,
                level: level || 'Grade 12',
                phone: phone || ''
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ 
            success: true, 
            role: 'student', 
            user: { id: student.id, name: student.name, email: student.email } 
        });
    } catch (error) {
        console.error("SIGNUP ERROR:", error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}

