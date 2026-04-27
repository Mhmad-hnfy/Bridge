import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { count: studentCount } = await supabase
            .from('Student')
            .select('*', { count: 'exact', head: true });

        const { count: courseCount } = await supabase
            .from('Course')
            .select('*', { count: 'exact', head: true });

        const { count: codeCount } = await supabase
            .from('ActivationCode')
            .select('*', { count: 'exact', head: true });
        
        let totalRevenue = 0;
        
        try {
            const { data: allCodes } = await supabase.from('ActivationCode').select('*');
            const { data: courses } = await supabase.from('Course').select('*');
            
            const courseMap = {};
            courses.forEach(c => courseMap[c.id] = c.price);
            
            allCodes.forEach(code => {
                if (code.usedCount !== undefined) {
                    totalRevenue += (courseMap[code.courseId] || 0) * (code.usedCount || 0);
                } else if (code.status === 'Used') {
                    totalRevenue += (courseMap[code.courseId] || 0);
                }
            });
        } catch (e) {
            console.log("Stats calculation fallback active");
        }

        return NextResponse.json([
            { label: 'Total Students', value: (studentCount || 0).toString(), change: '+10%', icon: '👥', color: 'bg-blue-500' },
            { label: 'Total Revenue', value: `${totalRevenue.toFixed(2)} EGP`, change: '+5%', icon: '💰', color: 'bg-emerald-500' },
            { label: 'Active Courses', value: (courseCount || 0).toString(), change: '0%', icon: '📚', color: 'bg-amber-500' },
            { label: 'Generated Codes', value: (codeCount || 0).toString(), change: '+12%', icon: '🔑', color: 'bg-indigo-500' },
        ]);
    } catch (error) {
        console.error("STATS ERROR:", error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}

