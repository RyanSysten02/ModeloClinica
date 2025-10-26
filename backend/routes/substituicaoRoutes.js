const express = require('express');
const router = express.Router();
const substituicaoController = require('../controllers/substituicaoController');

// Rota para buscar as aulas agendadas com base em filtros
// Ex: GET http://localhost:3001/api/substituicoes/agendamentos?data=2025-10-07
router.get('/agendamentos', substituicaoController.getAgendamentos);

// Rota para realizar a substituição de um professor
// Ex: POST http://localhost:3001/api/substituicoes/substituir
router.post('/substituir', substituicaoController.substituirProfessor);

// Rota para buscar o histórico de substituições de uma aula específica
// Ex: GET http://localhost:3001/api/substituicoes/historico/5
router.get('/historico/:id_agendamento', substituicaoController.getHistorico);


module.exports = router;