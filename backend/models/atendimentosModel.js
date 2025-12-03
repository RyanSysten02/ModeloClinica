const pool = require('../db.js');

const adicionarAtendimento = async (
  nome,
  status,
  motivo,
  data,
  resolucao,
  operador,
  tipo
) => {
  const result = await pool.query(
    `
      INSERT INTO atendimento (
          nome,
          status,
          motivo,
          data,
          resolucao,
          operador,
          tipo
        )
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nome, status, motivo, data, resolucao, operador, tipo]
  );
  return result;
};

const editarAtendimentoCompleto = async (id, details) => {
  return await pool.query(
    `
      UPDATE atendimento
        SET
          status = '${details.status}',
          motivo = '${details.motivo}',
          data = '${details.data}',
          resolucao = '${details.resolucao}',
          operador = '${details.operador}'
        WHERE id = ${id}
    `
  );
};

const listarAtendimentos = async () => {
  const result = await pool.query(`
      SELECT
          a.id,
          CASE
              WHEN a.tipo = 1 THEN al.nome
              WHEN a.tipo = 2 THEN r.nome
              ELSE a.nome
          END AS nome,
          a.status,
          sa.descricao AS status_descricao,
          a.motivo,
          a.resolucao,
          a.operador,
          a.tipo,
          date_format(a.data, '%d/%m/%Y') as data
      FROM atendimento a
      LEFT JOIN aluno al
          ON a.tipo = 1 AND a.nome = al.id
      LEFT JOIN responsavel r
          ON a.tipo = 2 AND a.nome = r.id
      LEFT JOIN status_atendimento sa
          ON a.status = sa.id
      ORDER BY a.data DESC;
  `);
  return result;
};

const listarNomesAtendimentos = async (tipo) => {
  const query =
    tipo == 1
      ? `SELECT id, nome as descricao FROM aluno;`
      : `SELECT id, nome as descricao FROM responsavel;`;
  const result = await pool.query(query);
  return result;
};

const listarStatusAtendimentos = async () => {
  const result = await pool.query('SELECT * FROM status_atendimento;');
  return result;
};

const editarAtendimento = async (id, status) => {
  return await pool.query(
    `UPDATE atendimento SET status = ${status} WHERE id = ${id}`
  );
};

const listarUsuarios = async () => {
  return await pool.query(`SELECT id, nome FROM user WHERE role_id = 3`);
};

const deletarAtendimento = async (id) => {
  const result = await pool.query(`DELETE FROM atendimento WHERE id = ${id}`);
  return result;
};

const getHistoricoConsultasByAlunoId = async (idAluno) => {
  const [rows] = await pool.query(
    `
      SELECT c.*,
             p.nome AS aluno_nome,
             f.nome AS professor_nome,
             c.tipo
      FROM consultas c
      INNER JOIN (
          SELECT lote_agendamento, MAX(dh_inclusao) AS max_dh_inclusao
          FROM consultas
          GROUP BY lote_agendamento
      ) latest
      ON c.lote_agendamento = latest.lote_agendamento AND c.dh_inclusao = latest.max_dh_inclusao
      LEFT JOIN aluno p ON c.id_aluno = p.id
      LEFT JOIN professor f ON c.id_func_responsavel = f.id
      WHERE c.id_aluno = ?
      `,
    [idAluno]
  );
  return rows;
};

const getAtendimentosByAlunoId = async (idAluno, tipo) => {
  const [rows] = await pool.query(
    `
      SELECT
        a.*,
        date_format(a.data, '%d/%m/%Y') as data,
        sa.descricao as status,
        CASE
          WHEN a.tipo = 1 THEN al.nome
          WHEN a.tipo = 2 THEN r.nome
          ELSE NULL
        END AS nome
      FROM
        atendimento a
      LEFT JOIN status_atendimento sa
        ON a.status = sa.id
      LEFT JOIN aluno al
        ON a.tipo = 1 AND a.nome = al.id
      LEFT JOIN responsavel r
        ON a.tipo = 2 AND a.nome = r.id
      WHERE
        a.nome = ${idAluno} AND tipo = ${tipo}
    `
  );
  return rows;
};

const listarAtendimentosRelatorio = async (
  dataInicio = '',
  dataFim = '',
  operador = '',
  responsavel = ''
) => {
  const getStatementData = (date, operator, column) => {
    const suffix = operator === '>=' ? ' 00:00:00' : ' 23:59:59';

    return `AND ${column} ${operator} STR_TO_DATE('${
      date + suffix
    }', '%Y-%m-%d %H:%i:%s')`;
  };

  const [rows] = await pool.query(`
      SELECT
        a.id,
        CASE
          WHEN a.tipo = 1 THEN al.nome
          WHEN a.tipo = 2 THEN r.nome
          ELSE a.nome
        END AS nome,
        a.motivo,
        a.resolucao,
        a.status,
        sa.descricao AS status_descricao,
        date_format(a.data, '%d/%m/%Y') as data
      FROM
        atendimento a
      LEFT JOIN aluno al
        ON a.tipo = 1 AND a.nome = al.id
      LEFT JOIN responsavel r
        ON a.tipo = 2 AND a.nome = r.id
      LEFT JOIN status_atendimento sa
        ON a.status = sa.id
      WHERE 1 = 1
      ${dataInicio ? getStatementData(dataInicio, '>=', 'a.data') : ''}
      ${dataFim ? getStatementData(dataFim, '<=', 'a.data') : ''};
  `);
  return rows;
};

