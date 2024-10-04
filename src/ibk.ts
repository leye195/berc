import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import type { Rate } from "./types";

export default class IBKBank {
  private url = "https://www.ibk.co.kr/fxtr/excRateList.ibk";

  transformRate(rate?: string) {
    return !rate || rate === "-" ? "0.00" : rate;
  }

  async fetchRates() {
    const data: Rate[] = [];

    try {
      const browser = await puppeteer.launch({
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

      console.log("--------IBK Bank--------");
      $("table.tbl_basic > tbody tr").each((_, element) => {
        const country = $(element).find("th:nth-child(1) > a").text().trim();

        const buyRate = this.transformRate(
          $(element).find("td:nth-child(6)").text().trim().split("\n")[0]
        );

        const sellRate = this.transformRate(
          $(element).find("td:nth-child(7)").text().trim().split("\n")[0]
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
      console.log(`ibkBank: ${error}`);
    } finally {
      return data;
    }
  }
}
