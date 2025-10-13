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
      return res.status(400).json({ message: 'Parâmetro "dia" é obrigatório' });
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
    await aulaServices.replaceDia(dia, aulas);
    res.status(200).json({ message: 'Aulas salvas para o dia com sucesso' });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = {
  getHorarios,
  getAulasPorDia,
  salvarDia,
};
