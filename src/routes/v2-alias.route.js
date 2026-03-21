const express = require("express");

const router = express.Router();

const aliasMap = {
  // Setup / Mpangilio
  "v2-Waombaji": "Waombaji",
  "v2-Shule": "Shule",
  "v2-MajaladaYaShule": "MajaladaYaShule",
  "v2-AinaZaShule": "AinaZaShule",
  "v2-AinaYaMalazi": "AinaYaMalazi",
  "v2-ViwangoAinaZaShule": "ViwangoAinaZaShule",
  "v2-ViwangoMiundombinu": "ViwangoMiundombinu",
  "v2-Roles": "Roles",
  "v2-Permissions": "Permissions",
  "v2-Modules": "Modules",
  "v2-Watumiaji": "Watumiaji",
  "v2-Zoni": "Zoni",
  "v2-Mikoa": "Mikoa",
  "v2-Halmashauri": "Halmashauri",
  "v2-Kata": "Kata",
  "v2-Mitaa": "Mitaa",
  "v2-Ngazi": "Ngazi",
  "v2-Uongozi": "Uongozi",
  "v2-Vyeo": "Vyeo",
  "v2-AinaZaMaombi": "AinaZaMaombi",
  "v2-Masomo": "Masomo",
  "v2-MasomoYaMichepuo": "MasomoYaMichepuo",
  "v2-Viambatisho": "Viambatisho",
  "v2-Malipo": "Malipo",
  "v2-Tahasusi": "Tahasusi",
  "v2-Michepuo": "Michepuo",
  "v2-Algorithm": "Algorithm",
  "v2-FileNumberMappings": "FileNumberMappings",
  "v2-Workflow": "Workflow",
  "v2-AinaZaHatua": "AinaZaHatua",
  "v2-SystemLogs": "SystemLogs",
  "v2-SystemConfigurations": "SystemConfigurations",

  // Reports / Ripoti
  "v2-RipotiKuanzisha": "RipotiKuanzisha",
  "v2-RipotiWamiliki": "RipotiWamiliki",
  "v2-RipotiMeneja": "RipotiMeneja",
  "v2-RipotiZilizosajiliwa": "RipotiZilizosajiliwa",
  "v2-RipotiUsajiliAnalytics": "RipotiUsajiliAnalytics",
  "v2-RipotiKuongezaMikondo": "RipotiKuongezaMikondo",
  "v2-RipotiKuhamishaShule": "RipotiKuhamishaShule",
  "v2-RipotiKubadiliUsajili": "RipotiKubadiliUsajili",
  "v2-RipotiKubadiliUmiliki": "RipotiKubadiliUmiliki",
  "v2-RipotiKubadiliMeneja": "RipotiKubadiliMeneja",
  "v2-RipotiKubadiliJina": "RipotiKubadiliJina",
  "v2-RipotiKufutaShule": "RipotiKufutaShule",
  "v2-RipotiKuongezaTahasusi": "RipotiKuongezaTahasusi",
  "v2-RipotiKuongezaDahalia": "RipotiKuongezaDahalia",
  "v2-RipotiKuongezaBweni": "RipotiKuongezaBweni",

  // Notifications
  "v2-Notifications": "Dashboard",
};

router.get("/:alias", (req, res, next) => {
  const { alias } = req.params;
  const target = aliasMap[alias];
  if (!target) return next();

  const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  return res.redirect(`/${target}${query}`);
});

module.exports = router;
