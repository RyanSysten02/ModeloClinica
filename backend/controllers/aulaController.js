const aulaServices = require('../services/aulaServices');
const jwt = require('jsonwebtoken');

const authGuard = (req) => {
  const token = req.header('Authorization');
  if (!token) throw new Error('Token não fornecido');
  const tokenLimpo = token.split(' ')[1];
  const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
  req.user = decoded;
};

const getHorarios = async (req, res) => {
  try {
    authGuard(req);
    const horarios = await aulaServices.getHorarios();
    res.status(200).json(horarios);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const getAulasPorDia = async (req, res) => {
  const { dia } = req.query;
  try {
    authGuard(req);
    if (!dia)
      return res
        .status(400)
        .json({ message: 'Parâmetro "dia" é obrigatório' });

    const aulas = await aulaServices.getAulasByDia(dia);
    res.status(200).json(aulas);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const salvarDia = async (req, res) => {
  const { dia, aulas } = req.body;
  try {
    authGuard(req);
    if (!dia || !Array.isArray(aulas)) {
      return res
        .status(400)
        .json({ message: 'Payload inválido: informe dia e aulas[]' });
    }

    const userId = req.user?.id || null;
    await aulaServices.replaceDia(dia, aulas, userId);

    res
      .status(200)
      .json({ message: 'Aulas salvas para o dia com sucesso' });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

/**
 * Histórico com filtro opcional por data:
 * GET /api/aulas/historico?dataInicio=2025-01-01&dataFim=2025-12-31
 */
const getHistorico = async (req, res) => {
  const { dataInicio, dataFim } = req.query;
  try {
    authGuard(req);

    const historico = await aulaServices.getHistorico(dataInicio, dataFim);
    res.status(200).json(historico);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const getHistoricoSnapshot = async (req, res) => {
  const { id } = req.params;
  try {
    authGuard(req);

    const item = await aulaServices.getHistoricoSnapshot(id);
    if (!item) {
      return res.status(404).json({ message: 'Histórico não encontrado' });
    }

    let snapshotParsed = [];
    try {
      snapshotParsed =
        typeof item.snapshot === 'string'
          ? JSON.parse(item.snapshot)
          : item.snapshot;
    } catch {
      snapshotParsed = [];
    }

    res.status(200).json({
      id: item.id,
      dia_semana: item.dia_semana, // dia que originou o snapshot
      dh_versao: item.dh_versao,
      id_usuario: item.id_usuario,
      snapshot: snapshotParsed, // AGORA contém TODA a semana
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = {
  getHorarios,
  getAulasPorDia,
  salvarDia,
  getHistorico,
  getHistoricoSnapshot,
};
