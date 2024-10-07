import { NextResponse } from 'next/server';
import axios from 'axios';
import { load } from 'cheerio'; // Corrected import for cheerio

export async function GET(request: Request) {
  // Parse the URL and get the search parameters
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  // Check if the URL is provided
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Fetch the HTML content from the provided URL
    const response = await axios.get(url);
    const html: string = response.data;

    // Load the HTML into Cheerio for parsing
    const $ = load(html);  // Use load from cheerio

    // Initialize an empty array to store the locations
    const locations: string[] = [];

    // Use the correct selector to extract location text
    // Example assumes locations are in elements with the class ".location"
    $('.location').each((_index, element) => {
      const locationText = $(element).text().trim();
      locations.push(locationText);
    });

    // Return the list of locations as a JSON response
    return NextResponse.json({ locations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching or parsing the URL:', error);
    return NextResponse.json({ error: 'Failed to fetch or parse the URL' }, { status: 500 });
  }
}