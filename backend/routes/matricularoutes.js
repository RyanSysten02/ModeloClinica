const express = require('express');
const router = express.Router();
const matriculaController = require('../controllers/matriculacontroller');

router.post('/cadastrarmatricula', matriculaController.createMatricula);

router.get('/allmatricula', matriculaController.getMatriculas);

router.get('/matricula/:id', matriculaController.getMatriculaById);

router.put('/matricula/:id', matriculaController.updateMatricula);

router.delete('/matricula/:id', matriculaController.deleteMatricula);

module.exports = router;
