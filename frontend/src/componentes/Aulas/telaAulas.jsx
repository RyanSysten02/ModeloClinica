import React, { useEffect, useMemo, useState } from 'react';
import { Button, ButtonGroup, Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import EditarAulas from './EditarAulas';
import RelatorioProfessoresModal from './RelatorioProfessoresModal';
import HistoricoAulasModal from './HistoricoAulasModal';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

export default function AtribuicaoDeAulas() {
  const [horarios, setHorarios] = useState([]);
  const [turmas, setTurmas] = useState([]);

  const [scheduleByDay, setScheduleByDay] = useState(
    DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {})
  );
  const [draftByDay, setDraftByDay] = useState(
    DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {})
  );

  const [currentDay, setCurrentDay] = useState(DAYS[0]);
  const [editMode, setEditMode] = useState(false);

  const [clipboard, setClipboard] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCell, setModalCell] = useState(null);

  const [showRelatorio, setShowRelatorio] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);

  const token = localStorage.getItem('token');

  const columns = useMemo(() => turmas.map((t) => t.nome), [turmas]);

  const emptyDayFactory = useMemo(() => {
    return () => horarios.map(() => columns.map(() => null));
  }, [horarios, columns]);

  const currentDraft = useMemo(() => {
    return draftByDay[currentDay]?.length
      ? draftByDay[currentDay]
      : emptyDayFactory();
  }, [draftByDay, currentDay, emptyDayFactory]);

  const currentSchedule = useMemo(() => {
    return scheduleByDay[currentDay]?.length
      ? scheduleByDay[currentDay]
      : emptyDayFactory();
  }, [scheduleByDay, currentDay, emptyDayFactory]);

  const currentMatrix = editMode ? currentDraft : currentSchedule;

  useEffect(() => {
    const loadHorarios = async () => {
      const resp = await fetch('http://localhost:5001/api/aulas/horarios', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      setHorarios(data || []);
    };
    if (token) loadHorarios();
  }, [token]);

  useEffect(() => {
    const loadTurmas = async () => {
      const resp = await fetch('http://localhost:5001/api/turma/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      setTurmas(Array.isArray(data) ? data : []);
    };
    if (token) loadTurmas();
  }, [token]);

  useEffect(() => {
    const loadAulasDia = async () => {
      if (!horarios.length || !columns.length) return;

      const resp = await fetch(
        `http://localhost:5001/api/aulas?dia=${encodeURIComponent(
          currentDay
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await resp.json();

      const matrix = emptyDayFactory();

      const rowIndexByHorario = {};
      horarios.forEach((h, idx) => {
        rowIndexByHorario[h.id] = idx;
      });

      data.forEach((a) => {
        const r = rowIndexByHorario[a.horario_id];
        const c = columns.findIndex((col) => col === a.turma);
        if (r >= 0 && c >= 0) {
          matrix[r][c] = {
            subjectId: a.disciplina_id,
            subject: a.disciplina_nome,
            teacherId: a.professor_id,
            teacherName: a.professor_nome,
            teacherColor: a.cor || '#eee',
          };
        }
      });

      setScheduleByDay((prev) => ({
        ...prev,
        [currentDay]: matrix,
      }));

      setDraftByDay((prev) => {
        if (prev[currentDay] && prev[currentDay].length) {
          return prev;
        }
        return {
          ...prev,
          [currentDay]: deepClone(matrix),
        };
      });
    };

    if (token && currentDay) loadAulasDia();
  }, [token, currentDay, horarios, columns, emptyDayFactory]);

  useEffect(() => {
    if (editMode) {
      toast.info(`Editando horário de ${currentDay}`, { autoClose: 2500 });
    }
  }, [currentDay, editMode]);

  const cargaProfessores = useMemo(() => {
    const contador = {};
    DAYS.forEach((dia) => {
      const matriz =
        (draftByDay[dia] && draftByDay[dia].length
          ? draftByDay[dia]
          : scheduleByDay[dia]) || [];
      matriz.forEach((linha) => {
        linha.forEach((cell) => {
          if (cell && cell.teacherId) {
            contador[cell.teacherId] = (contador[cell.teacherId] || 0) + 1;
          }
        });
      });
    });
    return contador;
  }, [draftByDay, scheduleByDay]);

  const disciplinasProfessorMap = useMemo(() => {
    return {
      24: ['Matemática'],
      25: ['Português', 'Redação', 'Língua Portuguesa', 'Gramática'],
      26: ['Ciências', 'Biologia'],
      27: ['História'],
      28: ['Geografia'],
      29: ['Inglês', 'Língua Inglesa', 'Inglês Instrumental'],
    };
  }, []);

  const handleEditToggle = () => {
    if (!editMode) {
      setDraftByDay((prev) => ({
        ...prev,
        [currentDay]: deepClone(
          prev[currentDay]?.length ? prev[currentDay] : currentSchedule
        ),
      }));
      setEditMode(true);
      toast.info(`Modo edição ativado (${currentDay})`, { autoClose: 2500 });
    }
  };

  const validaConflitosProfessorDia = () => {
    const conflitos = {};
    for (let rowIdx = 0; rowIdx < currentDraft.length; rowIdx++) {
      const linha = currentDraft[rowIdx];
      const h = horarios[rowIdx];
      if (!h) continue;
      if (Number(h.is_intervalo) === 1) continue;

      for (let colIdx = 0; colIdx < linha.length; colIdx++) {
        const cell = linha[colIdx];
        if (!cell) continue;
        const teacherId = cell.teacherId;
        const turmaNome = columns[colIdx];
        const horarioId = h.id;
        if (!teacherId) continue;

        if (!conflitos[horarioId]) conflitos[horarioId] = {};
        if (!conflitos[horarioId][teacherId]) {
          conflitos[horarioId][teacherId] = turmaNome;
        } else {
          const turmaConflitante = conflitos[horarioId][teacherId];
          return {
            ok: false,
            mensagem: `Conflito: o professor "${cell.teacherName}" está em "${turmaConflitante}" e "${turmaNome}" no horário ${h.rotulo}.`,
          };
        }
      }
    }
    return { ok: true };
  };

  const handleSave = async () => {
    const validacao = validaConflitosProfessorDia();
    if (!validacao.ok) {
      toast.error(validacao.mensagem, { autoClose: 5000 });
      return;
    }

    const aulas = [];
    currentDraft.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        const h = horarios[rowIdx];
        const turma = columns[colIdx];
        const isBreak = Number(h?.is_intervalo) === 1;
        if (isBreak || !cell) return;
        aulas.push({
          horario_id: h.id,
          turma,
          disciplina_id: cell.subjectId,
          professor_id: cell.teacherId,
          cor: cell.teacherColor || null,
        });
      });
    });

    const savePromise = fetch('http://localhost:5001/api/aulas/salvar-dia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dia: currentDay, aulas }),
    }).then(async (resp) => {
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Erro desconhecido');
      }
      return resp.json();
    });

    toast
      .promise(savePromise, {
        pending: 'Salvando horário...',
        success: 'Horário salvo com sucesso!',
        error: {
          render({ data }) {
            return `Erro ao salvar: ${data.message}`;
          },
        },
      })
      .then(() => {
        setScheduleByDay((prev) => ({
          ...prev,
          [currentDay]: deepClone(currentDraft),
        }));
        setDraftByDay((prev) => ({
          ...prev,
          [currentDay]: deepClone(currentDraft),
        }));
        setEditMode(false);
      })
      .catch(() => {});
  };

  const handleCancel = () => {
    setDraftByDay((prev) => ({
      ...prev,
      [currentDay]: deepClone(currentSchedule),
    }));
    setEditMode(false);
    toast.info('Edição cancelada.');
  };

  const handleCopy = () => {
    setClipboard(deepClone(currentSchedule));
    toast.info(`Aulas de ${currentDay} copiadas!`);
  };

  const handlePaste = () => {
    if (editMode && clipboard) {
      setDraftByDay((prev) => ({
        ...prev,
        [currentDay]: deepClone(clipboard),
      }));
      toast.success('Aulas coladas com sucesso!');
    }
  };

  const handleClear = () => {
    if (!editMode) return;
    if (
      window.confirm(
        `Limpar todas as aulas de ${currentDay}? As células ficarão vazias.`
      )
    ) {
      setDraftByDay((prev) => ({
        ...prev,
        [currentDay]: emptyDayFactory(),
      }));
      toast.warn(`As aulas de ${currentDay} foram limpas.`);
    }
  };

  const openCellModal = (row, col) => {
    if (!editMode) return;
    setModalCell({ row, col });
    setModalOpen(true);
  };

  const confirmCell = (entry) => {
    if (!modalCell) return;
    const { row, col } = modalCell;

    if (entry === null) {
      setDraftByDay((prev) => {
        const nextDayDraft = deepClone(
          prev[currentDay]?.length ? prev[currentDay] : emptyDayFactory()
        );
        nextDayDraft[row][col] = null;
        return { ...prev, [currentDay]: nextDayDraft };
      });
      setModalOpen(false);
      setModalCell(null);
      return;
    }

    const newTeacherId = entry.teacherId;
    if (newTeacherId) {
      const linhaAtual =
        draftByDay[currentDay]?.[row]?.length
          ? draftByDay[currentDay][row]
          : currentDraft[row] || [];

      for (let c = 0; c < linhaAtual.length; c++) {
        if (c === col) continue;
        const cell = linhaAtual[c];
        if (cell && cell.teacherId === newTeacherId) {
          const turmaConflitante = columns[c];
          const horarioRotulo = horarios[row]?.rotulo || 'este horário';
          toast.error(
            `Conflito: ${entry.teacherName} já está em "${turmaConflitante}" no ${horarioRotulo}.`,
            { autoClose: 5000 }
          );
          return;
        }
      }
    }

    setDraftByDay((prev) => {
      const nextDayDraft = deepClone(
        prev[currentDay]?.length ? prev[currentDay] : emptyDayFactory()
      );
      nextDayDraft[row][col] = entry;
      return { ...prev, [currentDay]: nextDayDraft };
    });

    setModalOpen(false);
    setModalCell(null);
  };

  const relatorioProfessores = useMemo(() => {
    const acc = {};

    const consumeMatrix = (matriz) => {
      matriz.forEach((linha) => {
        linha.forEach((cell, colIdx) => {
          if (!cell || !cell.teacherId) return;
          const pid = cell.teacherId;
          if (!acc[pid]) {
            acc[pid] = {
              professorName: cell.teacherName,
              porTurma: {},
              total: 0,
            };
          }
          const turma = columns[colIdx];
          acc[pid].porTurma[turma] = (acc[pid].porTurma[turma] || 0) + 1;
          acc[pid].total += 1;
        });
      });
    };

    DAYS.forEach((dia) => {
      const matriz =
        (draftByDay[dia] && draftByDay[dia].length
          ? draftByDay[dia]
          : scheduleByDay[dia]) || [];
      consumeMatrix(matriz);
    });

    const rows = Object.entries(acc).map(([profId, data]) => ({
      professorId: Number(profId),
      professorName: data.professorName,
      porTurma: data.porTurma,
      total: data.total,
    }));

    rows.sort((a, b) =>
      a.professorName.localeCompare(b.professorName, 'pt-BR')
    );
    return rows;
  }, [draftByDay, scheduleByDay, columns]);

  const handleAplicarSnapshotHistorico = (matrix, meta) => {
    setDraftByDay((prev) => ({
      ...prev,
      [currentDay]: matrix,
    }));
    setEditMode(true);
    toast.info(
      `Versão de ${
        meta?.dh_versao ? new Date(meta.dh_versao).toLocaleString('pt-BR') : ''
      } carregada. Revise e clique em Salvar para aplicar.`,
      { autoClose: 5000 }
    );
    setShowHistorico(false);
  };

  return (
    <Container fluid className="py-3">
      <h2 className="text-center mb-4">Aulas</h2>

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <ButtonGroup className="flex-wrap">
          {DAYS.map((d) => (
            <Button
              key={d}
              size="sm"
              variant={currentDay === d ? 'primary' : 'outline-secondary'}
              onClick={() => setCurrentDay(d)}
              style={{ borderRadius: 999, marginRight: 6, marginBottom: 6 }}
            >
              {d}
            </Button>
          ))}
        </ButtonGroup>

        <div className="d-flex align-items-center gap-2">
          {!editMode ? (
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={handleEditToggle}
              style={{ borderRadius: 999 }}
            >
              ✏️ Editar
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSave}
                style={{ borderRadius: 999 }}
              >
                💾 Salvar
              </Button>
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={handleCancel}
                style={{ borderRadius: 999 }}
              >
                ❌ Cancelar
              </Button>
            </>
          )}

          <div style={{ width: 1, height: 24, background: '#dee2e6' }} />

          <Button
            size="sm"
            variant="outline-secondary"
            onClick={handleCopy}
            style={{ borderRadius: 999 }}
          >
            📋 Copiar
          </Button>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={handlePaste}
            disabled={!editMode || !clipboard}
            style={{ borderRadius: 999 }}
          >
            📥 Colar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={handleClear}
            disabled={!editMode}
            style={{ borderRadius: 999 }}
          >
            🧹 Limpar
          </Button>

          <Button
            size="sm"
            variant="success"
            onClick={() => setShowRelatorio(true)}
            style={{ borderRadius: 999 }}
          >
            📊 Relatório
          </Button>

          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => setShowHistorico(true)}
            style={{ borderRadius: 999 }}
          >
            🕒 Histórico
          </Button>
        </div>
      </div>

      <div
        className="table-responsive"
        style={{
          border: '1px solid #dee2e6',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <table className="table mb-0" style={{ minWidth: 960 }}>
          <thead className="table-light">
            <tr>
              <th
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                  background: '#f8f9fa',
                  width: 160,
                }}
              >
                HORA
              </th>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horarios.map((h, rowIdx) => (
              <tr key={h.id}>
                <td
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    background: '#fff',
                    width: 160,
                  }}
                >
                  {h.rotulo}
                </td>
                {columns.map((_, colIdx) => {
                  const entry = currentMatrix[rowIdx]?.[colIdx] || null;
                  const isBreak = Number(h.is_intervalo) === 1;
                  if (isBreak) {
                    return (
                      <td
                        key={`${rowIdx}-${colIdx}`}
                        className="text-center text-muted"
                      >
                        —
                      </td>
                    );
                  }
                  return (
                    <td key={`${rowIdx}-${colIdx}`}>
                      <button
                        onClick={() => openCellModal(rowIdx, colIdx)}
                        disabled={!editMode}
                        className={`w-100 btn btn-sm ${
                          editMode
                            ? 'btn-outline-secondary'
                            : 'btn-outline-secondary disabled'
                        }`}
                        style={{
                          textAlign: 'left',
                          borderRadius: 12,
                          padding: 4,
                        }}
                      >
                        {entry ? (
                          <div
                            style={{
                              background: entry.teacherColor,
                              borderRadius: 8,
                              padding: '6px 10px',
                              lineHeight: 1.1,
                              boxShadow: '0 1px 2px rgba(0,0,0,.06)',
                              opacity: editMode ? 0.6 : 1,
                              transition: 'opacity .3s ease-in-out',
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 600,
                                marginBottom: 2,
                                fontSize: 13,
                                color: '#000',
                              }}
                            >
                              {entry.subject}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: '#000',
                              }}
                            >
                              {entry.teacherName}
                            </div>
                          </div>
                        ) : (
                          <span
                            className="text-muted"
                            style={{
                              fontSize: 12,
                              display: 'block',
                              padding: '6px 10px',
                            }}
                          >
                            {editMode ? 'Clique para definir' : '—'}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditarAulas
        show={modalOpen}
        onHide={() => setModalOpen(false)}
        defaults={
          modalCell && currentMatrix?.[modalCell.row]?.[modalCell.col]
            ? currentMatrix[modalCell.row][modalCell.col]
            : undefined
        }
        onConfirm={confirmCell}
        cargaProfessores={cargaProfessores}
        disciplinasProfessorMap={disciplinasProfessorMap}
      />

      <RelatorioProfessoresModal
        show={showRelatorio}
        onHide={() => setShowRelatorio(false)}
        columns={columns}
        relatorio={relatorioProfessores}
      />

      <HistoricoAulasModal
        show={showHistorico}
        onHide={() => setShowHistorico(false)}
        dia={currentDay}
        horarios={horarios}
        columns={columns}
        onApplySnapshot={handleAplicarSnapshotHistorico}
      />
    </Container>
  );
}
