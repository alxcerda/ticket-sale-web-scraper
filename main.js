// Web-scraping app to check whether tickets have become on sale on Resident Advisor
// If they become on sale, send email to notify me
// App can be set on Windows Task Scheduler to run at regular intervals

const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const secrets = require("./secrets.json");

checkRA("https://www.residentadvisor.net/events/1373574");

async function checkRA(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.hover(".closed");
  await page.screenshot({
    path: secrets.path,
  });
  const element = await page.$("#tickets-info");
  const text = await page.evaluate((item) => item.textContent, element);

  if (text != "Ticket sales have ended") {
    var transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: secrets.email,
        pass: secrets.password,
      },
    });

    var mailOptions = {
      from: secrets.email,
      to: secrets.email,
      subject: "!!Bicep tickets on sale!!",
      text: "App found a change in the page html, here's what changed...",
      attachments: [
        {
          path: secrets.path,
        },
      ],
    };

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    await browser.close();
  }
}
