const controller = require('../controllers/turma.controller');
const auth = require('../middleware/auth');
const express = require('express');

const router = express.Router();

router.get('/list', auth.verifyToken, controller.findAll);
router.get('/list/students/:id', auth.verifyToken, controller.listStudents);
router.get('/by-status-year', auth.verifyToken, controller.findByStatusAndYear);
router.get('/:id', auth.verifyToken, controller.findById);
router.post('/create', auth.verifyToken, controller.create);
router.put('/update/:id', auth.verifyToken, controller.update);
router.delete('/delete/:id', auth.verifyToken, controller.deleteById);
router.post(
  '/transfer-students',
  auth.verifyToken,
  controller.transferStudents
);

module.exports = router;
