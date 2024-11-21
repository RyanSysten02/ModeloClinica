const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');


router.post('/cadastrafuncionario', funcionarioController.createFuncionario);

router.get('/allfuncionario', funcionarioController.getFuncionario);


router.get('/funcionario/:id', funcionarioController.getFuncionarioById);


router.put('/funcionario/:id', funcionarioController.updateFuncionario);


router.delete('/funcionario/:id', funcionarioController.deleteFuncionario);

module.exports = router;
