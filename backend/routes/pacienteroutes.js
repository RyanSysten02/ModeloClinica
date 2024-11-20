const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');


router.post('/cadastrapaciente', pacienteController.createPaciente);

router.get('/allpaciente', pacienteController.getPaciente);


router.get('/paciente/:id', pacienteController.getPacienteById);


router.put('/paciente/:id', pacienteController.updatePaciente);


router.delete('/paciente/:id', pacienteController.deletePaciente);

module.exports = router;
