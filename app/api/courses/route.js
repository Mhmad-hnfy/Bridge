import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        if (id) {
            const course = await prisma.course.findUnique({
                where: { id },
                include: { lessons: true }
            });
            return NextResponse.json(course);
        }
        const courses = await prisma.course.findMany({
            include: { lessons: true }
        });
        return NextResponse.json(courses);
    } catch (error) {
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
            // Update existing using Raw SQL to bypass client lock
            await prisma.$executeRawUnsafe(
                `UPDATE Course SET title = ?, description = ?, price = ?, level = ?, image = ?, isFree = ? WHERE id = ?`,
                title, description || '', parsedPrice, level, image || '', isFreeCourse ? 1 : 0, id
            );
            
            // Fetch updated course using RAW SQL to bypass client model validation
            const courses = await prisma.$queryRawUnsafe(`SELECT * FROM Course WHERE id = ?`, id);
            const course = courses[0];
            
            if (course) {
                // Important: SQLite raw queries return BigInts which fail JSON serialization
                for (let key in course) {
                    if (typeof course[key] === 'bigint') course[key] = Number(course[key]);
                }
            }
            
            return NextResponse.json(course);
        } else {
            // Create new using Raw SQL to bypass client lock
            const newId = 'c' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await prisma.$executeRawUnsafe(
                `INSERT INTO Course (id, title, description, price, level, image, isFree) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                newId, title, description || '', parsedPrice, level, image || '', isFreeCourse ? 1 : 0
            );
            
            const courses = await prisma.$queryRawUnsafe(`SELECT * FROM Course WHERE id = ?`, newId);
            const course = courses[0];
            if (course) {
                for (let key in course) {
                    if (typeof course[key] === 'bigint') course[key] = Number(course[key]);
                }
            }
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

        // Delete associated lessons first (or let Prisma handle if cascade is set)
        await prisma.lesson.deleteMany({ where: { courseId: id } });
        await prisma.course.delete({ where: { id } });
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
    }
}
