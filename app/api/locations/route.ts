import { chromium } from "playwright";
import { load } from "cheerio";
import { Subasta, LocationRequest, LocationResponse, Locations } from "@/app/interfaces";
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

    const locationRequests: LocationRequest[] = [];

    for (let sub of subastasData) {
      locationRequests.push({
        name: sub.name,
        text: sub.text
      });
    }

    const messages = [
      {
        role: "system",
        content: `You are a location formatting API. Your task is to process an array of objects containing text attributes that represent locations in Spain and format these locations properly for the Google Maps Geocoding API. If a location can't be determined, add it to a different array with the best guess.
                  Always format the response as JSON to be parsed into a JavaScript object.
                  Instructions:
                  1. Receive an array of objects where each object contains a 'text' field that includes text data describing a place in Spain
                  2. Remove text field and add a location field to each object. Ensure the location is accurately formatted for the Google Maps Geocoding API, which includes:
                    - Correct capitalization
                    - Inclusion of important geographic details such as city, region, and country (Spain)
                    - Proper punctuation and spacing
                  3. Return the updated array of objects, ensuring each location is fully specified and standardized as a single string suitable for geocoding in the attribute field.
                  4. If an exact location can't be specified, put the best option based on the details then create a separate array with the same format.
                  5. Return the information as a JSON object with the following structure so it can be easily parsed to JavaScript:
                    {
                      "mapped_locations": [
                        {
                          "name": "string",
                          "location": "string",
                        }
                      ],
                      "unmapped_locations": [
                        {
                          "name": "string",
                          "location": "string",
                        }
                      ]
                    }
                  6. Example result:
                  {
                    mapped_locations: [
                      { name: "SUBASTA SUB-JA-2024-TEMP1", text: "SUBASTA SUB-JA-2024-TEMP", location: "6 Calle de las Infantas, Madrid, Spain", link: "https://temp.com" },
                      { name: "SUBASTA SUB-JA-2024-TEMP2", text: "SUBASTA SUB-JA-2024-TEMP", location: "Plaza Mayor, Madrid, Spain", link: "https://temp.com" }
                    ],
                    unmapped_locations: [
                      { name: "SUBASTA SUB-JA-2024-TEMP3", text: "SUBASTA SUB-JA-2024-TEMP", location: "Coslada, Spain", link: "https://temp.com" },
                      { name: "SUBASTA SUB-JA-2024-TEMP4", text: "SUBASTA SUB-JA-2024-TEMP", location: "Madrid, Spain", link: "https://temp.com" }
                    ]
                  }`,
      },
      {
        role: "user",
        content: JSON.stringify(locationRequests)
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      messages: messages as any,
    });
    

    let open_ai_response = completion.choices[0].message.content;
    let location_data:Locations = {mapped_locations: [], unmapped_locations:[]};
    let mapped_locations: { [key: string]: string } = {};
    let unmapped_locations: { [key: string]: string }  = {};

    if (open_ai_response) {
      open_ai_response = open_ai_response.replace(/`/g, "");
      open_ai_response = open_ai_response.replace(/json/g, "");
      location_data = JSON.parse(open_ai_response);
    }

    for (let data of location_data.mapped_locations){
      mapped_locations[data.name] = data.location;
    }

    for (let data of location_data.unmapped_locations){
      unmapped_locations[data.name] = data.location;
    }
    
    let subastasEnMapa = [];
    let subastasSinMapa = [];

    for (let subasta of subastasData) {
      if (mapped_locations[subasta.name]) {
        subastasEnMapa.push({...subasta, location: mapped_locations[subasta.name]});
      } else if (unmapped_locations[subasta.name]) {
        subastasSinMapa.push({...subasta, location: unmapped_locations[subasta.name]});
      }
    }

    return new Response(JSON.stringify({ subastas: subastasEnMapa, subastasSinMapa }), {
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
