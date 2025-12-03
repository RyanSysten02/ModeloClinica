const knex = require('../lib/knex');

const create = async (data) => {
  const result = await knex('turma').insert(data);

  return result;
};

const findAll = async () => {
  const result = await knex('turma').select();

  if (!result) return [];

  return result;
};

const findById = async (id) => {
  const result = await knex('turma').select().where({ id });

  if (!result) return [];

  return result?.at(0);
};

const update = async (id, data) => {
  const result = await knex('turma').update(data).where({ id });
  return result;
};

const deleteById = async (id) => {
  await knex('turma').delete().where({ id });
};

const listStudents = async (id) => {
  const result = await knex
    .from('turma')
    .innerJoin('matricula', 'turma.id', 'matricula.turma_id')
    .innerJoin('aluno', 'matricula.aluno_id', 'aluno.id')
    .where('turma.id', id);

  return result;
};

const findByStatusAndYear = async (status, anoLetivo) => {
  const result = await knex('turma')
    .select()
    .where({ status, ano_letivo: anoLetivo });

  return result;
};

const transferStudents = async (sourceTurmaId, targetTurmaId, studentIds) => {
  // 1. Inicia a transação
  const trx = await knex.transaction();

  try {
    // 2. Busca as matrículas na tabela 'matricula' (CORREÇÃO 1)
    //    Isso garante que estamos buscando os alunos da turma de origem correta (ex: 1A)
    const matriculas = await trx('matricula')
      .where('matricula.turma_id', sourceTurmaId)
      .whereIn('matricula.aluno_id', studentIds)
      .select('matricula.id as matricula_id', 'matricula.ano_letivo');

    if (matriculas.length === 0) {
      throw new Error(
        'Nenhuma matrícula encontrada para os alunos selecionados'
      );
    }

    // 3. Busca os dados da turma de destino
    const targetTurma = await trx('turma')
      .select('ano_letivo')
      .where('id', targetTurmaId)
      .first();

    if (!targetTurma) {
      throw new Error('Turma de destino não encontrada');
    }

    // 4. Itera sobre cada aluno/matrícula a ser transferido
    for (const matricula of matriculas) {
      const novoCampoUnico = `${matricula.matricula_id}_${targetTurmaId}_${targetTurma.ano_letivo}`;

      // 5. Verifica se já existe um registro de histórico (em 'aluno_turma')
      //    (Após a remoção da UK, esta lógica de INSERT/UPDATE está correta)
      const existingRecord = await trx('aluno_turma')
        .where('matricula_id', matricula.matricula_id)
        .where('ano_letivo', targetTurma.ano_letivo) // Busca pelo ano de destino
        .first();

      if (!existingRecord) {
        // 5a. INSERE o novo registro de histórico (ex: Aluno 1 no Ano 2026)
        await trx('aluno_turma').insert({
          matricula_id: matricula.matricula_id,
          turma_id: targetTurmaId,
          ano_letivo: targetTurma.ano_letivo,
          campo_unico: novoCampoUnico,
          data_alocacao: new Date().toISOString().split('T')[0],
        });
      } else {
        // 5b. ATUALIZA o registro de histórico (caso já exista por algum motivo)
        await trx('aluno_turma')
          .where('matricula_id', matricula.matricula_id)
          .where('ano_letivo', targetTurma.ano_letivo)
          .update({
            turma_id: targetTurmaId,
            campo_unico: novoCampoUnico,
            data_alocacao: new Date().toISOString().split('T')[0],
          });
      }

      // 6. ATUALIZA o registro principal na tabela 'matricula' (CORREÇÃO 2)
      //    Isso move o aluno da "1A" para a "2A" na tela de montagem.
      await trx('matricula')
        .where('id', matricula.matricula_id)
        .update({
          turma_id: targetTurmaId,
          ano_letivo: targetTurma.ano_letivo,
        });
    }

    // 7. Atualiza o status da turma de destino para "Em andamento"
    await trx('turma')
      .where('id', targetTurmaId)
      .update({ status: 'Em andamento' });

    // 8. Confirma a transação
    await trx.commit();

    return {
      transferredStudents: studentIds.length,
      targetTurmaId,
      newStatus: 'Em andamento',
    };
  } catch (error) {
    // 9. Desfaz a transação em caso de erro
    await trx.rollback();
    throw error;
  }
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  deleteById,
  listStudents,
  findByStatusAndYear,
  transferStudents,
};
