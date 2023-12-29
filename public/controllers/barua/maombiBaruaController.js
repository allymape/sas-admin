require("dotenv").config();
const express = require("express");

const maombiBaruaController = express.Router();

var session = require("express-session");
const { isAuthenticated, sendRequest, can, formatParagraph, generateLetter } = require("../../../util");
const API_BASE_URL = process.env.API_BASE_URL;

const mmiliShuleDetails = API_BASE_URL + "ripoti-wamiliki-shule";

maombiBaruaController.get(
  "/uthibitishoMenejaShuleBarua/:id",

  function (req, res) {
    const reference = "CD.5/315/3169";
    const createdAt = '27/12/2023';
    const company = 'Fedha Boys Secondary School';
    const box = "S.L.P 12999";
    const mkoa = 'Dar es salaam';
    const title = `UTHIBITISHO WA MENEJA WA SHULE YA AWALI NA MSINGI FEDHA BOYS`;
    const signature = 'Sahihi'
    const signatory = "Ephrahim A. Simbeye";
    const cheo = "KAIMU KAMISHNA WA ELIMU";
    const paragraphs = [
                    `      Tafadhali rejea somo la barua hii.\n\n\n`,
                    `2.    Ninafurahi kukufahimisha kuwa uthibitisho umetolewa kwa <b>Zainabu Ally</b> Mweta kuwa Meneja wa Shule ya Awali na Msingi <b>Fedha Boys</b>\n\n`,
                    `3.    Uthibitisho huu umetolewa tarehe <b>27/12/2023</b> kwa mujibu wa <b>Sheria ya Elimu, Sura 353.</b> Utaindesha shule hii kwa kuzingatia <b>Sheria, Kanuni, Taratibu na Miongozo</b> ya Wizara ya Elimu, Sayansi na Teknolojia. Hakikisha shule ina <b>kasiki</b> kwa ajili ya kuhifadhia nyaraka nyeti.\n\n`,
                    `4.    Uthibitisho huu siyo kibali cha kusajili Wanafunzi.\n\n\n`,
                    `5.    <b>Ninakutakia utekelezaji mwema.</b>`,
    ];
    const body = ``;
    generateLetter(req , res , reference, createdAt, company , box , mkoa , title , paragraphs , signature , signatory , cheo);
  }
);


maombiBaruaController.get(
  "/usajiliWaShuleBarua/:id",

  function (req, res) {
    const reference = "CD.5/315/3169";
    const createdAt = '27/12/2023';
    const company = 'Fedha Boys Secondary School';
    const box = "S.L.P 12999";
    const mkoa = 'Dar es salaam';
    const title = `USAJILI WA SHULE YA AWALI NA MSINGI PARAGON`;
    const signature = 'Sahihi'
    const signatory = "Ephrahim A. Simbeye";
    const cheo = "KAIMU KAMISHNA WA ELIMU";
    const paragraphs = [
                    `      Tafadhali rejea somo la barua hii.\n\n\n`,
                    `2.    Ninafurahi kukujulisha kuwa shule ya Awali na Msingi <b>Paragon</b> imesajiliwa tarehe <b> 26/10/2023</b> kwa mujibu wa <b>Sheria ya Elimu, Sura ya 353.</b> \n\n`,
                    `3.    Shule imepewa namba ya <b>Usajili EM. 20256</b> kuwa shule ya Awali na Msingi na jina <b>Paragon</b> limeidhinishwa. Shule hi imeidhinishwa kuwa ya <b>mkondo mmoja (01), kutwa na mchanganyiko</b>, itakayotumia Lugha ya Kiingereza kufundishia na kujifunzia.\n\n`,
                    `4.    Kufuatana na <b>Sheria ya Elimu Sura 353,</b> cheti cha Usajili kiwekwe bayana na Uongozi wa Shule uwe tayari kukionesha iwapo kitatakiwa. Hakikisha kuwa <b>Kamati ya Shule</b> inaundwa katika muda wa miezi sita baada ya usajili. Kulingana na <b>Waraka wa Elimu Na. 10 wa mwaka 2011 usajili wa shule hii utarudiwa baada ya miaka 4. </b>\n\n`,
                    `5.    Mmiliki wa Shule atatakiwa kuja kuchukua cheti cha usajili wa shule akiwa na kitambulisho chake mwezi mmoja baada ya kupokea barua hii.\n\n\n`,
                    `6.    Ninakutakia utekelezaji mwema.`,
    ];
    const body = ``;
    generateLetter(req , res , reference, createdAt, company , box , mkoa , title , paragraphs , signature , signatory , cheo);
  }
);


