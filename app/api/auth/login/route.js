import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const { email, password } = await request.json();
        const normalizedEmail = email.trim().toLowerCase();
        console.log('Login attempt for:', normalizedEmail);

        if (normalizedEmail === 'admin@drislam.com' && password === 'admin123') {
            return NextResponse.json({ 
                success: true, 
                role: 'admin', 
                user: { name: 'Dr. Islam (Backup)', email: 'admin@drislam.com' } 
            });
        }

        // Check if admin in DB
        const { data: admin } = await supabase
            .from('Admin')
            .select('*')
            .eq('email', normalizedEmail)
            .single();

        if (admin) {
            console.log('Admin found in DB:', admin.email);
            if (admin.password === password) {
                return NextResponse.json({ 
                    success: true, 
                    role: 'admin', 
                    user: { id: admin.id, name: admin.name, email: admin.email } 
                });
            } else {
                console.log('Password mismatch for admin');
            }
        }

        // Check if student
        const { data: student } = await supabase
            .from('Student')
            .select('*')
            .eq('email', normalizedEmail)
            .single();

        if (student && student.password === password) {
            return NextResponse.json({ 
                success: true, 
                role: 'student', 
                user: { id: student.id, name: student.name, email: student.email, unlockedCourses: JSON.parse(student.unlockedCourses || '[]') } 
            });
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}

