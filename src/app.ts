import { config } from 'dotenv';
import express, { Application, NextFunction, Request, Response } from 'express';
import { engine } from 'express-handlebars'
import fs from 'fs'
const path = require('path');
const puppeteer = require('puppeteer');

config();

const app: Application = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', '/Users/sperera/WebstormProjects/pdf-generator/src/report-template');

app.use(express.static('public'));
app.use('/images', express.static('images'));

app.get('/generate-pdf', async (req, res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const dataPath = path.join(__dirname, 'data', 'data.json');
    const dataJson = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    const templateHtml = await page.goto('http://localhost:3000/');

    // Generate PDF
    await page.setContent(await templateHtml.text());
    const pdfBuffer = await page.pdf({ format: 'A4' });

    // Close browser
    await browser.close();

    // Save PDF to a file
    const pdfFilePath = path.join(__dirname, 'report-output/report.pdf');
    fs.writeFileSync(pdfFilePath, pdfBuffer);

    console.log('PDF saved:', pdfFilePath);
    res.send({message : "Report created in /report-output/report.pdf"})
});

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    const dataPath = path.join(__dirname, 'data', 'data.json');
    const dataJson = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.render('page', dataJson.data);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});