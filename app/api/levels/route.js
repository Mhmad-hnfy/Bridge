import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { data: levels, error } = await supabase.from('Level').select('*');
        if (error) throw error;
        return NextResponse.json(levels);
    } catch (error) {
        console.error("FETCH LEVELS ERROR:", error);
        return NextResponse.json({ error: 'Failed to fetch levels' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { name } = await request.json();
        const { data: level, error } = await supabase
            .from('Level')
            .insert([{ name }])
            .select()
            .single();
            
        if (error) throw error;
        return NextResponse.json(level);
    } catch (error) {
        console.error('Level Create Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create level' }, { status: 400 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const { error } = await supabase.from('Level').delete().eq('id', id);
        
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE LEVEL ERROR:", error);
        return NextResponse.json({ error: 'Failed to delete level' }, { status: 500 });
    }
}

