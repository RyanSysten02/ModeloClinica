const moment = require('moment');
const atendimentoServices = require('../services/atendimentosServices');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const adicionarAtendimento = async (req, res) => {
  const { nome, status, motivo, data, resolucao, tipo, id } = req.body;

  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  if (!nome || !status || !motivo || !data || !resolucao || !tipo) {
    return res
      .status(400)
      .json({ message: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;
    const operador = req.user.id;

    if (id) {
      await atendimentoServices.editarAtendimentoCompleto(id, {
        nome,
        status,
        motivo,
        data,
        resolucao,
        operador,
        tipo,
      });
    } else
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
  const { nome, dataInicio, dataFim, status } = req.query;
  try {
    const aluno = await atendimentoServices.listarAtendimentos();
    const alunoPlano = aluno[0] || [];
    let lista = alunoPlano;
    if (nome) {
      lista = lista.filter((at) =>
        at.nome?.toLowerCase().includes(nome.toLowerCase())
      );
    }

    if (status) {
      lista = lista.filter((at) => parseInt(at.status) === parseInt(status));
    }

    const start = dataInicio ? moment(dataInicio, 'YYYY-MM-DD', true) : null;
    const end = dataFim ? moment(dataFim, 'YYYY-MM-DD', true) : null;

    if (start && end && start.isValid() && end.isValid()) {
      lista = lista.filter((at) => {
        const d = moment(at?.data, 'DD/MM/YYYY', true);
        if (!d.isValid()) return false; // skip bad dates
        // "day" = compare by day only, "[]" = inclusive of endpoints
        return d.isBetween(start, end, 'day', '[]');
      });
    } else if (start && start.isValid()) {
      lista = lista.filter((at) => {
        const d = moment(at?.data, 'DD/MM/YYYY', true);
        return d.isValid() && d.isSameOrAfter(start, 'day');
      });
    } else if (end && end.isValid()) {
      lista = lista.filter((at) => {
        const d = moment(at?.data, 'DD/MM/YYYY', true);
        return d.isValid() && d.isSameOrBefore(end, 'day');
      });
    }

    res.status(200).json(lista);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(400).json({ message: error.message });
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
    res.status(200).json({ message: 'Atendimento excluído com sucesso.' });
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

const gerarRelatorio = async (req, res, next) => {
  try {
    const { dataInicio, dataFim, operador, responsavel } = req.query;
    const filePath = await atendimentoServices.listarAtendimentosRelatorio(
      dataInicio,
      dataFim,
      operador,
      responsavel
    );

    if (!filePath) {
      return res.status(500).json({ error: 'Erro ao gerar o relatório.' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo PDF não encontrado.' });
    }

    // Converter para caminho absoluto
    const absolutePath = path.resolve(filePath);

    // Configurar headers para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${path.basename(filePath)}"`
    );

    // Enviar arquivo usando sendFile
    return res.sendFile(absolutePath, (err) => {
      if (err) {
        console.error('Erro ao enviar PDF:', err);
        if (!res.headersSent) {
          return res.status(500).json({ error: 'Falha ao enviar o arquivo.' });
        }
      }
    });
  } catch (error) {
    console.error('Erro inesperado ao gerar relatório:', error);
    return res
      .status(500)
      .json({ error: 'Erro inesperado ao gerar relatório.' });
  }
};

const listarTurmas = async (req, res) => {
  try {
    const listarTurmas = await atendimentoServices.listarTurmas();
    res.status(200).json(listarTurmas);
  } catch ({ message, ...error }) {
    console.error('Erro ao buscar turmas:', error);
    res.status(400).json({ message });
  }
};

const listarAnosLetivos = async (req, res) => {
  try {
    const listarAnosLetivos = await atendimentoServices.listarAnosLetivos();
    res.status(200).json(listarAnosLetivos);
  } catch ({ message, ...error }) {
    console.error('Erro ao buscar anos letivos:', error);
    res.status(400).json({ message });
  }
};

const listarStatusTurma = async (req, res) => {
  try {
    const listarStatusTurma = await atendimentoServices.listarStatusTurma();
    res.status(200).json(listarStatusTurma);
  } catch ({ message, ...error }) {
    console.error('Erro ao buscar status de turma:', error);
    res.status(400).json({ message });
  }
};

const gerarRelatorioTurmas = async (req, res, next) => {
  try {
    const { turmas: turmasString, ano_letivo, status } = req.query;

    // Preparar filtros
    const filtros = {};

    const turmas = turmasString ? turmasString.split(',') : null;

    if (turmas && Array.isArray(turmas) && turmas.length > 0) {
      filtros.turmas = turmas;
    }

    if (ano_letivo) {
      filtros.ano_letivo = ano_letivo;
    }

    if (status) {
      filtros.status = status;
    }

    const filePath = await atendimentoServices.gerarRelatorioPDFTurmas(filtros);

    if (!filePath) {
      return res.status(500).json({ error: 'Erro ao gerar o relatório.' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo PDF não encontrado.' });
    }

    // Converter para caminho absoluto
    const absolutePath = path.resolve(filePath);

    // Configurar headers para PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${path.basename(filePath)}"`
    );

    // Enviar arquivo usando sendFile
    return res.sendFile(absolutePath, (err) => {
      if (err) {
        console.error('Erro ao enviar PDF:', err);
        if (!res.headersSent) {
          return res.status(500).json({ error: 'Falha ao enviar o arquivo.' });
        }
      }
    });
  } catch (error) {
    console.error('Erro inesperado ao gerar relatório de turmas:', error);
    return res
      .status(500)
      .json({ error: 'Erro inesperado ao gerar relatório.' });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const listarUsuarios = await atendimentoServices.listarUsuarios();
    res.status(200).json(listarUsuarios);
  } catch ({ message, ...error }) {
    console.error('Erro ao buscar usuarios:', error);
    res.status(400).json({ message });
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
  gerarRelatorio,
  gerarRelatorioTurmas,
  listarTurmas,
  listarAnosLetivos,
  listarStatusTurma,
  listarUsuarios,
};
