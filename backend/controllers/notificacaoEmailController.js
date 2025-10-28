const notificacaoEmailService = require('../services/notificacaoEmailService');
const frequenciaService = require('../services/frequenciaservices'); // Para atualizar o status

// POST /api/notificacao/email-em-massa
const enviarEmailsEmMassa = async (req, res) => {
  const { frequencia_ids } = req.body;

  if (!frequencia_ids || !Array.isArray(frequencia_ids) || frequencia_ids.length === 0) {
    return res.status(400).json({ message: "Lista de IDs de frequência inválida ou vazia." });
  }

  try {
    const resultados = await notificacaoEmailService.enviarEmailsNotificacao(frequencia_ids);

    // Atualiza o status no banco APENAS para os que tiveram sucesso
    const idsSucesso = resultados.sucesso.map(item => item.id);
    if (idsSucesso.length > 0) {
      await frequenciaService.appendStatusNotificacao(idsSucesso, 'notificado_email');
    }

    // Monta uma mensagem de resposta
    let mensagemResposta = `${resultados.sucesso.length} e-mail(s) enviado(s) com sucesso.`;
    if (resultados.falha.length > 0) {
      mensagemResposta += ` ${resultados.falha.length} falha(s).`;
      // Opcional: Logar ou retornar detalhes das falhas
      console.warn("Falhas no envio de e-mail:", resultados.falha); 
    }

    res.status(200).json({ 
        message: mensagemResposta, 
        sucesso: resultados.sucesso, // Opcional: retornar detalhes
        falha: resultados.falha     // Opcional: retornar detalhes
    });

  } catch (error) {
    console.error("Erro no envio de e-mails em massa:", error);
    res.status(500).json({ message: error.message || "Erro interno ao enviar e-mails." });
  }
};

module.exports = {
  enviarEmailsEmMassa,
};