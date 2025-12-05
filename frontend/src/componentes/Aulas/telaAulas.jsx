import React, { useEffect, useMemo, useState } from 'react';
import { Container, Button, ButtonGroup, Dropdown, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import EditarAulas from './EditarAulas';
import RelatorioProfessoresModal from './RelatorioProfessoresModal';
import HistoricoAulasModal from './HistoricoAulasModal';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// Função auxiliar visual
const darkenColor = (color) => {
    return 'rgba(0,0,0,0.1)'; 
};

export default function AtribuicaoDeAulas() {
  // --- ESTADOS E LÓGICA ---
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
        `http://localhost:5001/api/aulas?dia=${encodeURIComponent(currentDay)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await resp.json();

      const matrix = emptyDayFactory();
      const rowIndexByHorario = {};
      horarios.forEach((h, idx) => { rowIndexByHorario[h.id] = idx; });

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

      setScheduleByDay((prev) => ({ ...prev, [currentDay]: matrix }));
      setDraftByDay((prev) => {
        if (prev[currentDay] && prev[currentDay].length) return prev;
        return { ...prev, [currentDay]: deepClone(matrix) };
      });
    };

    if (token && currentDay) loadAulasDia();
  }, [token, currentDay, horarios, columns, emptyDayFactory]);

  useEffect(() => {
    if (editMode) toast.info(`Editando horário de ${currentDay}`, { autoClose: 2500 });
  }, [currentDay, editMode]);

  // --- COMPUTED PROPERTIES ---
  const cargaProfessores = useMemo(() => {
    const contador = {};
    DAYS.forEach((dia) => {
      const matriz = (draftByDay[dia] && draftByDay[dia].length ? draftByDay[dia] : scheduleByDay[dia]) || [];
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

  // --- HANDLERS ---
  const handleEditToggle = () => {
    if (!editMode) {
      setDraftByDay((prev) => ({
        ...prev,
        [currentDay]: deepClone(prev[currentDay]?.length ? prev[currentDay] : currentSchedule),
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

  // --- SUBCOMPONENTES (Para Layout) ---
  const DaySelector = () => (
    <div className="d-flex overflow-auto pb-2" style={{ whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
        <ButtonGroup>
            {DAYS.map((d) => (
                <Button
                    key={d}
                    size="sm"
                    variant={currentDay === d ? 'primary' : 'outline-secondary'}
                    onClick={() => setCurrentDay(d)}
                    style={{ borderRadius: 20 }}
                    className="px-3"
                >
                    {d}
                </Button>
            ))}
        </ButtonGroup>
    </div>
  );

  // --- RENDERIZAÇÃO PRINCIPAL (JSX RESPONSIVO) ---
  return (
    <Container fluid className="py-3 px-2 px-md-3">
      <h3 className="text-center mb-3">Grade de Aulas</h3>

      {/* --- BARRA DE CONTROLE --- */}
      <Row className="gy-3 mb-3 align-items-center">
        <Col xs={12} lg={4} className="order-2 order-lg-1">
             <DaySelector />
        </Col>

        <Col xs={12} lg={8} className="order-1 order-lg-2">
            <div className="d-flex justify-content-end align-items-center gap-2 flex-wrap">
                {!editMode ? (
                    <Button size="sm" variant="outline-secondary" onClick={handleEditToggle} className="rounded-pill px-3">
                        ✏️ Editar
                    </Button>
                ) : (
                    <>
                        <Button size="sm" variant="primary" onClick={handleSave} className="rounded-pill px-3">
                            💾 Salvar
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={handleCancel} className="rounded-pill px-3">
                            ❌ Cancelar
                        </Button>
                    </>
                )}

                <div className="vr d-none d-md-block mx-2" style={{ height: 24 }}></div>

                {/* Desktop Buttons */}
                <div className="d-none d-md-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={handleCopy} className="rounded-pill">📋 Copiar</Button>
                    <Button size="sm" variant="outline-secondary" onClick={handlePaste} disabled={!editMode || !clipboard} className="rounded-pill">📥 Colar</Button>
                    <Button size="sm" variant="danger" onClick={handleClear} disabled={!editMode} className="rounded-pill">🧹 Limpar</Button>
                    <Button size="sm" variant="success" onClick={() => setShowRelatorio(true)} className="rounded-pill">📊 Relatório</Button>
                    <Button size="sm" variant="outline-primary" onClick={() => setShowHistorico(true)} className="rounded-pill">🕒 Histórico</Button>
                </div>

                {/* Mobile Dropdown */}
                <div className="d-md-none">
                    <Dropdown align="end">
                        <Dropdown.Toggle variant="secondary" size="sm" className="rounded-pill">
                            <i className="bi bi-three-dots-vertical"></i> Mais Ações
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={handleCopy}><i className="bi bi-clipboard me-2"></i> Copiar Grade</Dropdown.Item>
                            <Dropdown.Item onClick={handlePaste} disabled={!editMode || !clipboard}><i className="bi bi-clipboard-check me-2"></i> Colar Grade</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleClear} disabled={!editMode} className="text-danger"><i className="bi bi-eraser me-2"></i> Limpar Tudo</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => setShowRelatorio(true)}><i className="bi bi-bar-chart me-2"></i> Relatórios</Dropdown.Item>
                            <Dropdown.Item onClick={() => setShowHistorico(true)}><i className="bi bi-clock-history me-2"></i> Histórico</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </Col>
      </Row>

      {/* --- TABELA COM SCROLL --- */}
      <div className="table-responsive shadow-sm" style={{ border: '1px solid #dee2e6', borderRadius: 12, maxHeight: '75vh', overflow: 'auto', background: '#fff' }}>
        <table className="table mb-0 table-borderless" style={{ minWidth: 960, borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead className="table-light">
            <tr>
              <th style={{ position: 'sticky', left: 0, top: 0, zIndex: 3, background: '#f8f9fa', width: 120, borderBottom: '2px solid #dee2e6', borderRight: '1px solid #dee2e6' }} className="text-center align-middle py-3">
                HORÁRIO
              </th>
              {columns.map((col) => (
                <th key={col} style={{ position: 'sticky', top: 0, zIndex: 2, background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }} className="text-center py-3">
                    {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horarios.map((h, rowIdx) => (
              <tr key={h.id}>
                <td style={{ position: 'sticky', left: 0, zIndex: 1, background: '#fff', borderRight: '1px solid #dee2e6', fontWeight: 'bold', fontSize: '0.9rem' }} className="text-center align-middle">
                  {h.rotulo}
                </td>
                {columns.map((_, colIdx) => {
                  const entry = currentMatrix[rowIdx]?.[colIdx] || null;
                  const isBreak = Number(h.is_intervalo) === 1;

                  if (isBreak) {
                    return (
                      <td key={`${rowIdx}-${colIdx}`} className="text-center align-middle p-1" style={{ backgroundColor: '#f1f1f1' }}>
                        <small className="text-muted opacity-50">Intervalo</small>
                      </td>
                    );
                  }

                  return (
                    <td key={`${rowIdx}-${colIdx}`} className="p-1 align-middle border-bottom border-end-0">
                      <button
                        onClick={() => openCellModal(rowIdx, colIdx)}
                        disabled={!editMode}
                        className={`w-100 btn p-0 border-0 text-start`}
                        style={{ background: 'transparent' }}
                      >
                        {entry ? (
                          <div className="d-flex flex-column justify-content-center p-2 shadow-sm"
                            style={{
                              background: entry.teacherColor || '#e9ecef', borderRadius: 8, minHeight: 60,
                              opacity: editMode ? 0.9 : 1, borderLeft: `4px solid ${darkenColor(entry.teacherColor || '#e9ecef')}`
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#212529', lineHeight: 1.2 }}>{entry.subject}</div>
                            <div style={{ fontSize: '0.75rem', color: '#495057' }}>{entry.teacherName}</div>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center justify-content-center rounded"
                            style={{ minHeight: 60, border: editMode ? '2px dashed #dee2e6' : '1px solid transparent', backgroundColor: editMode ? '#fff' : 'transparent' }}
                          >
                            {editMode && <span className="text-muted small"><i className="bi bi-plus-lg"></i></span>}
                          </div>
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

      {/* --- MODAIS --- */}
      {modalOpen && (
        <EditarAulas
            show={modalOpen}
            onHide={() => setModalOpen(false)}
            defaults={modalCell && currentMatrix?.[modalCell.row]?.[modalCell.col] ? currentMatrix[modalCell.row][modalCell.col] : undefined}
            onConfirm={confirmCell}
            cargaProfessores={cargaProfessores}
            disciplinasProfessorMap={disciplinasProfessorMap}
        />
      )}

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