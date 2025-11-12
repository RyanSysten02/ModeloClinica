const atendimentoServices = require('../services/atendimentosServices');
const jwt = require('jsonwebtoken');

const adicionarAtendimento = async (req, res) => {
  const { nome, status, motivo, data, resolucao, tipo } = req.body;
  console.log(nome, status, motivo, data, resolucao);

  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;
    const operador = req.user.id;

    await atendimentoServices.adicionarAtendimento(
      nome,
      status,
      motivo,
      data,
      resolucao,
      operador,
      tipo
    );
    res.status(201).json({ message: 'Aluno cadastrado com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const listarAtendimentos = async (req, res) => {
  try {
    const aluno = await atendimentoServices.listarAtendimentos();
    const alunoPlano = aluno[0] || [];
    res.status(200).json(alunoPlano);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(400).json({ message: error.message });
  }
};

const listarStatusAtendimentos = async (req, res) => {
  try {
    const listaStatusAtendimentos =
      await atendimentoServices.listarStatusAtendimentos();
    res.status(200).json(listaStatusAtendimentos);
  } catch ({ message, ...error }) {
    console.error('Erro ao buscar status de atendimento:', error);
    res.status(400).json({ message });
  }
};

const listarNomesAtendimentos = async (req, res) => {
  const { tipo } = req.query;
  try {
    const listarNomesAtendimentos =
      await atendimentoServices.listarNomesAtendimentos(tipo);
    res.status(200).json(listarNomesAtendimentos);
  } catch ({ message, ...error }) {
    console.error('Erro ao buscar status de atendimento:', error);
    res.status(400).json({ message });
  }
};

const editarAtendimento = async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.query;
  const token = req.header('Authorization');

  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    await atendimentoServices.editarAtendimento(id, tipo);
    res.status(200).json({ message: 'Editado com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletarAtendimento = async (req, res) => {
  const { id } = req.params;

  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    await atendimentoServices.deletarAtendimento(id);
    res.status(200).json({ message: 'Dados do aluno atualizados com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAtendimentosByAlunoId = async (req, res) => {
  const { id } = req.params; // ID do aluno
  const { tipo } = req.query;
  try {
    const atendimentos = await atendimentoServices.getAtendimentosByAlunoId(
      id,
      tipo
    );
    if (!atendimentos || atendimentos.length === 0) {
      return res
        .status(204)
        .json({ message: 'Nenhum atendimento encontrado para este aluno.' });
    }
    res.status(200).json(atendimentos);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  adicionarAtendimento,
  listarAtendimentos,
  listarNomesAtendimentos,
  editarAtendimento,
  deletarAtendimento,
  getAtendimentosByAlunoId,
  listarStatusAtendimentos,
};
