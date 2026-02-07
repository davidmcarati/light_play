const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const logs = [];
    page.on("console", msg => {
        const text = msg.text();
        logs.push(text);
        console.log(text);
    });

    page.on("pageerror", err => {
        console.error("PAGE ERROR:", err.message);
    });

    const port = process.argv[2] || "5500";
    await page.goto(`http://localhost:${port}/tests.html`, { waitUntil: "networkidle0" });

    await new Promise(resolve => setTimeout(resolve, 3000));

    await browser.close();

    const hasFail = logs.some(l => l.includes("SOME TEST SUITES FAILED") || l.includes("✗"));
    process.exit(hasFail ? 1 : 0);
})();
