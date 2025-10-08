import React, { useEffect, useMemo, useState } from 'react';
import { Button, ButtonGroup, Container } from 'react-bootstrap';
import EditarAulas from './EditarAulas';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const COLUMNS = [
  '6º ano',
  '7º ano',
  '8º ano',
  '9º ano',
  '1ª série',
  '2ª série',
  '3ª série',
];

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

export default function AtribuicaoDeAulas() {
  const [horarios, setHorarios] = useState([]);
  const [schedule, setSchedule] = useState(
    DAYS.reduce((acc, d) => ({ ...acc, [d]: [] }), {})
  );
  const [currentDay, setCurrentDay] = useState(DAYS[0]);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState([]);
  const [clipboard, setClipboard] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCell, setModalCell] = useState(null);

  const token = localStorage.getItem('token');

  const emptyDay = useMemo(() => {
    return () => horarios.map(() => COLUMNS.map(() => null));
  }, [horarios]);

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
    const loadAulasDia = async () => {
      if (!horarios.length) return;
      const resp = await fetch(
        `http://localhost:5001/api/aulas?dia=${encodeURIComponent(currentDay)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await resp.json();
      const matrix = emptyDay();
      const rowIndexByHorario = {};
      horarios.forEach((h, idx) => {
        rowIndexByHorario[h.id] = idx;
      });

      data.forEach((a) => {
        const r = rowIndexByHorario[a.horario_id];
        const c = COLUMNS.findIndex((col) => col === a.turma);
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

      setSchedule((prev) => ({ ...prev, [currentDay]: matrix }));
      setDraft(matrix);
    };
    if (token && currentDay) loadAulasDia();
  }, [token, currentDay, horarios]);

  const handleEditToggle = () => {
    if (!editMode) {
      setDraft(deepClone(schedule[currentDay] || emptyDay()));
      setEditMode(true);
    }
  };

  const handleSave = async () => {
    const aulas = [];
    draft.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        const h = horarios[rowIdx];
        const turma = COLUMNS[colIdx];
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
        setSchedule((prev) => ({ ...prev, [currentDay]: deepClone(draft) }));
        setEditMode(false);
      })
      .catch(() => {});
  };

  const handleCancel = () => {
    setDraft(deepClone(schedule[currentDay] || emptyDay()));
    setEditMode(false);
    toast.info('Edição cancelada.');
  };

  const handleCopy = () => {
    setClipboard(deepClone(schedule[currentDay] || emptyDay()));
    toast.info(`Aulas de ${currentDay} copiadas!`);
  };

  const handlePaste = () => {
    if (editMode && clipboard) {
      setDraft(deepClone(clipboard));
      toast.success('Aulas coladas com sucesso!');
    }
  };

  const handleClear = () => {
    if (!editMode) return;
    if (window.confirm(`Limpar todas as aulas de ${currentDay}?`)) {
      setDraft(emptyDay());
      toast.warn(`As aulas de ${currentDay} foram limpas.`);
    }
  };

  const openCellModal = (row, col) => {
    if (editMode) {
      setModalCell({ row, col });
      setModalOpen(true);
    }
  };
  const confirmCell = (entry) => {
    setDraft((prev) => {
      const next = deepClone(prev);
      next[modalCell.row][modalCell.col] = entry;
      return next;
    });
    setModalOpen(false);
    setModalCell(null);
  };

  const currentMatrix = editMode ? draft : schedule[currentDay] || emptyDay();

  return (
    <Container fluid className='py-3'>
      <ToastContainer
        position='bottom-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
      <h2 className='text-center mb-4'>Aulas</h2>

      <div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3'>
        <ButtonGroup className='flex-wrap'>
          {DAYS.map((d) => (
            <Button
              key={d}
              size='sm'
              variant={currentDay === d ? 'primary' : 'outline-secondary'}
              onClick={() => setCurrentDay(d)}
              style={{ borderRadius: 999, marginRight: 6, marginBottom: 6 }}
            >
              {d}
            </Button>
          ))}
        </ButtonGroup>

        <div className='d-flex align-items-center gap-2'>
          {!editMode ? (
            <Button
              size='sm'
              variant='outline-secondary'
              onClick={handleEditToggle}
              style={{ borderRadius: 999 }}
            >
              ✏️ Editar
            </Button>
          ) : (
            <>
              <Button
                size='sm'
                variant='primary'
                onClick={handleSave}
                style={{ borderRadius: 999 }}
              >
                💾 Salvar
              </Button>
              <Button
                size='sm'
                variant='outline-secondary'
                onClick={handleCancel}
                style={{ borderRadius: 999 }}
              >
                ❌ Cancelar
              </Button>
            </>
          )}

          <div style={{ width: 1, height: 24, background: '#dee2e6' }} />

          <Button
            size='sm'
            variant='outline-secondary'
            onClick={handleCopy}
            style={{ borderRadius: 999 }}
          >
            📋 Copiar
          </Button>
          <Button
            size='sm'
            variant='outline-secondary'
            onClick={handlePaste}
            disabled={!editMode || !clipboard}
            style={{ borderRadius: 999 }}
          >
            📥 Colar
          </Button>
          <Button
            size='sm'
            variant='danger'
            onClick={handleClear}
            disabled={!editMode}
            style={{ borderRadius: 999 }}
          >
            🧹 Limpar
          </Button>
        </div>
      </div>

      <div
        className='table-responsive'
        style={{
          border: '1px solid #dee2e6',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <table className='table mb-0' style={{ minWidth: 960 }}>
          <thead className='table-light'>
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
              {COLUMNS.map((col) => (
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
                {COLUMNS.map((_, colIdx) => {
                  const entry = currentMatrix[rowIdx]?.[colIdx] || null;
                  const isBreak = Number(h.is_intervalo) === 1;
                  if (isBreak)
                    return (
                      <td
                        key={`${rowIdx}-${colIdx}`}
                        className='text-center text-muted'
                      >
                        —
                      </td>
                    );
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
                            className='text-muted'
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
      />
    </Container>
  );
}
