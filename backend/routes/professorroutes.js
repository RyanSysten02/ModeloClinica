const express = require("express");
const router = express.Router();
const professorController = require("../controllers/professorController");

router.post("/cadastraprofessor", professorController.createProfessor);

router.get("/allprofessor", professorController.getProfessor);

router.get("/professor/:id", professorController.getProfessorById);

router.put("/professor/:id", professorController.updateProfessor);

router.delete("/professor/:id", professorController.deleteProfessor);

router.get('/professores', professorController.getAllProfessores);
module.exports = router;
