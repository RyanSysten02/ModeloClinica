const express = require('express');
const router = express.Router();
const controller = require('../controllers/alunoTurma.controller');
const auth = require('../middleware/auth');

router.get('/list', auth.verifyToken, controller.findAll);

router.get('/:id', auth.verifyToken, controller.findById);

router.post('/create', auth.verifyToken, controller.create);

router.put('/update/:id', auth.verifyToken, controller.update);

router.delete('/delete/:id', auth.verifyToken, controller.deleteById);

router.get(
  '/matricula/:matriculaId',
  auth.verifyToken,
  controller.findByMatriculaId
);

router.get('/turma/:turmaId', auth.verifyToken, controller.findByTurmaId);

router.delete(
  '/matricula/:matriculaId',
  auth.verifyToken,
  controller.deleteByMatriculaId
);

router.get(
  '/turma/:turmaId/students',
  auth.verifyToken,
  controller.listStudentsByTurma
);

router.get(
  '/matricula/:matriculaId/turmas',
  auth.verifyToken,
  controller.listTurmasByMatricula
);

module.exports = router;
