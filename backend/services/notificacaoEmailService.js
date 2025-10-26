const nodemailer = require('nodemailer');
const configuracaoEmailModel = require('../models/configuracaoEmailModel');
const frequenciaModel = require('../models/frequenciaModel'); // Assumindo que você tem um model para buscar dados da frequência

// Função para buscar os detalhes das faltas (precisa ser criada no frequenciaModel)
// Ela deve retornar um array de objetos com pelo menos:
// responsavel_email, responsavel_nome, aluno_nome, disciplina_nome, data_aula
async function getDetalhesFaltasParaEmail(frequenciaIds) {
  return await frequenciaModel.getDetalhesFaltasParaEmail(frequenciaIds); 
}

// Função principal de envio em massa
const enviarEmailsNotificacao = async (frequenciaIds) => {
  if (!frequenciaIds || frequenciaIds.length === 0) {
    throw new Error("Nenhuma frequência selecionada.");
  }

  // 1. Buscar a configuração do email
  const config = await configuracaoEmailModel.getConfiguracao();
  if (!config || !config.smtp_host || !config.smtp_user) {
    throw new Error("Configuração de e-mail não encontrada ou incompleta.");
  }

  // 2. Criar o transporter do Nodemailer
  let transporter;
  try {
    transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_secure,
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass,
      },
      tls: { rejectUnauthorized: false }
    });
    // Verificar conexão (opcional, mas bom para debug)
    await transporter.verify(); 
  } catch (error) {
    console.error("Erro ao criar ou verificar transporter:", error);
    throw new Error("Falha ao conectar ao servidor SMTP. Verifique as configurações.");
  }


  // 3. Buscar os detalhes das faltas
  const detalhesFaltas = await getDetalhesFaltasParaEmail(frequenciaIds);
  if (!detalhesFaltas || detalhesFaltas.length === 0) {
    throw new Error("Não foi possível encontrar detalhes para as frequências selecionadas.");
  }

  // 4. Enviar os e-mails um por um (ou em paralelo com Promise.all)
  const resultadosEnvio = { sucesso: [], falha: [] };

  for (const falta of detalhesFaltas) {
    if (!falta.responsavel_email) {
      resultadosEnvio.falha.push({ id: falta.frequencia_id, aluno: falta.aluno_nome, erro: "Responsável sem e-mail cadastrado." });
      continue; // Pula para o próximo
    }

    let dataAulaObj;
    // Verifica se já é um objeto Date
    if (falta.data_aula instanceof Date) {
        dataAulaObj = falta.data_aula;
    } 
    // Verifica se é uma string no formato YYYY-MM-DD (ou similar que o Date entenda)
    else if (typeof falta.data_aula === 'string' && falta.data_aula.length >= 10) {
        // Força interpretação como UTC para evitar problemas de fuso horário
        dataAulaObj = new Date(falta.data_aula.substring(0, 10) + 'T00:00:00Z'); 
    } 
    // Se não for nenhum dos anteriores, a data é inválida
    else {
        dataAulaObj = null; // Ou new Date(NaN) que resulta em "Invalid Date"
        console.warn(`Formato de data inválido recebido para frequencia_id ${falta.frequencia_id}:`, falta.data_aula); // Log para debug
    }

    // Tenta formatar SÓ SE a data for válida
    const dataFormatada = dataAulaObj && !isNaN(dataAulaObj) 
        ? dataAulaObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) // Adiciona timeZone UTC para consistência
        : 'Data Indisponível'; // Fallback mais amigável
    const assunto = `Notificação de Ausência - Aluno(a) ${falta.aluno_nome}`;
    const corpoTexto = `Prezado(a) ${falta.responsavel_nome},\n\nInformamos que o(a) aluno(a) ${falta.aluno_nome} faltou à aula de ${falta.disciplina_nome} na data de ${dataFormatada}.\n\nPor favor, entre em contato com a escola para mais informações.\n\nAtenciosamente,\n${config.sender_name}`;
    const corpoHtml = `<p>Prezado(a) ${falta.responsavel_nome},</p><p>Informamos que o(a) aluno(a) <strong>${falta.aluno_nome}</strong> faltou à aula de <strong>${falta.disciplina_nome}</strong> na data de <strong>${dataFormatada}</strong>.</p><p>Por favor, entre em contato com a escola para mais informações.</p><p>Atenciosamente,<br/><strong>${config.sender_name}</strong></p>`;

    try {
      await transporter.sendMail({
        from: `"${config.sender_name}" <${config.sender_email}>`,
        to: falta.responsavel_email,
        subject: assunto,
        text: corpoTexto,
        html: corpoHtml,
      });
      resultadosEnvio.sucesso.push({ id: falta.frequencia_id, aluno: falta.aluno_nome });
    } catch (error) {
      console.error(`Erro ao enviar email para ${falta.responsavel_email}:`, error);
      resultadosEnvio.falha.push({ id: falta.frequencia_id, aluno: falta.aluno_nome, erro: error.message });
    }
  }

  return resultadosEnvio;
};

module.exports = {
  enviarEmailsNotificacao,
};

