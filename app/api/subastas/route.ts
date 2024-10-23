import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Subasta, LocationsAPIResponse } from '@/app/interfaces';

const prisma = new PrismaClient();

// GET all subastas
export async function GET() {
  try {
    const subastas = await prisma.subasta.findMany()

    // Group subastas by type and remove type field in the same step
    const groupedSubastas: LocationsAPIResponse = {
      subastasEnMapa: subastas
        .filter((subasta) => subasta.type === 'subastasEnMapa')
        .map(({ type, ...subasta }) => subasta),
      subastasSinMapa: subastas
        .filter((subasta) => subasta.type === 'subastasSinMapa')
        .map(({ type, ...subasta }) => subasta),
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
    const body = await request.json();
    const { subastasEnMapa, subastasSinMapa }: LocationsAPIResponse = body;

    // Delete all current records to create new cache of scraped data
    await prisma.subasta.deleteMany()

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

    // Combine all created subastas into a single response, remove the redundant type attribute
    const allCreatedSubastas = {
      subastasEnMapa: createdSubastasEnMapa.map(({ type, ...subasta }) => subasta),
      subastasSinMapa: createdSubastasSinMapa.map(({ type, ...subasta }) => subasta)
    }   

    return NextResponse.json(allCreatedSubastas, { status: 201 })
  } catch (error) {
    console.error('Error creating subastas:', error)
    return NextResponse.json(
      { error: 'Error creating subastas' },
      { status: 500 }
    )
  }
}