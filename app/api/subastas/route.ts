import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all subastas
export async function GET() {
  try {
    const subastas = await prisma.subasta.findMany()
    return NextResponse.json(subastas)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching subastas' },
      { status: 500 }
    )
  }
}

// POST new subasta
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, text, location, link, type } = body

    const newSubasta = await prisma.subasta.create({
      data: {
        name,
        text,
        location,
        link,
        type
      }
    })

    return NextResponse.json(newSubasta, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating subasta' },
      { status: 500 }
    )
  }
}

