import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Alert, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ListaProfessoresModal from '../professor/ListaProfessores';
import DisciplinaService from '../../services/Disciplina';

const COLOR_PALETTE = [
  '#FDE047',
  '#86EFAC',
  '#93C5FD',
  '#FCA5A5',
  '#D8B4FE',
  '#FDBA74',
  '#99F6E4',
  '#F9A8D4',
  '#A7F3D0',
  '#BFDBFE',
];

function getStoredColorMap() {
  try {
    const raw = localStorage.getItem('profColorMap');
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function setStoredColor(profId, color) {
  const map = getStoredColorMap();
  map[profId] = color;
  localStorage.setItem('profColorMap', JSON.stringify(map));
}

function getColorForProfessor(profId) {
  const map = getStoredColorMap();
  return map?.[profId] || null;
}

function pickRandomColor(excludeColors = []) {
  const candidates = COLOR_PALETTE.filter((c) => !excludeColors.includes(c));
  if (candidates.length === 0)
    return COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function EditarAulas({
  show,
  onHide,
  onConfirm,
  defaults,
  cargaProfessores = {},        // { [profId]: quantidadeDeAulas }
  disciplinasProfessorMap = {}, // { [profId]: ["Matemática", "Física", ...] }
}) {
  const [listaDisciplinas, setListaDisciplinas] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');

  // defaults vêm da célula atual
  const initialSubjectId = defaults?.subjectId ?? defaults?.disciplina_id ?? '';
  const initialSubjectName = defaults?.subject ?? '';

  const [subjectId, setSubjectId] = useState(initialSubjectId);
  const [subject, setSubject] = useState(initialSubjectName);

  const [teacherId, setTeacherId] = useState(defaults?.teacherId || '');
  const [teacherName, setTeacherName] = useState(defaults?.teacherName || '');

  const [showListaProfessoresModal, setShowListaProfessoresModal] =
    useState(false);

  // Carrega disciplinas ao abrir modal
  useEffect(() => {
    const fetchDisciplinas = async () => {
      try {
        const disciplinas = await DisciplinaService.findAll();
        const list = Array.isArray(disciplinas) ? disciplinas : [];
        setListaDisciplinas(list);

        if (!initialSubjectId && initialSubjectName) {
          const found = list.find(
            (d) => String(d.nome) === String(initialSubjectName)
          );
          if (found) {
            setSubjectId(found.id);
            setSubject(found.nome);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar disciplinas:', error);
        setListaDisciplinas([]);
      }
    };

    if (show) fetchDisciplinas();
  }, [show]);

  // Resetar estado ao abrir
  useEffect(() => {
    if (show) {
      setMensagemErro('');

      setSubjectId(defaults?.subjectId ?? defaults?.disciplina_id ?? '');
      setSubject(defaults?.subject ?? '');

      setTeacherId(defaults?.teacherId || '');
      setTeacherName(defaults?.teacherName || '');
    }
  }, [show, defaults]);

  // Cor fixa por professor
  const teacherColor = useMemo(() => {
    if (!teacherId) return '';
    const existing = getColorForProfessor(teacherId);
    if (existing) return existing;

    const used = Object.values(getStoredColorMap());
    const color = pickRandomColor(used);
    setStoredColor(teacherId, color);
    return color;
  }, [teacherId]);

  // Carga do professor
  const cargaAtualProfessor = useMemo(() => {
    if (!teacherId) return 0;
    return cargaProfessores[teacherId] || 0;
  }, [teacherId, cargaProfessores]);

  // Checar se disciplina está entre as habilitações conhecidas do professor
  const compatibilidadeOk = useMemo(() => {
    if (!teacherId || !subject) return true;
    const lista = disciplinasProfessorMap[teacherId] || [];
    return lista.some(
      (disc) => String(disc).toLowerCase() === String(subject).toLowerCase()
    );
  }, [teacherId, subject, disciplinasProfessorMap]);

  // Seleciona professor
  const handleSelectProfessor = (professor) => {
    setTeacherId(professor.id);
    setTeacherName(professor.nome);
    setShowListaProfessoresModal(false);
  };

  // Seleciona disciplina
  const handleChangeDisciplina = (e) => {
    const id = e.target.value;
    setSubjectId(id);
    const sel = listaDisciplinas.find((d) => String(d.id) === String(id));
    setSubject(sel?.nome || '');
  };

  // Confirmar aula
  const handleSubmit = (e) => {
    e?.preventDefault?.();
    setMensagemErro('');

    if (!subjectId) {
      setMensagemErro('Selecione a disciplina.');
      return;
    }
    if (!teacherId || !teacherName) {
      setMensagemErro('Selecione o professor.');
      return;
    }

    // Se o professor não bate com a disciplina, agora NÃO bloqueia
    if (!compatibilidadeOk) {
      toast.warning(
        `Aviso: ${teacherName} não está marcado como habilitado para ${subject}.`,
        { autoClose: 5000 }
      );
      // segue adiante mesmo assim
    }

    onConfirm?.({
      subjectId,
      subject,
      teacherId,
      teacherName,
      teacherColor: teacherColor || pickRandomColor(),
    });

    onHide?.();
  };

  // Marcar aula vaga
  const handleVaga = () => {
    onConfirm?.(null); // célula vira null
    onHide?.();
    toast.info('Aula marcada como vaga.');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Selecionar Disciplina e Professor</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Erros obrigatórios tipo "falta disciplina" ou "falta professor" */}
        {mensagemErro && <Alert variant='danger'>{mensagemErro}</Alert>}

        {/* Alerta visual de compatibilidade (só informativo, não bloqueia) */}
        {!compatibilidadeOk && teacherId && subject && (
          <Alert variant='warning' className='py-2'>
            O professor <b>{teacherName}</b> não está marcado como habilitado
            para <b>{subject}</b>. Você pode continuar mesmo assim.
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* DISCIPLINA */}
          <Form.Group controlId='formDisciplina' className='mb-3'>
            <Form.Label>Disciplina</Form.Label>
            <Form.Select
              name='subjectId'
              value={subjectId}
              onChange={handleChangeDisciplina}
            >
              <option value=''>Selecione uma Disciplina</option>
              {listaDisciplinas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* PROFESSOR */}
          <Form.Group controlId='formProfessor' className='mb-2'>
            <Form.Label>Professor</Form.Label>
            <div className='d-flex align-items-center'>
              <Form.Control
                type='text'
                placeholder='Selecione o professor'
                value={teacherName}
                readOnly
                style={{ flex: 1, backgroundColor: '#e9ecef' }}
              />
              <Button
                variant='secondary'
                onClick={() => setShowListaProfessoresModal(true)}
                className='ms-2'
              >
                <i className='bi bi-search' />
              </Button>
            </div>
          </Form.Group>

          {/* Info do professor: carga e cor */}
          {teacherId && (
            <div
              className='mb-2'
              style={{ fontSize: 12, color: '#6c757d', lineHeight: 1.4 }}
            >
              <div>
                Aulas atribuídas a <b>{teacherName}</b>:{' '}
                <b>{cargaAtualProfessor}</b>
              </div>

              <div className='d-flex align-items-center'>
                Cor do professor:
                <span
                  style={{
                    display: 'inline-block',
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    marginLeft: 8,
                    border: '1px solid rgba(0,0,0,.1)',
                    background: teacherColor || '#ddd',
                    verticalAlign: 'middle',
                  }}
                />
              </div>
            </div>
          )}

          {/* Botões */}
          <div className='d-flex justify-content-end gap-2 mt-3'>
            <Button variant='outline-secondary' onClick={onHide} type='button'>
              Cancelar
            </Button>

            <Button
              variant='warning'
              type='button'
              onClick={handleVaga}
              style={{ color: '#000', fontWeight: 600 }}
            >
              Aula Vaga
            </Button>

            <Button variant='success' type='submit'>
              Confirmar
            </Button>
          </div>
        </Form>

        {/* Modal de seleção de professor */}
        <ListaProfessoresModal
          show={showListaProfessoresModal}
          onHide={() => setShowListaProfessoresModal(false)}
          onSelectProfessor={handleSelectProfessor}
        />
      </Modal.Body>
    </Modal>
  );
}
