import { chromium } from 'playwright';

export async function GET(_request: Request) {
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(process.env.SUBASTAS_URL || 'https://subastas.boe.es/');
    await page.getByLabel('Seleccione la provincia').selectOption('28');
    await page.getByRole('button', { name: 'Buscar' }).click();

    // Wait for page to load (adjust timeout as needed)
    await page.waitForTimeout(5000);

    const html = await page.content();
    await browser.close();

    return new Response(JSON.stringify({ html }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Playwright script failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}