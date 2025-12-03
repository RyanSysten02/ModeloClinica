const atendimentosModel = require('../models/atendimentosModel');
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

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

const listarUsuarios = async () => {
  const [usuarios] = await atendimentosModel.listarUsuarios();

  console.log(usuarios);
  return usuarios;
};

const listarAtendimentosRelatorio = async (
  dataInicio,
  dataFim,
  operador,
  responsavel
) => {
  const atendimentos = await atendimentosModel.listarAtendimentosRelatorio(
    dataInicio,
    dataFim,
    operador,
    responsavel
  );

  console.log(atendimentos);

  const dir = 'public/relatorios/atendimentos';
  await fs.ensureDir(dir);
  const filePath = path.join(
    dir,
    `Relatorio-Atendimentos-${new Date().toISOString().split('T')[0]}.pdf`
  );

  const getStatusClass = (status) => {
    switch (parseInt(status)) {
      case 1:
        return 'success';
      case 2:
        return 'danger';
      case 3:
        return 'primary';
      case 4:
        return 'warning';
      case 5:
        return 'secondary';
      default:
        break;
    }
  };

  const escapeHtml = (text) => {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const dataGeracao = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const dataInicioFormatada =
    dataInicio?.split('-').reverse().join('/') || 'Não especificada';
  const dataFimFormatada =
    dataFim?.split('-').reverse().join('/') || 'Não especificada';
  const responsavelFormatado = responsavel || 'Todos';
  const operadorFormatado = operador
    ? (await listarUsuarios(operador))[0].nome
    : 'Todos';

  const linhasTabela = atendimentos
    .map((item) => {
      const statusClass = getStatusClass(item.status);

      return `
      <tr>
        <td class="id-cell">${escapeHtml(item.id)}</td>
        <td class="nome-cell">${escapeHtml(item.nome)}</td>
        <td class="motivo-cell">${escapeHtml(item.motivo)}</td>
        <td class="resolucao-cell">${escapeHtml(item.resolucao)}</td>
        <td class="data-cell">${item.data}</td>
        <td class="status-cell">
          <span class="status-badge status-${statusClass}">
            ${escapeHtml(item.status_descricao)}
          </span>
        </td>
      </tr>
    `;
    })
    .join('');

  const conteudoTabela =
    atendimentos.length > 0
      ? `
      <table>
        <thead>
          <tr>
            <th class="id-cell">ID</th>
            <th class="nome-cell">Atendido (A)</th>
            <th class="motivo-cell">Motivo</th>
            <th class="resolucao-cell">Resolução</th>
            <th class="data-cell">Data</th>
            <th class="status-cell">Status</th>
          </tr>
        </thead>
        <tbody>
          ${linhasTabela}
        </tbody>
      </table>

      <div class="resumo">
        <h3>Resumo</h3>
        <p><strong>Total de Registros:</strong> ${atendimentos.length}</p>

        <p><strong>Quantidade por Status:</strong></p>
        <div style="display: flex; align-items: center; gap: .5rem; flex-direction: row;">
          <span class="status-badge status-${getStatusClass(1)}">
            Concluído: <strong>${
              atendimentos.filter((atd) => atd.status == 1).length
            }</strong>
          </span>
            <span class="status-badge status-${getStatusClass(2)}">
            Não Concluído: <strong>${
              atendimentos.filter((atd) => atd.status == 2).length
            }</strong>
          </span>
          <span class="status-badge status-${getStatusClass(3)}">
            Aberto: <strong>${
              atendimentos.filter((atd) => atd.status == 3).length
            }</strong>
          </span>
          <span class="status-badge status-${getStatusClass(4)}">
            Cancelado: <strong>${
              atendimentos.filter((atd) => atd.status == 4).length
            }</strong>
          </span>
          <span class="status-badge status-${getStatusClass(5)}">
            Pausado: <strong>${
              atendimentos.filter((atd) => atd.status == 5).length
            }</strong>
          </span>
        </div>
      </div>
    `
      : `
      <div class="no-data">
        <p>Nenhum atendimento encontrado com os filtros aplicados.</p>
      </div>
    `;

  const htmlCompleto = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Atendimentos</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
      padding: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 3px solid #3498db;
    }

    .header h1 {
      font-size: 24px;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .header .data-geracao {
      font-size: 11px;
      color: #7f8c8d;
    }

    .filtros {
      background-color: #f8f9fa;
      padding: 15px;
      margin-bottom: 25px;
      border-radius: 5px;
      border-left: 4px solid #3498db;
    }

    .filtros h3 {
      font-size: 13px;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .filtros p {
      font-size: 11px;
      color: #555;
      margin: 3px 0;
    }

    .filtros strong {
      color: #2c3e50;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    thead {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      color: white;
    }

    thead th {
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-right: 1px solid rgba(255,255,255,0.2);
    }

    thead th:last-child {
      border-right: none;
    }

    tbody tr {
      border-bottom: 1px solid #e0e0e0;
      transition: background-color 0.2s;
    }

    tbody tr:nth-child(even) {
      background-color: #f8f9fa;
    }

    tbody tr:hover {
      background-color: #e3f2fd;
    }

    tbody td {
      padding: 10px 8px;
      font-size: 11px;
      vertical-align: top;
      word-wrap: break-word;
      word-break: break-word;
    }

    .id-cell {
      text-align: center;
      font-weight: 500;
      width: 40px;
    }

    .nome-cell {
      max-width: 150px;
      font-weight: 500;
    }

    .motivo-cell, .resolucao-cell {
      max-width: 180px;
      line-height: 1.5;
    }

    .data-cell {
      text-align: center;
      white-space: nowrap;
      width: 90px;
    }

    .status-cell {
      text-align: center;
      width: 80px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 6px;
      border-radius: 6px;
      font-size: 8px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-success {
      background-color: rgb(25, 135, 84);
      color: #f5f5f5;
    }

    .status-danger {
      background-color: rgb(220, 53, 69);
      color: #f5f5f5;
    }

    .status-primary {
      background-color: rgb(13, 110, 253);
      color: #f5f5f5;
    }

    .status-warning {
      background-color: rgb(255, 193, 7);
      color: #1a1a1a;
    }

    .status-secondary {
      background-color: rgb(108, 117, 125);
      color: #f5f5f5;
    }

    .resumo {
      margin-top: 30px;
      padding: 15px;
      background-color: #f1f3f5;
      border-radius: 5px;
      border-left: 4px solid #3498db;
    }

    .resumo h3 {
      font-size: 14px;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .resumo p {
      font-size: 12px;
      color: #555;
      margin: 3px 0;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #7f8c8d;
      font-style: italic;
      background-color: #f8f9fa;
      border-radius: 5px;
    }

    /* Paginação automática */


    /* Evitar quebra de linha dentro das linhas da tabela */
    tbody tr {
      page-break-inside: avoid;
    }

    /* Evitar que o cabeçalho fique sozinho no final da página */
    thead {
      page-break-after: avoid;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Relatório de Atendimentos</h1>
    <p class="data-geracao">Gerado em ${dataGeracao}</p>
  </div>

  <div class="filtros">
    <h3>Filtros Aplicados</h3>
    <p><strong>Data Início:</strong> ${dataInicioFormatada}</p>
    <p><strong>Data Fim:</strong> ${dataFimFormatada}</p>
    <p><strong>Operador:</strong> ${operadorFormatado}</p>
  </div>

  ${conteudoTabela}
</body>
</html>
  `;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
    defaultViewport: {
      width: 1200,
      height: 800,
    },
  });

  try {
    const page = await browser.newPage();

    // Aguardar múltiplos eventos de carregamento
    await page.setContent(htmlCompleto, {
      waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
      timeout: 30000,
    });

    // Aguardar fontes carregarem
    await page.evaluateHandle('document.fonts.ready');

    // Verificar se o conteúdo foi renderizado
    const bodyContent = await page.$eval('body', (el) => el.innerHTML);
    if (!bodyContent || bodyContent.length < 100) {
      throw new Error('HTML não foi renderizado corretamente');
    }

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 10px; text-align: right; width: 100%; color: #7f8c8d; padding-right: 15px;">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>
      `,
    });

    // Verificar tamanho do arquivo gerado
    const stats = await fs.stat(filePath);

    if (stats.size < 1000) {
      console.warn('AVISO: PDF muito pequeno, pode estar vazio!');
    }

    return filePath;
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    throw error;
  } finally {
    await browser.close();
  }
};

const listarTurmas = async () => {
  const [turmas] = await atendimentosModel.listarTurmas();
  return turmas;
};

const listarAnosLetivos = async () => {
  const [turmas] = await atendimentosModel.listarAnosLetivos();
  return turmas;
};

const listarStatusTurma = async () => {
  const [turmas] = await atendimentosModel.listarStatusTurma();
  return turmas;
};

const gerarRelatorioPDFTurmas = async (filtros = {}) => {
  const { turmas, ano_letivo, status } = filtros;

  const turmasLista = await atendimentosModel.gerarRelatorioPDFTurmas(filtros);

  const dir = 'public/relatorios/turmas';
  await fs.ensureDir(dir);
  const filePath = path.join(
    dir,
    `Relatorio-Turmas-${new Date().toISOString().split('T')[0]}.pdf`
  );

  const escapeHtml = (text) => {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const dataGeracao = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Formatar filtros aplicados
  const filtrosAplicados = [];
  if (turmas && turmas.length > 0) {
    filtrosAplicados.push(`Turmas selecionadas: ${turmas.length}`);
  }
  if (ano_letivo) {
    filtrosAplicados.push(`Ano Letivo: ${ano_letivo}`);
  }
  if (status) {
    filtrosAplicados.push(`Status: ${status}`);
  }

  const filtrosHtml =
    filtrosAplicados.length > 0
      ? `<p>${filtrosAplicados.join(' | ')}</p>`
      : '<p>Nenhum filtro aplicado</p>';

  // Gerar blocos HTML para cada turma
  const blocosturmas = turmasLista
    .map((turma) => {
      const totalAlunos = turma.alunos.length;

      const linhasAlunos = turma.alunos
        .map(
          (aluno, index) => `
          <tr>
            <td class="numero-cell">${index + 1}</td>
            <td class="nome-aluno-cell">${escapeHtml(aluno.nome)}</td>
            <td class="matricula-cell">${escapeHtml(
              aluno.matricula || 'Sem matrícula'
            )}</td>
          </tr>
        `
        )
        .join('');

      const gridAlunos =
        totalAlunos > 0
          ? `
          <table class="alunos-table">
            <thead>
              <tr>
                <th class="numero-cell">#</th>
                <th class="nome-aluno-cell">Nome do Aluno</th>
                <th class="matricula-cell">Matrícula</th>
              </tr>
            </thead>
            <tbody>
              ${linhasAlunos}
            </tbody>
          </table>
        `
          : '<p class="sem-alunos">Nenhum aluno matriculado nesta turma.</p>';

      return `
        <div class="turma-bloco">
          <div class="turma-header">
            <h2>${escapeHtml(turma.nome)}</h2>
            <div class="turma-info">
              <span class="info-item"><strong>Ano Letivo:</strong> ${
                turma.ano_letivo
              }</span>
              <span class="info-item"><strong>Período:</strong> ${
                turma.periodo
              }</span>
              <span class="info-item"><strong>Semestre:</strong> ${
                turma.semestre
              }ª</span>
              <span class="info-item"><strong>Status:</strong> ${escapeHtml(
                turma.status
              )}</span>
              <span class="info-item total-alunos"><strong>Total de Alunos:</strong> ${totalAlunos}</span>
            </div>
          </div>

          ${gridAlunos}
        </div>
      `;
    })
    .join('');

  const conteudoCompleto =
    turmasLista.length > 0
      ? blocosturmas
      : `
      <div class="no-data">
        <p>Nenhuma turma encontrada com os filtros aplicados.</p>
      </div>
    `;

  // Calcular totais
  const totalTurmas = turmasLista.length;
  const totalAlunos = turmasLista.reduce((sum, t) => sum + t.alunos.length, 0);

  const htmlCompleto = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Turmas</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
      padding: 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 3px solid #3498db;
    }

    .header h1 {
      font-size: 24px;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .header .data-geracao {
      font-size: 11px;
      color: #7f8c8d;
    }

    .filtros {
      background-color: #f8f9fa;
      padding: 15px;
      margin-bottom: 25px;
      border-radius: 5px;
      border-left: 4px solid #3498db;
    }

    .filtros h3 {
      font-size: 13px;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .filtros p {
      font-size: 11px;
      color: #555;
      margin: 3px 0;
    }

    .turma-bloco {
      margin-bottom: 30px;
      page-break-inside: avoid;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .turma-header {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      color: white;
      padding: 15px 20px;
    }

    .turma-header h2 {
      font-size: 16px;
      margin-bottom: 10px;
    }

    .turma-info {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 11px;
    }

    .info-item {
      background-color: rgba(255, 255, 255, 0.2);
      padding: 5px 10px;
      border-radius: 4px;
    }

    .total-alunos {
      background-color: rgba(255, 255, 255, 0.3);
      font-weight: bold;
    }

    .alunos-table {
      width: 100%;
      border-collapse: collapse;
    }

    .alunos-table thead {
      background-color: #ecf0f1;
    }

    .alunos-table thead th {
      padding: 10px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      color: #2c3e50;
      border-bottom: 2px solid #bdc3c7;
    }

    .alunos-table tbody tr {
      border-bottom: 1px solid #e0e0e0;
    }

    .alunos-table tbody tr:nth-child(even) {
      background-color: #f8f9fa;
    }

    .alunos-table tbody tr:hover {
      background-color: #e3f2fd;
    }

    .alunos-table tbody td {
      padding: 10px;
      font-size: 11px;
    }

    .numero-cell {
      text-align: center;
      width: 50px;
      font-weight: 500;
    }

    .nome-aluno-cell {
      width: 60%;
    }

    .matricula-cell {
      text-align: center;
      width: 30%;
      font-weight: 500;
      color: #2c3e50;
    }

    .sem-alunos {
      padding: 30px;
      text-align: center;
      color: #7f8c8d;
      font-style: italic;
      background-color: #f8f9fa;
    }

    .resumo {
      margin-top: 30px;
      padding: 15px;
      background-color: #f1f3f5;
      border-radius: 5px;
      border-left: 4px solid #3498db;
    }

    .resumo h3 {
      font-size: 14px;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .resumo p {
      font-size: 12px;
      color: #555;
      margin: 3px 0;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #7f8c8d;
      font-style: italic;
      background-color: #f8f9fa;
      border-radius: 5px;
    }

    /* Paginação */
    .turma-bloco {
      page-break-inside: avoid;
    }

    .turma-header {
      page-break-after: avoid;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Relatório de Turmas</h1>
    <p class="data-geracao">Gerado em ${dataGeracao}</p>
  </div>

  <div class="filtros">
    <h3>Filtros Aplicados</h3>
    ${filtrosHtml}
  </div>

  ${conteudoCompleto}

  <div class="resumo">
    <h3>Resumo Geral</h3>
    <p><strong>Total de Turmas:</strong> ${totalTurmas}</p>
    <p><strong>Total de Alunos:</strong> ${totalAlunos}</p>
  </div>
</body>
</html>
  `;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
    defaultViewport: {
      width: 1200,
      height: 800,
    },
  });

  try {
    const page = await browser.newPage();

    await page.setContent(htmlCompleto, {
      waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
      timeout: 30000,
    });

    await page.evaluateHandle('document.fonts.ready');

    const bodyContent = await page.$eval('body', (el) => el.innerHTML);
    if (!bodyContent || bodyContent.length < 100) {
      throw new Error('HTML não foi renderizado corretamente');
    }

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 10px; text-align: right; width: 100%; color: #7f8c8d; padding-right: 15px;">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>
      `,
    });

    // Verificar tamanho do arquivo gerado
    const stats = await fs.stat(filePath);

    if (stats.size < 1000) {
      console.warn('AVISO: PDF muito pequeno, pode estar vazio!');
    }

    return filePath;
  } catch (error) {
    console.error('Erro ao gerar relatório de turmas:', error);
    throw error;
  } finally {
    await browser.close();
  }
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
  listarAtendimentosRelatorio,
  listarTurmas,
  listarAnosLetivos,
  listarStatusTurma,
  gerarRelatorioPDFTurmas,
  listarUsuarios,
};
