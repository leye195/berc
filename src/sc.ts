import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import type { Rate } from "./types";

export default class IBKBank {
  private url =
    "https://www.standardchartered.co.kr/np/kr/pl/et/ExchangeRateP1.jsp?link=1#tab-exc-cont";

  splitCurrencyString(input: string) {
    const match = input.match(/([가-힣]+)(\d*)([a-zA-Z]+)/);

    if (match) {
      const country = match[1]; // '일본'
      const amount = match[2] ?? null; // '100'
      const currency = match[3];
      return [country, amount, currency];
    } else {
      return []; // 유효하지 않은 입력 처리
    }
  }

  transformRate(rate?: string) {
    return !rate || rate === "-" ? "0.00" : rate;
  }

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

      console.log("--------SC Bank--------");
      $("#TB1_1 > tbody tr.generated").each((_, element) => {
        const [__, ___, country] = this.splitCurrencyString(
          $(element).find("td:nth-child(1)").text().trim()
        );

        const buyRate = this.transformRate(
          $(element).find("td:nth-child(6)").text().trim().split("\n")[0]
        );

        const sellRate = this.transformRate(
          $(element).find("td:nth-child(8)").text().trim().split("\n")[0]
        );

        const baseRate = this.transformRate(
          $(element).find("td:nth-child(2)").text().trim()
        );

        console.log(country, buyRate, sellRate, baseRate);
        data.push({
          name: country,
          buyRate,
          sellRate,
          baseRate,
        });
      });
    } catch (error) {
      console.log(`ibkBank: ${error}`);
    } finally {
      if (browser) await browser.close();

      return data;
    }
  }
}
