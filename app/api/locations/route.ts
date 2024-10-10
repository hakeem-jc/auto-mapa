import { chromium } from "playwright";
import { load } from "cheerio";
import { Subasta } from "@/app/interfaces";

function parseSubastasHtml(html: string, url: string): Subasta[] {
  const $ = load(html);
  const subastaElements = $(".resultado-busqueda");

  const subastas: Subasta[] = [];
  subastaElements.each((_index, element) => {
    const subasta: Subasta = {
      text: "",
      location: "",
      link: "",
    };

    subasta.text = $(element).text().trim().split("\n")[0];

    $(element)
    .find("a")
    .each((_i, link) => {
      const href = $(link).attr("href");
      if (href) {
        const cleanedHref = href.startsWith('.') ? href.substring(1) : href;
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
        await page.getByRole('link', { name: 'Pág. siguiente' }).first().click();
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
