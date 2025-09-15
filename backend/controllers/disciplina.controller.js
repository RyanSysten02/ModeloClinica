const service = require('../services/disciplina.services');
const { ExceptionFactory } = require('../utils/exception');

const create = async (req, res) => {
  try {
    const data = req.body;
    const result = await service.create(data);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      message: ExceptionFactory({
        entity: 'Disciplina',
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
    console.error('Erro ao buscar alunos:', error);
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
        .json({ message: 'Erro ao buscar os dados da disciplina' });
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
    return res.status(200).json({ message: 'Disciplina deletada com sucesso' });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  deleteById,
};
