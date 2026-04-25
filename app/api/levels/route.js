import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const levels = await prisma.level.findMany();
        return NextResponse.json(levels);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch levels' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { name } = await request.json();
        const level = await prisma.level.create({
            data: { name }
        });
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
        await prisma.level.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete level' }, { status: 500 });
    }
}
