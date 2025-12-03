import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';

export const ModalGerarRelatorio = ({ show, onHide }) => {
  const [turmasSelecionadas, setTurmasSelecionadas] = useState([]);
  const [listaTurmas, setListaTurmas] = useState([]);
  const [listaAnosLetivos, setListaAnosLetivos] = useState([]);
  const [listaStatus, setListaStatus] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token');

      try {
        const [turmasRes, anosRes, statusRes] = await Promise.all([
          axios.get(`http://localhost:5001/api/atendimentos/turmas/listar`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `http://localhost:5001/api/atendimentos/turmas/anos-letivos`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(`http://localhost:5001/api/atendimentos/turmas/status`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setListaTurmas(turmasRes.data);
        setListaAnosLetivos(anosRes.data);
        setListaStatus(statusRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    })();
  }, []);

  const handleCheckboxChange = (turmaId) => {
    setTurmasSelecionadas((prev) => {
      if (prev.includes(turmaId)) {
        return prev.filter((id) => id !== turmaId);
      } else {
        return [...prev, turmaId];
      }
    });
  };

  const handleSelectAll = () => {
    if (turmasSelecionadas.length === listaTurmas.length) {
      setTurmasSelecionadas([]);
    } else {
      setTurmasSelecionadas(listaTurmas.map((turma) => turma.id));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const payload = {
      turmas:
        turmasSelecionadas.length > 0
          ? turmasSelecionadas.join(',')
          : undefined,
      ano_letivo: formData.get('ano_letivo') || undefined,
      status: formData.get('status') || undefined,
    };

    // Remover campos undefined
    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key]
    );

    try {
      setLoading(true);

      const token = localStorage.getItem('token');

      const response = await axios.get(
        'http://localhost:5001/api/atendimentos/relatorios/turmas/gerar',
        {
          params: payload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      if (response.data.size === 0) {
        toast.error('Relatório gerado está vazio.');
        return;
      }

      // Criar blob com tipo correto
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Criar link temporário e fazer download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `Relatorio-Atendimentos-${new Date().toISOString().split('T')[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();

      // Limpar recursos
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Relatório gerado com sucesso!');
      handleClose();
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTurmasSelecionadas([]);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>Gerar Relatório de Turmas</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p className='text-muted mb-4'>
            Selecione os filtros desejados para gerar o relatório. Nenhum filtro
            é obrigatório.
          </p>

          <Row className='mb-3'>
            <Form.Group as={Col} md={12}>
              <div className='d-flex justify-content-between align-items-center mb-2'>
                <Form.Label className='mb-0'>Turmas</Form.Label>
                <Button
                  variant='link'
                  size='sm'
                  onClick={handleSelectAll}
                  className='text-decoration-none p-0'
                  disabled={loading}
                >
                  {turmasSelecionadas.length === listaTurmas.length
                    ? 'Desmarcar todas'
                    : 'Selecionar todas'}
                </Button>
              </div>
              <div
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '10px',
                }}
              >
                {listaTurmas.length > 0 ? (
                  listaTurmas.map((turma) => (
                    <Form.Check
                      key={turma.id}
                      type='checkbox'
                      id={`turma-${turma.id}`}
                      label={turma.nome}
                      checked={turmasSelecionadas.includes(turma.id)}
                      onChange={() => handleCheckboxChange(turma.id)}
                      className='mb-2'
                      disabled={loading}
                    />
                  ))
                ) : (
                  <p className='text-muted mb-0'>Nenhuma turma disponível</p>
                )}
              </div>
              <Form.Text className='text-muted'>
                {turmasSelecionadas.length} turma(s) selecionada(s)
              </Form.Text>
            </Form.Group>
          </Row>

          <Row className='mb-3'>
            <Form.Group as={Col} md={6} controlId='anoLetivo'>
              <Form.Label>Ano Letivo</Form.Label>
              <Form.Select name='ano_letivo' defaultValue='' disabled={loading}>
                <option value=''>Todos os anos</option>
                {listaAnosLetivos.map((ano) => (
                  <option key={ano.ano_letivo} value={ano.ano_letivo}>
                    {ano.ano_letivo}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group as={Col} md={6} controlId='status'>
              <Form.Label>Status da Turma</Form.Label>
              <Form.Select name='status' defaultValue='' disabled={loading}>
                <option value=''>Todos os status</option>
                {listaStatus.map((status) => (
                  <option key={status.status} value={status.status}>
                    {status.status}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type='submit' variant='primary' disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as='span'
                  animation='border'
                  size='sm'
                  role='status'
                  aria-hidden='true'
                  className='me-2'
                />
                Gerando...
              </>
            ) : (
              'Gerar Relatório'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