maombiBaruaController.get(
  "/hudumaYaBweniBarua/:id",

  function (req, res) {
    const reference = "CD.5/315/3169";
    const createdAt = '27/12/2023';
    const company = 'Fedha Boys Secondary School';
    const box = "S.L.P 12999";
    const mkoa = 'Dar es salaam';
    const title = `KIBALI CHA KUTOA HUDUMA YA BWENI KWA SHULE YA SEKONDARI AHMES`;
    const signature = 'Sahihi'
    const signatory = "Ephrahim A. Simbeye";
    const cheo = "KAIMU KAMISHNA WA ELIMU";
    const paragraphs = [
                    `      Tafadhali rejea somo la barua hii.\n\n\n`,
                    `2.    Napenda kukujulisha kuwa maombi yako ya kibali cha kutoa <b>huduma ya bweni</b> katika shule ya Sekondari <b>AHMES</b> yamekubaliwa. \n\n`,
                    `3.    Kibali kimetolewa tarehe <b>26/10/2023</b> kulaza wanafunzi <b>288 Wasichana tu</b>. Unaagizwa kuimarisha hali ya usalama wa wanafunzi ndani na nje ya bweni. Kibali hiki kimetolewa kulaza wanafunzi wa <b>Sekondari tu.</b> \n\n`,
                    `4.    Aidha, <b>Wathibiti Ubora wa Shule</b> watafuatilia kuhusu uwekaji vifaa vya zimamoto, viashiria moshi, makabati pamoja na sehemu ya kuteketeza taka <b>(Incinerator)</b>. Pia watafuatilia idadi halisi ya wanafunzi wanaolala ndani ya mabweni ili kuepuka <b>msongamano</b> wa wanafunzi.\n\n`,
                    `5.    Kibali hiki kimetolewa kwa mujibu wa <b>Sheria ya Elimu, Sura 353</b>. Kwa masharti kuwa utazingatia mwongozo wa Wizara wa kuanzisha na kusajili shule. \n\n\n`,
                    `6.    Ninakutakia utekelezaji mwema.`,
    ];
    const body = ``;
    generateLetter(req , res , reference, createdAt, company , box , mkoa , title , paragraphs , signature , signatory , cheo);
  }
);


maombiBaruaController.get(
  "/kutumiaMajengoKuanzishaShuleBarua/:id",

  function (req, res) {
    const reference = "CD.5/315/3169";
    const createdAt = '27/12/2023';
    const company = 'Fedha Boys Secondary School';
    const box = "S.L.P 12999";
    const mkoa = 'Dar es salaam';
    const title = `KIBALI CHA KUTUMIA MAJENGO KUANZISHA SHULE YA AWALI NA MSINGI NURUNJEMA TEGETA`;
    const signature = 'Sahihi'
    const signatory = "Ephrahim A. Simbeye";
    const cheo = "KAIMU KAMISHNA WA ELIMU";
    const paragraphs = [
                    `      Tafadhali rejea somo la barua hii.\n\n\n`,
                    `2.    Ninafurahi kukufahamisha kuwa kibali cha kutumia majengo kuanzisha shule ya Awali na Msingi <b>Nurunjema Tegeta</b> katika Mtaa wa <b>Nyuki</b>, Kata ya <b>Kunduchi</b>, Halmashauri ya <b>Manispaa ya Kinondoni</b>, Mkoa wa <b>Dar es Salaam</b>, kimetolewa. \n\n`,
                    `3.    Kibali hiki kimetolewa kwa mujibu wa <b>Sheria ya Elimu, Sura 353,</b> kwa masharti  kuwa utazingatia mongozo wa Wizara wa kuanzisha na kusajili shule. Unashauriwa kuendelea kuwasiliana na <b>Mhandisi wa Ujenzi wa Halmashauri ya Manispaa</b> kwa ushauri wa kitaalam. \n\n`,
                    `4.    Hakikisha jina la Mmiliki wa Shule litakalojazwa katika fomu <b>US.2</b> ya kuomba. Uthibitisho wa mwenye shule liwe lililoko kwenye Hatimiliki ya ardhi au mkataba wa mauziano. Aidha, Meneja atakayependekezwa katika fomu namba <b>US.3</b> awe mwalimu au kama siyo mwalim awe amepata mafunzo ya Vongozi wa Elimu katika Chuo kinachotambulia na Serikali. Awasilishe nakala ya cheti cha taaluma ya Ualimu na wasifu binafsi. \n\n`,
                    `5.    <b>Kibali hiki siyo ruhusa ya kuandikisha wanafunzi.</b>\n\n\n`,
                    `6.    Ninakutakia utekelezaji mwema.`,
    ];
    const body = ``;
    generateLetter(req , res , reference, createdAt, company , box , mkoa , title , paragraphs , signature , signatory , cheo);
  }
);





module.exports = maombiBaruaController;
