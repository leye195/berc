import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import type { Rate } from "./types";

export default class KBBank {
  private url = "https://obank.kbstar.com/quics?page=C101423#loading";

  transformRate(rate?: string) {
    return !rate || rate === "-" ? "0" : rate;
  }

  async fetchRates() {
    const data: Rate[] = [];

    try {
      const browser = await puppeteer.launch({
        headless: true,
      });
      const page = await browser.newPage();
      await page.goto(this.url, {
        waitUntil: "networkidle2",
      });

      const content = await page.content();
      const $ = cheerio.load(content);

      console.log("--------KB Bank--------");
      $("#inqueryTable > table:nth-child(2) > tbody tr").each((_, element) => {
        const country = $(element).find("td:nth-child(1) > a").text().trim();
        const buyRate = this.transformRate(
          $(element).find("td:nth-child(6)").text().trim()
        );
        const sellRate = this.transformRate(
          $(element).find("td:nth-child(7)").text().trim()
        );
        const baseRate = this.transformRate(
          $(element).find("td:nth-child(3)").text().trim()
        );

        console.log(country, buyRate, sellRate, baseRate);
        data.push({
          name: country,
          buyRate,
          sellRate,
          baseRate,
        });
      });

      await browser.close();
    } catch (error) {
      console.log(`kbBank: ${error}`);
    } finally {
      return data;
    }
  }
}
