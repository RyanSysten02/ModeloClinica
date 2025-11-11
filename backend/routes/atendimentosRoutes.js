const express = require('express');
const router = express.Router();
const atendimentosController = require('../controllers/atendimentosController');

router.get('/listar', atendimentosController.listarAtendimentos);

router.get('/status/listar', atendimentosController.listarStatusAtendimentos);

router.get('/listar-nomes', atendimentosController.listarNomesAtendimentos);

router.post('/adicionar', atendimentosController.adicionarAtendimento);

router.put('/:id/editar', atendimentosController.editarAtendimento);

router.delete('/:id/excluir', atendimentosController.deletarAtendimento);

router.get('/:id', atendimentosController.getAtendimentosByAlunoId);

module.exports = router;
