const express = require('express');
const router = express.Router();
const controller = require('../controllers/disciplina.controller');
const auth = require('../middleware/auth');

router.get('/list', auth.verifyToken, controller.findAll);

router.get('/:id', auth.verifyToken, controller.findById);

router.post('/create', auth.verifyToken, controller.create);

router.put('/update/:id', auth.verifyToken, controller.update);

router.delete('/delete/:id', auth.verifyToken, controller.deleteById);

module.exports = router;
