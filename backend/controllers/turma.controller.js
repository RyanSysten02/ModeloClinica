const service = require('../services/turma.services');
const { ExceptionFactory } = require('../utils/exception');

const create = async (req, res) => {
  try {
    const data = req.body;
    const result = await service.create(data);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      message: ExceptionFactory({
        entity: 'Turma',
        column: 'nome',
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
    console.error('Erro ao buscar as turmas:', error);
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
        .json({ message: 'Erro ao buscar os dados da turma' });
    }

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
    return res.status(200).json({ message: 'Turma deletada com sucesso' });
  } catch (error) {
    if (error?.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        message:
          'Turma não pode ser deletada, pois está sendo usada em matrícula.',
      });
    }

    return res.status(400).json({ message: error.message });
  }
};

const listStudents = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await service.listStudents(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const findByStatusAndYear = async (req, res) => {
  try {
    const { status, anoLetivo } = req.query;

    if (!status || !anoLetivo) {
      return res.status(400).json({
        message: 'Status e ano letivo são obrigatórios',
      });
    }

    const result = await service.findByStatusAndYear(status, anoLetivo);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const transferStudents = async (req, res) => {
  try {
    const { sourceTurmaId, targetTurmaId, studentIds } = req.body;

    if (
      !sourceTurmaId ||
      !targetTurmaId ||
      !studentIds ||
      !Array.isArray(studentIds)
    ) {
      return res.status(400).json({
        message:
          'sourceTurmaId, targetTurmaId e studentIds (array) são obrigatórios',
      });
    }

    if (studentIds.length === 0) {
      return res.status(400).json({
        message: 'É necessário selecionar pelo menos um aluno',
      });
    }

    if (sourceTurmaId === targetTurmaId) {
      return res.status(400).json({
        message: 'A turma de origem e destino não podem ser a mesma',
      });
    }

    const sourceTurma = await service.findById(sourceTurmaId);
    if (!sourceTurma || sourceTurma.status !== 'Concluída') {
      return res.status(400).json({
        message: 'A turma de origem deve estar com status "Concluída"',
      });
    }

    const targetTurma = await service.findById(targetTurmaId);
    if (!targetTurma || targetTurma.status !== 'Não iniciada') {
      return res.status(400).json({
        message: 'A turma de destino deve estar com status "Não iniciada"',
      });
    }

    const sourceYear = parseInt(sourceTurma.ano_letivo);
    const targetYear = parseInt(targetTurma.ano_letivo);

    if (targetYear !== sourceYear + 1) {
      return res.status(400).json({
        message: 'A turma de destino deve ser do ano letivo seguinte',
      });
    }

    const result = await service.transferStudents(
      sourceTurmaId,
      targetTurmaId,
      studentIds
    );

    return res.status(200).json({
      message: `Transferência realizada com sucesso! ${result.transferredStudents} alunos transferidos.`,
      data: result,
    });
  } catch (error) {
    console.error('Erro na transferência de alunos:', error);
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  deleteById,
  listStudents,
  findByStatusAndYear,
  transferStudents,
};