const listarTurmas = async () => {
  return await pool.query(
    `
      SELECT t.id, t.nome FROM TURMA t;
    `
  );
};

const listarAnosLetivos = async () => {
  return await pool.query(
    `
      SELECT DISTINCT t.ano_letivo FROM TURMA t;
    `
  );
};

const listarStatusTurma = async () => {
  return await pool.query(
    `
      SELECT DISTINCT t.status FROM TURMA t;
    `
  );
};

const gerarRelatorioPDFTurmas = async (filtros = {}) => {
  const { turmas, ano_letivo, status } = filtros;

  let query = `
    SELECT
      t.id,
      t.nome,
      t.nivel,
      t.ano_letivo,
      t.periodo,
      t.semestre,
      t.status,
      JSON_ARRAYAGG(
        CASE
          WHEN a.id IS NOT NULL THEN
            JSON_OBJECT(
              'id', a.id,
              'nome', a.nome,
              'matricula', m.id,
              'dataAlocacao', at.data_alocacao
            )
          ELSE NULL
        END
      ) as alunos
    FROM turma t
    LEFT JOIN aluno_turma at ON t.id = at.turma_id
    LEFT JOIN matricula m ON at.matricula_id = m.id
    LEFT JOIN aluno a ON m.aluno_id = a.id
    WHERE 1=1
  `;

  const params = [];

  if (turmas && turmas.length > 0) {
    const placeholders = turmas.map(() => '?').join(',');
    query += ` AND t.id IN (${placeholders})`;
    params.push(...turmas);
  }

  if (ano_letivo) {
    query += ` AND t.ano_letivo = ?`;
    params.push(ano_letivo);
  }

  if (status) {
    query += ` AND t.status = ?`;
    params.push(status);
  }

  query += ` GROUP BY t.id, t.nome, t.nivel, t.ano_letivo, t.periodo, t.semestre, t.status`;
  query += ` ORDER BY t.nome`;

  const [rows] = await pool.query(query, params);

  const turmasLista = rows.map((turma) => {
    let alunosArray = [];

    try {
      // Parse do JSON retornado pelo MySQL
      if (turma.alunos) {
        const parsed =
          typeof turma.alunos === 'string'
            ? JSON.parse(turma.alunos)
            : turma.alunos;
        alunosArray = parsed.filter((aluno) => aluno !== null);
      }
    } catch (error) {
      console.error('Erro ao parsear alunos da turma:', turma.id, error);
      alunosArray = [];
    }

    return {
      id: turma.id,
      nome: turma.nome,
      nivel: turma.nivel,
      ano_letivo: turma.ano_letivo,
      periodo: turma.periodo,
      semestre: turma.semestre,
      status: turma.status,
      alunos: alunosArray,
    };
  });

  return turmasLista;
};

module.exports = {
  adicionarAtendimento,
  listarAtendimentos,
  listarNomesAtendimentos,
  editarAtendimento,
  deletarAtendimento,
  getAtendimentosByAlunoId,
  getHistoricoConsultasByAlunoId,
  listarStatusAtendimentos,
  editarAtendimentoCompleto,
  listarAtendimentosRelatorio,
  listarTurmas,
  listarAnosLetivos,
  listarStatusTurma,
  gerarRelatorioPDFTurmas,
  listarUsuarios,
};
