import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Subasta, LocationsAPIResponse } from '@/app/interfaces';

const prisma = new PrismaClient();

// GET all subastas
export async function GET() {
  try {
    const subastas = await prisma.subasta.findMany()

    // Group subastas by type
    const groupedSubastas: LocationsAPIResponse = {
      subastasEnMapa: subastas.filter(
        (subasta) => subasta.type === 'subastasEnMapa'
      ),
      subastasSinMapa: subastas.filter(
        (subasta) => subasta.type === 'subastasSinMapa'
      ),
    }

    return NextResponse.json(groupedSubastas)
  } catch (error) {
    console.error('Error fetching subastas:', error)
    return NextResponse.json(
      { error: 'Error fetching subastas' },
      { status: 500 }
    )
  }
}


// POST new subastas
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { subastasEnMapa, subastasSinMapa }: LocationsAPIResponse = body

    // Create entries for subastas with map
    const subastasEnMapaPromises = subastasEnMapa.map((subasta: Subasta) => {
      return prisma.subasta.create({
        data: {
          name: subasta.name,
          text: subasta.text,
          location: subasta.location,
          link: subasta.link,
          type: 'subastasEnMapa'
        }
      })
    })

    // Create entries for subastas without map
    const subastasSinMapaPromises = subastasSinMapa.map((subasta: Subasta) => {
      return prisma.subasta.create({
        data: {
          name: subasta.name,
          text: subasta.text,
          location: subasta.location,
          link: subasta.link,
          type: 'subastasSinMapa'
        }
      })
    })

    // Execute all database operations concurrently
    const [createdSubastasEnMapa, createdSubastasSinMapa] = await Promise.all([
      Promise.all(subastasEnMapaPromises),
      Promise.all(subastasSinMapaPromises)
    ])

    // Combine all created subastas into a single response
    const allCreatedSubastas = [...createdSubastasEnMapa, ...createdSubastasSinMapa]

    return NextResponse.json(allCreatedSubastas, { status: 201 })
  } catch (error) {
    console.error('Error creating subastas:', error)
    return NextResponse.json(
      { error: 'Error creating subastas' },
      { status: 500 }
    )
  }
}