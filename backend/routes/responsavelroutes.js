const express = require('express');
const router = express.Router();
const responsavelController = require('../controllers/responsavelController');


router.post('/cadastraresponsavel', responsavelController.createResponsavel);

router.get('/allresponsavel', responsavelController.getResponsavel);


router.get('/responsavel/:id', responsavelController.getResponsavelById);


router.put('/responsavel/:id', responsavelController.updateResponsavel);


router.delete('/responsavel/:id', responsavelController.deleteResponsavel);

module.exports = router;
