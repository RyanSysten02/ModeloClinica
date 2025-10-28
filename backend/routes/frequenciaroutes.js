const express = require('express');
const router = express.Router();
const frequenciaController = require('../controllers/frequenciaController');

// Criar nova frequência
router.post('/cadastrafrequencia', frequenciaController.createBulkFrequencia);

// Buscar todas as frequências
router.get('/allfrequencia', frequenciaController.getFrequencias);

// Buscar frequência por ID
router.get('/frequencia/:id', frequenciaController.getFrequenciaById);

// Atualizar frequência
router.put('/frequencia/:id', frequenciaController.updateFrequencia);

// Deletar frequência
router.delete('/excluir', frequenciaController.deleteBulkFrequencia);

// Buscar frequências de uma matrícula específica (ex: histórico do aluno)
router.get('/frequencias/matricula/:matricula_id', frequenciaController.getFrequenciasPorMatricula);

router.get('/agrupada', frequenciaController.getFrequenciasAgrupadas);

router.get('/detalhada', frequenciaController.getFrequenciaDetalhadaPorAula);

router.put('/atualizar', frequenciaController.updateBulkFrequencia);

router.get('/ausentes', frequenciaController.getAlunosAusentes);

router.put('/notificacao', frequenciaController.updateStatusNotificacao);

router.put('/notificacao/append', frequenciaController.appendStatusNotificacao);

module.exports = router;
