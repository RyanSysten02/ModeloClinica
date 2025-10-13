const aulaservices = require('../services/aulaservicesBKP');
const jwt = require('jsonwebtoken');

const createAula = async (req, res) => {
  const { id_turma, id_func_responsavel, start, end, desc, color, tipo } =
    req.body;
  const token = req.header('Authorization');

  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;
    const id_usuario_inclusao = req.user.id;

    const aulaId = await aulaservices.createAula(
      id_turma,
      id_func_responsavel,
      start,
      end,
      desc,
      color,
      tipo,
      id_usuario_inclusao
    );

    return res.status(201).json({ message: 'Aula criada com sucesso', aulaId });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const adiarAula = async (req, res) => {
  const { id } = req.params;
  const { start, end, motivo_adiamento } = req.body;

  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;
    const id_usuario_inclusao = req.user.id;

    const aulaOriginal = await aulaservices.getAulaById(id);
    if (!aulaOriginal) {
      return res.status(404).json({ message: 'Aula original não encontrada' });
    }

    const novaAula = await aulaservices.adiarAula(
      id,
      start,
      end,
      motivo_adiamento,
      id_usuario_inclusao
    );

    res.status(201).json({
      message: 'Aula adiada com sucesso',
      aula: novaAula,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAulas = async (req, res) => {
  try {
    const aulas = await aulaservices.getAulas();
    res.status(200).json(aulas);
  } catch (error) {
    console.error('Erro ao buscar aulas:', error);
    res.status(400).json({ message: error.message });
  }
};

const getAulaById = async (req, res) => {
  const { id } = req.params;
  try {
    const aula = await aulaservices.getAulaById(id);
    if (!aula) {
      return res.status(404).json({ message: 'Aula não encontrada' });
    }
    res.status(200).json(aula);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAula = async (req, res) => {
  const { id } = req.params;
  const { id_turma, id_func_responsavel, start, end, desc, color, tipo } =
    req.body;

  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;

    const aula = await aulaservices.getAulaById(id);
    if (!aula) {
      return res.status(404).json({ message: 'Aula não encontrada' });
    }

    await aulaservices.updateAula(
      id,
      id_turma,
      id_func_responsavel,
      start,
      end,
      desc,
      color,
      tipo
    );
    res.status(200).json({ message: 'Aula atualizada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const cancelarAula = async (req, res) => {
  const { id } = req.params;
  const { motivocancelamento } = req.body;

  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;

    const aula = await aulaservices.getAulaById(id);
    if (!aula) {
      return res
        .status(404)
        .json({ message: 'Não foi possível cancelar essa aula' });
    }

    await aulaservices.cancelarAula(id, motivocancelamento);
    res.status(200).json({ message: 'Aula cancelada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getHistoricoByTurmaId = async (req, res) => {
  const { id } = req.params; // ID da turma
  try {
    const historico = await aulaservices.getHistoricoAulasByTurmaId(id);
    if (!historico || historico.length === 0) {
      return res
        .status(404)
        .json({ message: 'Histórico não encontrado para esta turma.' });
    }
    res.status(200).json(historico);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAula = async (req, res) => {
  const { id } = req.params;

  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;

    const aula = await aulaservices.getAulaById(id);
    if (!aula) {
      return res.status(404).json({ message: 'Aula não encontrada' });
    }

    await aulaservices.deleteAula(id);
    res.status(200).json({ message: 'Aula deletada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createAula,
  getAulas,
  getAulaById,
  updateAula,
  cancelarAula,
  adiarAula,
  getHistoricoByTurmaId,
  deleteAula,
};
