const pool = require("../db.js");

const createAula = async (
  id_turma,
  id_func_responsavel,
  start,
  end,
  desc,
  color,
  tipo,
  id_usuario_inclusao
) => {
  const [result] = await pool.query(
    "INSERT INTO agendamento_aula (id_turma, id_func_responsavel, start, end, `desc`, color, tipo, id_usuario_inclusao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id_turma,
      id_func_responsavel,
      start,
      end,
      desc,
      color,
      tipo,
      id_usuario_inclusao,
    ]
  );

  const insertedId = result.insertId;

  // Atualiza o lote_agendamento com o próprio ID
  await pool.query(
    "UPDATE agendamento_aula SET lote_agendamento = ? WHERE id = ?",
    [insertedId, insertedId]
  );

  return insertedId;
};

const adiarAula = async (
  id_aula_original,
  start,
  end,
  motivo_adiamento,
  id_usuario_inclusao
) => {
  const result = await pool.query(
    `INSERT INTO agendamento_aula (id_turma, id_func_responsavel, start, end, \`desc\`, color, tipo, status, dh_adiamento, motivo_adiamento, lote_agendamento, id_usuario_inclusao)
     SELECT id_turma, id_func_responsavel, ?, ?, \`desc\`, color, tipo, 'AD', NOW(), ?, lote_agendamento, ?
     FROM agendamento_aula
     WHERE id = ?`,
    [start, end, motivo_adiamento, id_usuario_inclusao, id_aula_original]
  );
  return result;
};

const getAulas = async () => {
  const [result] = await pool.query(`
    SELECT a.*, 
           t.nome AS turma_nome,
           f.nome AS professor_nome
    FROM agendamento_aula a
    INNER JOIN (
        SELECT lote_agendamento, MAX(dh_inclusao) AS max_dh_inclusao
        FROM agendamento_aula
        WHERE status != 'C'
        GROUP BY lote_agendamento
    ) latest ON a.lote_agendamento = latest.lote_agendamento AND a.dh_inclusao = latest.max_dh_inclusao
    LEFT JOIN turma t ON a.id_turma = t.id
    LEFT JOIN professor f ON a.id_func_responsavel = f.id
    WHERE a.status != 'C'
  `);
  return result;
};

const getAulasTipo = async () => {
  try {
    const [result] = await pool.query("SELECT DISTINCT tipo FROM agendamento_aula");
    return result.filter(item => item.tipo !== "");
  } catch (error) {
    throw new Error("Erro ao buscar tipos de aulas: " + error.message);
  }
};

const getAulaById = async (id) => {
  const [result] = await pool.query(
    `
    SELECT a.*, 
           t.nome AS turma_nome, 
           f.nome AS professor_nome
    FROM agendamento_aula a
    LEFT JOIN turma t ON a.id_turma = t.id
    LEFT JOIN professor f ON a.id_func_responsavel = f.id
    WHERE a.id = ?
  `,
    [id]
  );
  return result[0];
};

const updateAula = async (
  id,
  id_turma,
  id_func_responsavel,
  start,
  end,
  desc,
  color,
  tipo
) => {
  const result = await pool.query(
    "UPDATE agendamento_aula SET id_turma = ?, id_func_responsavel = ?, start = ?, end = ?, `desc` = ?, color = ?, tipo = ? WHERE id = ?",
    [id_turma, id_func_responsavel, start, end, desc, color, tipo, id]
  );
  return result;
};

const cancelarAula = async (id, motivocancelamento) => {
  if (!id || !motivocancelamento) {
    throw new Error("Parâmetros inválidos");
  }

  const query = `
    UPDATE agendamento_aula 
    SET 
      status = ?, 
      dh_cancelamento = NOW(), 
      motivocancelamento = ? 
    WHERE lote_agendamento = (
      SELECT lote_agendamento 
      FROM (SELECT lote_agendamento FROM agendamento_aula WHERE id = ?) AS subquery
    )
  `;

  try {
    const [result] = await pool.query(query, ["C", motivocancelamento, id]);
    return result.affectedRows;
  } catch (error) {
    console.error("Erro ao cancelar aula:", error);
    throw error;
  }
};

const getHistoricoAulasByTurmaId = async (idTurma) => {
  const [rows] = await pool.query(
    `
    SELECT a.*, 
           t.nome AS turma_nome, 
           f.nome AS professor_nome,
           tipo
    FROM agendamento_aula a
    INNER JOIN (
        SELECT lote_agendamento, MAX(dh_inclusao) AS max_dh_inclusao
        FROM agendamento_aula
        GROUP BY lote_agendamento
    ) latest 
    ON a.lote_agendamento = latest.lote_agendamento AND a.dh_inclusao = latest.max_dh_inclusao
    LEFT JOIN turma t ON a.id_turma = t.id
    LEFT JOIN professor f ON a.id_func_responsavel = f.id
    WHERE a.id_turma = ?
  `,
    [idTurma]
  );
  return rows;
};

const deleteAula = async (id) => {
    const result = await pool.query('DELETE FROM agendamento_aula WHERE id = ?', [id]);
    return result;
};

module.exports = {
  createAula,
  getAulas,
  getAulasTipo,
  getAulaById,
  updateAula,
  cancelarAula,
  adiarAula,
  getHistoricoAulasByTurmaId,
  deleteAula,
};
