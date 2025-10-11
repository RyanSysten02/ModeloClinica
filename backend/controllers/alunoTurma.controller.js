const service = require('../services/alunoTurma.services');
const { ExceptionFactory } = require('../utils/exception');

const create = async (req, res) => {
  try {
    const data = req.body;
    const result = await service.create(data);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      message: ExceptionFactory({
        entity: 'AlunoTurma',
        column: 'matricula_id',
        code: error?.code,
        sqlMessage: error?.message ?? error?.sqlMessage,
      }),
    });
  }
};

const findAll = async (_, res) => {
  try {
    const result = await service.findAll();

    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao buscar as alocações aluno-turma:', error);
    return res.status(400).json({ message: error.message });
  }
};

const findById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await service.findById(id);

    if (!result) {
      return res
        .status(404)
        .json({ message: 'Erro ao buscar os dados da alocação aluno-turma' });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const findByMatriculaId = async (req, res) => {
  try {
    const { matriculaId } = req.params;
    const result = await service.findByMatriculaId(matriculaId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const findByTurmaId = async (req, res) => {
  try {
    const { turmaId } = req.params;
    const result = await service.findByTurmaId(turmaId);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await service.update(id, data);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    await service.deleteById(id);
    return res
      .status(200)
      .json({ message: 'Alocação aluno-turma deletada com sucesso' });
  } catch (error) {
    if (error?.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message:
          'Alocação aluno-turma não pode ser deletada, pois está sendo referenciada em outras tabelas.',
      });
    }

    return res.status(400).json({ message: error.message });
  }
};

const deleteByMatriculaId = async (req, res) => {
  try {
    const { matriculaId } = req.params;

    await service.deleteByMatriculaId(matriculaId);
    return res
      .status(200)
      .json({ message: 'Alocações aluno-turma deletadas com sucesso' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const listStudentsByTurma = async (req, res) => {
  try {
    const { turmaId } = req.params;

    const result = await service.listStudentsByTurma(turmaId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const listTurmasByMatricula = async (req, res) => {
  try {
    const { matriculaId } = req.params;

    const result = await service.listTurmasByMatricula(matriculaId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  create,
  findAll,
  findById,
  findByMatriculaId,
  findByTurmaId,
  update,
  deleteById,
  deleteByMatriculaId,
  listStudentsByTurma,
  listTurmasByMatricula,
};
