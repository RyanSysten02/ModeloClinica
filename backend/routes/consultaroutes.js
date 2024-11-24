const express = require('express');
const router = express.Router();
const consultasController = require('../controllers/consultacontroller');


router.post('/x', consultasController.createConsulta);

router.post('/adiar/:id', consultasController.adiarConsulta);

router.get('/tipo', consultasController.getConsultasTipo);

router.get('/allconsultas', consultasController.getConsultas);


router.get('/consultas/:id', consultasController.getConsultaById);


router.put('/consultas/:id', consultasController.updateConsulta);

router.put('/consultacancelamento/:id', consultasController.updateConsultaCancelamento);

router.delete('/consultas/:id', consultasController.deleteConsulta);

module.exports = router;
