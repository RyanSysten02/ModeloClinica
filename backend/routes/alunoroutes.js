const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');


router.post('/cadastraaluno', alunoController.createAluno);

router.get('/allaluno', alunoController.getAluno);


router.get('/aluno/:id', alunoController.getAlunoById);


router.put('/aluno/:id', alunoController.updateAluno);


router.delete('/aluno/:id', alunoController.deleteAluno);

router.get('/verificarcpf/:cpf', alunoController.verificarCpfExistente);

module.exports = router;
