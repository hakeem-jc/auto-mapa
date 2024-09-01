import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data, null, false);
      const textContent = $('body').contents();
      console.log(textContent)
      // TODO - Get the write site to pull from so you can choose the right selector for it's text
      return NextResponse.json({ url });
    } catch (error: any) {
      return NextResponse.json({ url, error: error.message }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}