import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET single subasta
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const subasta = await prisma.subasta.findUnique({
      where: {
        id: params.id
      }
    })

    if (!subasta) {
      return NextResponse.json(
        { error: 'Subasta not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(subasta)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching subasta' },
      { status: 500 }
    )
  }
}

// PUT update subasta
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, text, location, link, type } = body

    const updatedSubasta = await prisma.subasta.update({
      where: {
        id: params.id
      },
      data: {
        name,
        text,
        location,
        link,
        type
      }
    })

    return NextResponse.json(updatedSubasta)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating subasta' },
      { status: 500 }
    )
  }
}

// DELETE subasta
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.subasta.delete({
      where: {
        id: params.id
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error deleting subasta' },
      { status: 500 }
    )
  }
}