const matriculaService = require('../services/matriculaServices');
const jwt = require('jsonwebtoken');

const createMatricula = async (req, res) => {
  const { aluno_id, turma_id, responsavel_id, observacoes } = req.body;

  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;

    await matriculaService.createMatricula(
      aluno_id,
      turma_id,
      responsavel_id,
      observacoes
    );

    res.status(201).json({ message: 'Matrícula realizada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMatriculas = async (req, res) => {
  try {
    const matriculas = await matriculaService.getMatriculas();
    res.status(200).json(matriculas);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMatriculaById = async (req, res) => {
  const { id } = req.params;

  try {
    const matricula = await matriculaService.getMatriculaById(id);
    if (!matricula) {
      return res.status(404).json({ message: 'Matrícula não encontrada' });
    }
    res.status(200).json(matricula);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateMatricula = async (req, res) => {
  const { id } = req.params;
  const { turma_id, responsavel_id, status, observacoes } = req.body;

  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;

    await matriculaService.updateMatricula(
      id,
      turma_id,
      responsavel_id,
      status,
      observacoes
    );

    res.status(200).json({ message: 'Matrícula atualizada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMatricula = async (req, res) => {
  const { id } = req.params;

  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;

    await matriculaService.deleteMatricula(id);
    res.status(200).json({ message: 'Matrícula removida com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createMatricula,
  getMatriculas,
  getMatriculaById,
  updateMatricula,
  deleteMatricula
};
