const express = require('express');
const router = express.Router();
const notificacaoEmailController = require('../controllers/notificacaoEmailController');
// Adicione seu middleware de autenticação

// POST /api/notificacao/email-em-massa
router.post('/email-em-massa', notificacaoEmailController.enviarEmailsEmMassa);

module.exports = router;