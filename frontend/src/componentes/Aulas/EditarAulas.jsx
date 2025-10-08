import React, { useEffect, useMemo, useState } from 'react';
import { Button, Form, Alert, Modal } from 'react-bootstrap';
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

export default function EditarAulas({ show, onHide, onConfirm, defaults }) {
  const [listaDisciplinas, setListaDisciplinas] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');

  const initialSubjectId = defaults?.subjectId ?? defaults?.disciplina_id ?? '';
  const initialSubjectName = defaults?.subject ?? '';

  const [subjectId, setSubjectId] = useState(initialSubjectId);
  const [subject, setSubject] = useState(initialSubjectName);

  const [teacherId, setTeacherId] = useState(defaults?.teacherId || '');
  const [teacherName, setTeacherName] = useState(defaults?.teacherName || '');

  const [showListaProfessoresModal, setShowListaProfessoresModal] =
    useState(false);

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

  useEffect(() => {
    if (show) {
      setMensagemErro('');

      setSubjectId(defaults?.subjectId ?? defaults?.disciplina_id ?? '');
      setSubject(defaults?.subject ?? '');

      setTeacherId(defaults?.teacherId || '');
      setTeacherName(defaults?.teacherName || '');
    }
  }, [show, defaults]);

  const teacherColor = useMemo(() => {
    if (!teacherId) return '';
    const existing = getColorForProfessor(teacherId);
    if (existing) return existing;

    const used = Object.values(getStoredColorMap());
    const color = pickRandomColor(used);
    setStoredColor(teacherId, color);
    return color;
  }, [teacherId]);

  const handleSelectProfessor = (professor) => {
    setTeacherId(professor.id);
    setTeacherName(professor.nome);
    setShowListaProfessoresModal(false);
  };

  const handleChangeDisciplina = (e) => {
    const id = e.target.value;
    setSubjectId(id);
    const sel = listaDisciplinas.find((d) => String(d.id) === String(id));
    setSubject(sel?.nome || '');
  };

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

    onConfirm?.({
      subjectId,
      subject,
      teacherId,
      teacherName,
      teacherColor: teacherColor || pickRandomColor(),
    });

    onHide?.();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Selecionar Disciplina e Professor</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {mensagemErro && <Alert variant='danger'>{mensagemErro}</Alert>}

        <Form onSubmit={handleSubmit}>
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

          {/* Preview da cor do professor */}
          {teacherId && (
            <div className='mb-3' style={{ fontSize: 12, color: '#6c757d' }}>
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
          )}

          <div className='d-flex justify-content-end gap-2 mt-3'>
            <Button variant='outline-secondary' onClick={onHide} type='button'>
              Cancelar
            </Button>
            <Button variant='success' type='submit'>
              Confirmar
            </Button>
          </div>
        </Form>

        <ListaProfessoresModal
          show={showListaProfessoresModal}
          onHide={() => setShowListaProfessoresModal(false)}
          onSelectProfessor={handleSelectProfessor}
        />
      </Modal.Body>
    </Modal>
  );
}
