const nodemailer = require('nodemailer');
const configuracaoEmailModel = require('../models/configuracaoEmailModel');
const frequenciaModel = require('../models/frequenciaModel');

// Função auxiliar para buscar detalhes (garanta que ela existe no seu frequenciaModel)
async function getDetalhesFaltasParaEmail(frequenciaIds) {
  // Deve buscar: frequencia_id, aluno_id, aluno_nome, responsavel_nome,
  // responsavel_email, disciplina_nome, data_aula
  return await frequenciaModel.getDetalhesFaltasParaEmail(frequenciaIds);
}

// --- FUNÇÃO DE ENVIO SEQUENCIAL (LIMPA) ---
const enviarEmailsNotificacao = async (frequenciaIds) => {
  if (!frequenciaIds || frequenciaIds.length === 0) {
    throw new Error("IDs de frequência vazios.");
  }

  // 1. Buscar Configuração
  const config = await configuracaoEmailModel.getConfiguracao();
  if (!config?.smtp_host || !config?.smtp_user) {
    throw new Error("Configuração de e-mail inválida.");
  }

  // 2. Criar Transporter
  let transporter;
  try {
    transporter = nodemailer.createTransport({
        host: config.smtp_host, port: config.smtp_port, secure: config.smtp_secure,
        auth: { user: config.smtp_user, pass: config.smtp_pass },
        tls: { rejectUnauthorized: false } // Para ambientes de teste/desenvolvimento
    });
    // Verifica a conexão uma vez no início
    await transporter.verify();
  } catch (error) {
    console.error("Erro ao criar ou verificar transporter SMTP:", error);
    // Lança um erro mais específico para o frontend
    throw new Error(`Falha ao conectar ao servidor SMTP: ${error.message}. Verifique as configurações.`);
  }

  // 3. Buscar Detalhes de todas as faltas
  const detalhesFaltasIndividuais = await getDetalhesFaltasParaEmail(frequenciaIds);
  if (!detalhesFaltasIndividuais || detalhesFaltasIndividuais.length === 0) {
     // Não é um erro fatal, apenas não há o que enviar
     return { sucesso: [], falha: [] };
  }

  // --- 4. AGRUPAR FALTAS POR ALUNO E DIA ---
  const gruposParaEnviar = {};
  detalhesFaltasIndividuais.forEach(falta => {
    // Lógica robusta para obter YYYY-MM-DD
    let dataKey;
     if (typeof falta.data_aula === 'string' && /^\d{4}-\d{2}-\d{2}/.test(falta.data_aula)) {
        dataKey = falta.data_aula.substring(0, 10);
    } else if (falta.data_aula instanceof Date && !isNaN(falta.data_aula)) {
        const year = falta.data_aula.getUTCFullYear();
        const month = String(falta.data_aula.getUTCMonth() + 1).padStart(2, '0');
        const day = String(falta.data_aula.getUTCDate()).padStart(2, '0');
        dataKey = `${year}-${month}-${day}`;
    } else {
        // Loga um aviso no servidor, mas continua o processo para outras faltas
        console.warn(`Data inválida ou formato inesperado ignorada para frequencia_id ${falta.frequencia_id}:`, falta.data_aula);
        return; // Pula esta falta
    }

    const key = `${falta.aluno_id}-${dataKey}`;
    if (!gruposParaEnviar[key]) {
      gruposParaEnviar[key] = {
        aluno_id: falta.aluno_id, aluno_nome: falta.aluno_nome, data_aula: dataKey,
        responsavel_nome: falta.responsavel_nome, responsavel_email: falta.responsavel_email,
        disciplinas: new Set(), frequencia_ids_grupo: [],
      };
    }
    // Adiciona disciplina (se houver) e ID da frequência ao grupo
    if(falta.disciplina_nome) { gruposParaEnviar[key].disciplinas.add(falta.disciplina_nome); }
    gruposParaEnviar[key].frequencia_ids_grupo.push(falta.frequencia_id);
  });

  // --- 5. ENVIAR E-MAILS SEQUENCIALMENTE ---
  const resultadosFinais = { sucesso: [], falha: [] };
  const gruposArray = Object.values(gruposParaEnviar);

  for (const grupo of gruposArray) {
    // Pula se não houver email cadastrado
    if (!grupo.responsavel_email) {
      grupo.frequencia_ids_grupo.forEach(id => {
        resultadosFinais.falha.push({ id: id, aluno: grupo.aluno_nome, erro: "Responsável sem e-mail cadastrado." });
      });
      continue; // Próximo grupo
    }

    // Prepara dados do e-mail
    const disciplinasTexto = grupo.disciplinas.size > 0 ? Array.from(grupo.disciplinas).join(', ') : 'N/A';
    const dataFormatada = new Date(grupo.data_aula + 'T00:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    const assunto = `Notificação Ausência - ${grupo.aluno_nome} - ${dataFormatada}`;
    const corpoTexto = `Prezado(a) ${grupo.responsavel_nome || 'Responsável'},\n\nInformamos que o(a) aluno(a) ${grupo.aluno_nome} faltou à escola no dia ${dataFormatada} e ficou com falta nas disciplinas de ${disciplinasTexto}.\n\nCaso não esteja Ciente,\nPor favor, entre em contato com a escola.\n\nAtenciosamente,\n${config.sender_name}`;
    const corpoHtml = `<p>Prezado(a) ${grupo.responsavel_nome || 'Responsável'},</p><p>Informamos que o(a) aluno(a) <strong>${grupo.aluno_nome}</strong> faltou à escola no dia <strong>${dataFormatada}</strong> e ficou com falta nas disciplinas de <strong>${disciplinasTexto}</strong>.</p><p>Caso não esteja Ciente,<br/>Por favor, entre em contato com a escola.</p><p>Atenciosamente,<br/><strong>${config.sender_name}</strong></p>`;

    try {
      // Envia o e-mail para o grupo atual
      await transporter.sendMail({
        from: `"${config.sender_name}" <${config.sender_email}>`,
        to: grupo.responsavel_email,
        subject: assunto, text: corpoTexto, html: corpoHtml,
      });
      // Marca todos os IDs do grupo como sucesso
      grupo.frequencia_ids_grupo.forEach(id => {
        resultadosFinais.sucesso.push({ id: id, aluno: grupo.aluno_nome });
      });
    } catch (error) {
      console.error(`Falha ao enviar e-mail para ${grupo.responsavel_email} (Aluno ${grupo.aluno_nome}):`, error);
      // Marca todos os IDs do grupo como falha
      grupo.frequencia_ids_grupo.forEach(id => {
        resultadosFinais.falha.push({ id: id, aluno: grupo.aluno_nome, erro: error.message });
      });
    }
  } // Fim do loop de grupos

  return resultadosFinais; // Retorna o formato { sucesso: [], falha: [] } com IDs individuais
};

module.exports = {
  enviarEmailsNotificacao,
};