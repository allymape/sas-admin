require("dotenv").config();
const express = require("express");

const PDFDocument = require("pdfkit");



const mmilikiKuthibitishwaBaruaController = express.Router();

var session = require("express-session");
var path = require("path");
const { isAuthenticated, sendRequest, can } = require("../../../util");
const API_BASE_URL = process.env.API_BASE_URL;

const mmiliShuleDetails = API_BASE_URL + "ripoti-wamiliki-shule";

mmilikiKuthibitishwaBaruaController.get(
  "/mmilikiShuleBarua/:id",

  function (req, res) {
    let doc = new PDFDocument({
      margin: 20,
      size: 'A4'
    });
    const imagesPaths = path.join(__dirname + "/../../assets/images")
    const trackingNumber = req.params.id;
    const filename = encodeURIComponent(trackingNumber) + '.pdf'

    // for downloading set the content-dispostion to (download, attachment)
    res.setHeader('Content-disposition', 'inline; filename="' + filename + '"')
    res.setHeader('Content-type', 'application/pdf')

    generateHeader(doc, imagesPaths); // Invoke `generateHeader` function.
    generateBody(doc)
    generateFooter(doc);

    doc.pipe(res)
    doc.end()
  }
);

function generateHeader(doc, imagesPaths) {

  doc.font('Helvetica-Bold').fontSize(14)
    .text('JAMUHURI YA MUUNGANO WA TANZANIA', 30, 30, { align: 'center', characterSpacing: 0.2 })
    .text('WIZARA YA ELIMU, SAYANSI NA TEKNOLOJIA', { align: 'center', characterSpacing: .2 })
    .moveDown()

  doc.font('Helvetica').fontSize(12)
    .text(`Anuani ya simu "ELIMU"\nSimu: 026 296 35 33 \nBaruapepe: info@moe.go.tz \nTovut: www.moe.go.tz`, { lineGap: 2 })
    .text('Mji wa Serikali, Mtumba, \nMtaa wa Afya,\nS. L. P. 10,\n40479 DODOMA.', (doc.page.width / 2) + 120, 80, { lineGap: 2 })

  doc.image(imagesPaths + '/national-logo.png', (doc.page.width / 2) - 30, 80, { width: 80, height: 80 })
    .fillColor('#444444')

  doc.moveDown();
}

function generateBody(doc) {
  doc.text("Unapojibu tafadhali taja:", 30, 180)
    .moveDown()
    .moveDown()

  doc.font('Helvetica-Bold')
    .text('Kumb. na. CD.5/315/3169', { continued: true })
    .text('25/10/2023', { align: 'right' })
    .moveDown()
    .moveDown()

  doc.font('Helvetica')
    .text(`Diligence Internation School, \nS.L.P. 13850, \nDar es Salaam.`)
    .moveDown()
    .moveDown()

  let title = 'UTHIBITISHO WA MENEJA WA SHULE YA AWALI NA MSING DILIGENCE'.toUpperCase()
  doc.text('Yah: ', { continued: true, width: doc.page.width - 100, indent: 50, lineBreak: true })
    .font('Helvetica-Bold')
    .text(title, { underline: true, align: 'center' })
    .font('Helvetica')
    .moveDown()

  doc.text('Tafadhali rejea somo la barua hii', { indent: 40, lineGap: 3 })
    .moveDown()

  doc.text(`2.    Ninafurahi kukufahamisha kuwa thibitisho umetolewa kwa `, { lineGap: 4, continued: true })
    .font('Helvetica-Bold').text('Zainabu Aly Mweta ', { lineGap: 4, continued: true })
    .font('Helvetica').text('kuwa Meneja wa Shule ya Awali na Msingi ', { lineGap: 4, continued: true })
    .font('Helvetica-Bold').text('Diligence.')
    .font('Helvetica')
    .moveDown()
  doc.text(`3.    Uthibitisho huu umetolewa tarehe `, { lineGap: 4, continued: true })
    .font('Helvetica-Bold').text('25/10/12 ', { lineGap: 4, continued: true })
    .font('Helvetica').text('kwa mujibu wa ', { lineGap: 4, continued: true })
    .font('Helvetica-Bold').text('Sheria ya Elimu, Sura 353. ', { lineGap: 4, continued: true })
    .font('Helvetica').text('Utaiendesha shule hi kwa kuzingatia ', { lineGap: 4, continued: true })
    .font('Helvetica-Bold').text('Sheria, Kanuni, Taratibu na Miongozo ', { lineGap: 4, continued: true })
    .font('Helvetica').text('ya Wizara ya Elimu, Sayansi na Teknolojia. ', { lineGap: 4, continued: true })
    .font('Helvetica').text('Hakikisha shule ina ', { lineGap: 4, continued: true })
    .font('Helvetica-Bold').text('kasiki', { lineGap: 4, continued: true })
    .font('Helvetica').text('kwa ajili ya kuhifadhia nyaraka nyeti.')
    .moveDown()
  doc.font('Helvetica-Bold').text(`4.    Uthibitisho huu siyo kibali cha kusajili wanafunzi.`, { lineGap: 4 })
    .moveDown();
  doc.font('Helvetica').text(`5.    Ninakutakia utekelezaji mwema.`, { lineGap: 4 })

}

function generateFooter(doc) {
  const lineSize = 174;
  const signatureHeight = doc.page.height - 150;

  const startLine1 = (doc.page.width / 2) - 100;
  const endLine1 = ((doc.page.width / 2) - 100) + lineSize;
  doc
    .moveTo(startLine1, signatureHeight)
    .lineTo(endLine1, signatureHeight)
    .stroke();
  doc
    .font('Helvetica')
    .fontSize(12)
    .fill('#021c27')
    .text(
      'Ephrahim A. Simbeye',
      (doc.page.width / 2) - 100,
      signatureHeight + 25,
      {
        columns: 1,
        columnGap: 0,
        height: 40,
        width: lineSize,
        align: 'center',
      }
    );
  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fill('#021c27')
    .text(
      'KAIMU KAMISHNA WA ELIMU',
      (doc.page.width / 2) - 100,
      signatureHeight + 45,
      {
        columns: 1,
        columnGap: 0,
        height: 40,
        width: lineSize,
        align: 'center',
        underline: true
      }
    );
  doc.font('Helvetica').text('', 20, doc.page.height - 50, {
    lineBreak: false
  });
}

function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
  doc.fontSize(10)
    .text(c1, 50, y)
    .text(c2, 150, y)
    .text(c3, 280, y, { width: 90, align: 'right' })
    .text(c4, 370, y, { width: 90, align: 'right' })
    .text(c5, 0, y, { align: 'right' });
}

module.exports = mmilikiKuthibitishwaBaruaController;
