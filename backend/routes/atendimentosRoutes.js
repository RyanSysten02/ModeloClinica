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

router.get('/relatorios/gerar', atendimentosController.gerarRelatorio);

router.get(
  '/relatorios/turmas/gerar',
  atendimentosController.gerarRelatorioTurmas
);

router.get('/turmas/listar', atendimentosController.listarTurmas);

router.get('/turmas/anos-letivos', atendimentosController.listarAnosLetivos);

router.get('/turmas/status', atendimentosController.listarStatusTurma);

router.get('/turmas/status', atendimentosController.listarStatusTurma);

router.get('/listar/usuarios', atendimentosController.listarUsuarios);

module.exports = router;
