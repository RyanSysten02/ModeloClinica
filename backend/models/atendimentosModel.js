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
};
