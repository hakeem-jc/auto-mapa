import { chromium } from "playwright";
import { load } from "cheerio";

interface Subasta {
  text: string;
  links: string[];
}

export function parseSubastasHtml(html: string): Subasta[] {
  const $ = load(html);
  const subastaElements = $(".resultado-busqueda");

  const subastas: Subasta[] = [];
  subastaElements.each((_index, element) => {
    const subasta: Subasta = {
      text: "",
      links: [],
    };

    subasta.text = $(element).text().trim();

    $(element)
      .find("a")
      .each((i, link) => {
        const href = $(link).attr("href");
        if (href) {
          subasta.links.push(href);
        }
      });

    subastas.push(subasta);
  });

  return subastas;
}

export async function GET(_request: Request) {
  const url = process.env.SUBASTAS_URL || "https://subastas.boe.es/";

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url);
    await page.getByLabel("Seleccione la provincia").selectOption("28");
    await page.getByRole("button", { name: "Buscar" }).click();

    // Wait for page to load (adjust timeout as needed)
    await page.waitForTimeout(1000);

    const html = await page.content();
    await browser.close();

    const subastasData = parseSubastasHtml(html);

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
