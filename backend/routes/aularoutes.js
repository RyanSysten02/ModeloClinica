const express = require('express');
const router = express.Router();
const aulaController = require('../controllers/aulaController');

// GET /api/aulas/horarios
router.get('/horarios', aulaController.getHorarios);

// GET /api/aulas?dia=Segunda
router.get('/', aulaController.getAulasPorDia);

// POST /api/aulas/salvar-dia
router.post('/salvar-dia', aulaController.salvarDia);

module.exports = router;
