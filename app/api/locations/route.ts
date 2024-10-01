import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from "openai";
import axios from 'axios';

const openai = new OpenAI();

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    try {
      const { data } = await axios.get(url);

      const messages = [
        { "role": "system", "content": "You're an HTML Parser that extracts locations from HTML code into an array of strings e.g. ['Retiro Park, Madrid, Spain']. Only return javascript code. No markup" },
        { "role": "user", "content": `Parse this HTML and return the array of locations present in it:${data}` }
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-2024-05-13",
        messages: messages as any
      });

      return NextResponse.json({ result: completion.choices[0].message }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ url, error: error.message }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}