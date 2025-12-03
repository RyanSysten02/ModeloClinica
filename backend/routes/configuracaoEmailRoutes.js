const express = require('express');
const router = express.Router();
const configuracaoEmailController = require('../controllers/configuracaoEmailController');
// Adicione seu middleware de autenticação/autorização aqui se necessário

// GET /api/configuracao-email
router.get('/', configuracaoEmailController.getConfiguracao);

// PUT /api/configuracao-email
router.put('/', configuracaoEmailController.updateConfiguracao);

// POST /api/configuracao-email/testar
router.post('/testar', configuracaoEmailController.testarConfiguracao);

module.exports = router;