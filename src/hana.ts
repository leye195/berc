import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import type { Rate } from "./types";

export default class HanaBank {
  private url =
    "https://www.hanabank.com/cms/rate/index.do?contentUrl=/cms/rate/wpfxd651_01i.do";

  async fetchRates() {
    const data: Rate[] = [];
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
      });
      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"
      );
      await page.goto(this.url, {
        waitUntil: "networkidle2",
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      console.log("--------Hana Bank--------");
      $("tbody tr").each((_, element) => {
        const country = $(element).find("a u").text().trim().split(" ");
        const countryName = country.length >= 2 ? country[1] : country[2];

        const buyRate = $(element).find("td:nth-child(2)").text().trim();
        const sellRate = $(element).find("td:nth-child(4)").text().trim();
        const baseRate = $(element).find("td:nth-child(9)").text().trim();

        if (countryName) {
          data.push({
            name: countryName,
            buyRate,
            sellRate,
            baseRate,
          });
        }
      });
      await browser.close();
    } catch (error) {
      console.log(`hanaBank: ${error}`);
    } finally {
      if (browser) await browser.close();

      return data;
    }
  }
}
