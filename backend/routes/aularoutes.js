const express = require('express');
const router = express.Router();
const AulaController = require('../controllers/aulaController');


router.post('/nova', AulaController.createAula);

router.post('/adiar/:id', AulaController.adiarAula);

//router.get('/tipo', AulaController.getAulasTipo);

router.get('/listar', AulaController.getAulas);

router.get('/historico/:id', AulaController.getHistoricoByTurmaId);

router.get('/:id', AulaController.getAulaById);

router.put('/atualizar/:id', AulaController.updateAula);

router.delete("/aula/:id", AulaController.deleteAula);

router.put('/cancelar/:id', AulaController.cancelarAula);

module.exports = router;
