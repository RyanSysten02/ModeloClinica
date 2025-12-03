const express = require('express');
const router = express.Router();
const aulaController = require('../controllers/aulaController');

router.get('/horarios', aulaController.getHorarios);
router.get('/', aulaController.getAulasPorDia);
router.post('/salvar-dia', aulaController.salvarDia);

// NOVO: histórico
router.get('/historico', aulaController.getHistorico);
router.get('/historico/:id', aulaController.getHistoricoSnapshot);

module.exports = router;
