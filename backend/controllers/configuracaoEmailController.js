const configuracaoEmailService = require('../services/configuracaoEmailService');
const nodemailer = require('nodemailer');

// GET /api/configuracao-email
const getConfiguracao = async (req, res) => {
  try {
    const config = await configuracaoEmailService.getConfiguracao();
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar configuração." });
  }
};

// PUT /api/configuracao-email
const updateConfiguracao = async (req, res) => {
  try {
    const config = req.body;
    await configuracaoEmailService.updateConfiguracao(config);
    res.status(200).json({ message: "Configuração atualizada com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar configuração." });
  }
};

// POST /api/configuracao-email/testar
const testarConfiguracao = async (req, res) => {
  // Recebe as configurações do corpo da requisição (para testar ANTES de salvar)
  const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_secure, sender_email } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: smtp_port,
      secure: smtp_secure, // true para 465, false para outras (TLS)
      auth: {
        user: smtp_user,
        pass: smtp_pass,
      },
      tls: {
        // Não falha em certificados auto-assinados (comum em testes)
        rejectUnauthorized: false
      }
    });

    // Verifica se o login e a conexão funcionam
    await transporter.verify();

    // Envia um e-mail de teste real para o próprio usuário
    await transporter.sendMail({
      from: `"${req.body.sender_name}" <${sender_email}>`,
      to: smtp_user, // Envia para o próprio usuário de SMTP
      subject: "E-mail de Teste - Sistema de Gestão Escolar",
      text: "Sua configuração de e-mail está funcionando corretamente!",
      html: "<b>Sua configuração de e-mail está funcionando corretamente!</b>",
    });

    res.status(200).json({ message: `Conexão bem-sucedida! E-mail de teste enviado para ${smtp_user}.` });

  } catch (error) {
    console.error("Erro no teste de e-mail:", error);
    res.status(500).json({ message: "Falha na conexão: " + error.message });
  }
};

module.exports = {
  getConfiguracao,
  updateConfiguracao,
  testarConfiguracao,
};