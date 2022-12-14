import http, { RequestListener } from 'http';
import { test, expect } from '@playwright/test';


const startServer = (port:number, handler:RequestListener) => new Promise<any>(ok => {
  const server = http.createServer(handler);
  server.listen(port, () => {
    ok(server);
  });
});


type Predicate = (req:any, res:any) => boolean;

const singleServerRequest = (predicate:Predicate, handler:RequestListener) => new Promise(async(ok) => {
  const server = await startServer(3000, (req:any,res:any) => {
    if(predicate(req,res)) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      const result = handler(req,res);
      res.end(JSON.stringify(result), () => {
        server.close(async() => {
          ok(req);
        });
      });
    }
  });
});

test.describe.serial('these 2', () => {
  test('Real GET request is done', async ({ page }) => {
    const promise = singleServerRequest(
      (req) => req.url.includes('/foo'),
      () => ({ result:44 })
    );
    await page.goto('/');
    await page.click('"config baseURL"');
    await promise;
    await expect(page.locator('"44"')).toBeVisible();
  });


  test('Error is triggered when status code bigger than 300', async ({ page }) => {
    const promise = singleServerRequest(
      (req) => req.url.includes('/foo'),
      (_,res) => {
        res.statusCode = 422;
        return { error:'Could not square input' };
      }
    );
    await page.goto('/');
    await page.click('"config baseURL"');
    await promise;
    await expect(page.locator('"Could not square input"')).toBeVisible();
  });
});
