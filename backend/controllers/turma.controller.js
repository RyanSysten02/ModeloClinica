const service = require('../services/turma.services');

const create = async (req, res) => {
  try {
    const data = req.body;
    const result = await service.create(data);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
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

module.exports = {
  create,
  findAll,
  findById,
  update,
  deleteById,
  listStudents,
};
