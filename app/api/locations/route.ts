import { chromium } from "playwright";
import { load } from "cheerio";
import { Subasta } from "@/app/interfaces";
import { OpenAI } from "openai";

const openai = new OpenAI();

function parseSubastasHtml(html: string, url: string): Subasta[] {
  const $ = load(html);
  const subastaElements = $(".resultado-busqueda");

  const subastas: Subasta[] = [];
  subastaElements.each((_index, element) => {
    const subasta: Subasta = {
      name: $(element).text().trim().split("\n")[0],
      text: $(element).text().trim(),
      location: "",
      link: "",
    };

    $(element)
      .find("a")
      .each((_i, link) => {
        const href = $(link).attr("href");
        if (href) {
          const cleanedHref = href.startsWith(".") ? href.substring(1) : href;
          subasta.link = new URL(cleanedHref, url).toString();
        }
        return false; // Break the loop after the first iteration. Otherwise it returns duplicate links
      });

    subastas.push(subasta);
  });

  return subastas;
}

export async function GET(_request: Request) {
  const url = process.env.SUBASTAS_URL || "https://subastas.boe.es/";
  let html_pages = [];
  let wait_time = 500;

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url);
    await page.getByLabel("Seleccione la provincia").selectOption("28");
    await page.getByRole("button", { name: "Buscar" }).click();

    // Wait for page to load (adjust timeout as needed)
    await page.waitForTimeout(wait_time);

    while (true) {
      const html = await page.content();
      html_pages.push(html);

      try {
        // Try clicking next page button
        await page
          .getByRole("link", { name: "Pág. siguiente" })
          .first()
          .click();
        await page.waitForTimeout(wait_time); // Adjust timeout for next page load
      } catch (error) {
        // Likely reached the last page
        break;
      }
    }

    const subastasData = [];
    for (const pageHtml of html_pages) {
      subastasData.push(...parseSubastasHtml(pageHtml, url));
    }

    // const messages = [
    //   { "role": "system", "content": "You are a location formatting assistant. Your task is to process an array of objects containing text attributes that represent locations in Spain and format these locations properly for the Google Maps Geocoding API." },
    //   { "role": "user", "content": 'Extract and format the address in the following text e.g. Find "CL/ ALBASANZ, 38. MADRID" and return 38, Calle Albasanz, Madrid"' }
    // ];

    const messages = [
      {
        role: "system",
        content: `You are a location formatting assistant. Your task is to process an array of objects containing text attributes that represent locations in Spain and format these locations properly for the Google Maps Geocoding API. If a location can't be determined, add it to a different array with the best guess.
                  Instructions:
                  1. Receive an array of objects where each object contains a 'text' field that includes text data describing a place in Spain and an empty 'location' field that will be populated.
                  2. Ensure the location is accurately formatted for the Google Maps Geocoding API, which includes:
                    - Correct capitalization
                    - Inclusion of important geographic details such as city, region, and country (Spain)
                    - Proper punctuation and spacing
                  3. Return the updated array of objects, ensuring each location is fully specified and standardized as a single string suitable for geocoding in the attribute field.
                  4. If an exact location can't be specified, put the best option based on the details then create a separate array with the same format.
                  5. Example result:
                  {
                    mapped_locations: [
                      { name: "SUBASTA SUB-JA-2024-TEMP", text: "SUBASTA SUB-JA-2024-TEMP", location: "6 Calle de las Infantas, Madrid, Spain", link: "https://temp.com" },
                      { name: "SUBASTA SUB-JA-2024-TEMP", text: "SUBASTA SUB-JA-2024-TEMP", location: "Plaza Mayor, Madrid, Spain", link: "https://temp.com" }
                    ],
                    unmapped_locations: [
                      { name: "SUBASTA SUB-JA-2024-TEMP", text: "SUBASTA SUB-JA-2024-TEMP", location: "Coslada, Spain", link: "https://temp.com" },
                      { name: "SUBASTA SUB-JA-2024-TEMP", text: "SUBASTA SUB-JA-2024-TEMP", location: "Madrid, Spain", link: "https://temp.com" }
                    ]
                  }`,
      },
      {
        role: "user",
        content: JSON.stringify(subastasData)
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      messages: messages as any,
    });

    console.log(completion.choices[0].message);
    

    // return NextResponse.json({ result: completion.choices[0].message }, { status: 200 });

    return new Response(JSON.stringify({ subastas: subastasData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Playwright script failed" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
