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
  const trx = await knex.transaction();

  try {
    const matriculas = await trx('aluno_turma')
      .innerJoin('matricula', 'aluno_turma.matricula_id', 'matricula.id')
      .where('aluno_turma.turma_id', sourceTurmaId)
      .whereIn('matricula.aluno_id', studentIds)
      .select('matricula.id as matricula_id', 'matricula.ano_letivo');

    if (matriculas.length === 0) {
      throw new Error(
        'Nenhuma matrícula encontrada para os alunos selecionados'
      );
    }

    const targetTurma = await trx('turma')
      .select('ano_letivo')
      .where('id', targetTurmaId)
      .first();

    if (!targetTurma) {
      throw new Error('Turma de destino não encontrada');
    }

    for (const matricula of matriculas) {
      const novoCampoUnico = `${matricula.matricula_id}_${targetTurma.ano_letivo}`;

      const existingRecord = await trx('aluno_turma')
        .where('matricula_id', matricula.matricula_id)
        .where('ano_letivo', targetTurma.ano_letivo)
        .first();

      if (!existingRecord) {
        await trx('aluno_turma').insert({
          matricula_id: matricula.matricula_id,
          turma_id: targetTurmaId,
          ano_letivo: targetTurma.ano_letivo,
          campo_unico: novoCampoUnico,
          data_alocacao: new Date().toISOString().split('T')[0],
        });
      } else {
        await trx('aluno_turma')
          .where('matricula_id', matricula.matricula_id)
          .where('ano_letivo', targetTurma.ano_letivo)
          .update({
            turma_id: targetTurmaId,
            campo_unico: novoCampoUnico,
            data_alocacao: new Date().toISOString().split('T')[0],
          });
      }
    }

    await trx('turma')
      .where('id', targetTurmaId)
      .update({ status: 'Em andamento' });

    await trx.commit();

    return {
      transferredStudents: studentIds.length,
      targetTurmaId,
      newStatus: 'Em andamento',
    };
  } catch (error) {
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
