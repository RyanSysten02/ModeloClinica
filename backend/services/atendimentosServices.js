const atendimentosModel = require('../models/atendimentosModel');

const adicionarAtendimento = async (
  nome,
  status,
  motivo,
  data,
  resolucao,
  operador,
  tipo
) => {
  const atendimento = await atendimentosModel.adicionarAtendimento(
    nome,
    status,
    motivo,
    data,
    resolucao,
    operador,
    tipo
  );
  return atendimento;
};

const listarAtendimentos = async () => {
  const atendimentos = await atendimentosModel.listarAtendimentos();
  return atendimentos;
};

const listarStatusAtendimentos = async () => {
  const [atendimentos] = await atendimentosModel.listarStatusAtendimentos();
  return atendimentos;
};

const editarAtendimentoCompleto = async (id, details) => {
  const atendimento = await atendimentosModel.editarAtendimentoCompleto(
    id,
    details
  );
  return atendimento;
};

const listarNomesAtendimentos = async (tipo) => {
  const [nomes] = await atendimentosModel.listarNomesAtendimentos(tipo);
  return nomes;
};

const editarAtendimento = async (id, details) => {
  const atendimento = await atendimentosModel.editarAtendimento(id, details);
  return atendimento;
};

const deletarAtendimento = async (id) => {
  return await atendimentosModel.deletarAtendimento(id);
};

const getAtendimentosByAlunoId = async (idAluno, tipo) => {
  const atendimentos = await atendimentosModel.getAtendimentosByAlunoId(
    idAluno,
    tipo
  );
  return atendimentos;
};

module.exports = {
  adicionarAtendimento,
  listarAtendimentos,
  listarNomesAtendimentos,
  editarAtendimento,
  deletarAtendimento,
  listarStatusAtendimentos,
  getAtendimentosByAlunoId,
  editarAtendimentoCompleto,
};
