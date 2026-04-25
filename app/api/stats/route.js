import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const studentCount = await prisma.student.count();
        const courseCount = await prisma.course.count();
        const codeCount = await prisma.activationCode.count();
        
        let totalRevenue = 0;
        
        try {
            const allCodes = await prisma.activationCode.findMany();
            const courses = await prisma.course.findMany();
            const courseMap = {};
            courses.forEach(c => courseMap[c.id] = c.price);
            
            allCodes.forEach(code => {
                // If the new schema is active, usedCount will exist. 
                // Otherwise, we fallback to counting codes with status 'Used' as 1 use.
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
            { label: 'Total Students', value: studentCount.toString(), change: '+10%', icon: '👥', color: 'bg-blue-500' },
            { label: 'Total Revenue', value: `${totalRevenue.toFixed(2)} EGP`, change: '+5%', icon: '💰', color: 'bg-emerald-500' },
            { label: 'Active Courses', value: courseCount.toString(), change: '0%', icon: '📚', color: 'bg-amber-500' },
            { label: 'Generated Codes', value: codeCount.toString(), change: '+12%', icon: '🔑', color: 'bg-indigo-500' },
        ]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
