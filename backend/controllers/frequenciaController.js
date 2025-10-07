const frequenciaServices = require('../services/frequenciaservices');
const jwt = require('jsonwebtoken');

const createFrequencia = async (req, res) => {
  const { matricula_id, professor_id, presente, data_aula } = req.body;
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;

    await frequenciaServices.createFrequencia(
      matricula_id,
      professor_id,
      presente,
      data_aula,
      req.user.id // cod_usuario_inclusao
    );

    res.status(201).json({ message: 'Frequência registrada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createBulkFrequencia = async (req, res) => {
  // 1. Recebemos o ARRAY de frequências do corpo da requisição
  const frequenciasArray = req.body;
  const token = req.header('Authorization');

  // 2. Validamos o payload e o token
  if (!Array.isArray(frequenciasArray) || frequenciasArray.length === 0) {
    return res.status(400).json({ message: 'Payload inválido. É esperado um array de registros.' });
  }
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    // 3. Verificamos o token UMA VEZ para toda a operação
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    const cod_usuario_inclusao = decoded.id;

    // 4. Passamos o ARRAY INTEIRO e o ID do usuário para o serviço
    await frequenciaServices.createBulkFrequencia(frequenciasArray, cod_usuario_inclusao);

    res.status(201).json({ message: 'Frequências registradas com sucesso' });
  } catch (error) {
    // Adicione um log para ver o erro detalhado no console do servidor
    console.error("ERRO AO CADASTRAR FREQUÊNCIAS:", error); 
   if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      // Retornamos um status 409 Conflict com a mensagem amigável
      return res.status(409).json({ message: 'A frequência para esta turma, data e período já foi registrada.Caso precise corrigir, vá para edição de frequencias' });
    }

    // Para qualquer outro tipo de erro, mantemos a resposta genérica
    res.status(400).json({ message: error.message || 'Erro ao registrar frequência.' });
  }
};

const getFrequencias = async (req, res) => {
  try {
    const frequencias = await frequenciaServices.getFrequencias();
    res.status(200).json(frequencias);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFrequenciaById = async (req, res) => {
  const { id } = req.params;
  try {
    const frequencia = await frequenciaServices.getFrequenciaById(id);
    if (!frequencia) {
      return res.status(404).json({ message: 'Frequência não encontrada' });
    }
    res.status(200).json(frequencia);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFrequenciasAgrupadas = async (req, res) => {
  try {
    // Pegamos os filtros dos query parameters da URL
    const { turma_id, professor_id, periodo } = req.query;
    if (!turma_id || !professor_id || !periodo) {
      return res.status(400).json({ message: "Todos os filtros (turma, professor, período) são obrigatórios." });
    }

    const frequencias = await frequenciaServices.getFrequenciasAgrupadas(turma_id, professor_id, periodo);
    res.status(200).json(frequencias);
  } catch (error) {
    console.error("Erro ao buscar frequências agrupadas:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateFrequencia = async (req, res) => {
  const { id } = req.params;
  const { matricula_id, professor_id, presente, data_aula } = req.body;
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;

    const frequenciaExistente = await frequenciaServices.getFrequenciaById(id);
    if (!frequenciaExistente) {
      return res.status(404).json({ message: 'Frequência não encontrada' });
    }

    await frequenciaServices.updateFrequencia(
      id,
      matricula_id,
      professor_id,
      presente,
      data_aula,
      req.user.id // cod_usuario_alteracao
    );

    res.status(200).json({ message: 'Frequência atualizada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFrequencia = async (req, res) => {
  const { id } = req.params;
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    req.user = decoded;

    const frequencia = await frequenciaServices.getFrequenciaById(id);
    if (!frequencia) {
      return res.status(404).json({ message: 'Frequência não encontrada' });
    }

    await frequenciaServices.deleteFrequencia(id);
    res.status(200).json({ message: 'Frequência deletada com sucesso' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFrequenciasPorMatricula = async (req, res) => {
  const { matricula_id } = req.params;
  try {
    const frequencias = await frequenciaServices.getFrequenciasPorMatricula(matricula_id);
    res.status(200).json(frequencias);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFrequenciaDetalhadaPorAula = async (req, res) => {
  try {
    const { turma_id, professor_id, data_aula, periodo } = req.query;
    if (!turma_id || !professor_id || !data_aula || !periodo) {
      return res.status(400).json({ message: "Todos os parâmetros (turma, professor, data, período) são obrigatórios." });
    }

    const detalhes = await frequenciaServices.getFrequenciaDetalhadaPorAula(turma_id, professor_id, data_aula, periodo);
    res.status(200).json(detalhes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBulkFrequencia = async (req, res) => {
  const frequenciasArray = req.body;
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  try {
    const tokenLimpo = token.split(' ')[1];
    const decoded = jwt.verify(tokenLimpo, process.env.JWT_SECRET);
    const cod_usuario_alteracao = decoded.id; // Usuário que está alterando

    // Chama o novo serviço de ATUALIZAÇÃO
    await frequenciaServices.updateBulkFrequencia(frequenciasArray, cod_usuario_alteracao);

    res.status(200).json({ message: 'Frequências atualizadas com sucesso' });
  } catch (error) {
    console.error("ERRO AO ATUALIZAR FREQUÊNCIAS:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createFrequencia,
  createBulkFrequencia,
  updateBulkFrequencia,
  getFrequencias,
  getFrequenciaById,
  updateFrequencia,
  deleteFrequencia,
  getFrequenciasPorMatricula,
  getFrequenciasAgrupadas,
  getFrequenciaDetalhadaPorAula,
};
