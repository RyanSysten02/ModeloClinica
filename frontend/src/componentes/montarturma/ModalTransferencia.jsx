import { useCallback, useEffect, useState } from 'react';
import {
  Accordion,
  Alert,
  Button,
  Col,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import TurmaService from '../../services/Turma';

export const ModalTransferencia = ({
  show,
  onHide,
  sourceTurma,
  selectedStudents,
  onTransferSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [targetTurmas, setTargetTurmas] = useState([]);
  const [formData, setFormData] = useState({
    targetTurmaId: '',
  });

  const getTargetTurmas = useCallback(async () => {
    // ... (lógica inalterada) ...
    if (!sourceTurma?.ano_letivo) return;
    try {
      setIsLoading(true);
      const nextYear = parseInt(sourceTurma.ano_letivo) + 1;
      const turmas = await TurmaService.findByStatusAndYear(
        'Não iniciada',
        nextYear.toString()
      );
      setTargetTurmas(turmas);
    } catch (error) {
      console.error('Erro ao buscar turmas de destino:', error);
      toast.error('Erro ao buscar turmas de destino');
    } finally {
      setIsLoading(false);
    }
  }, [sourceTurma?.ano_letivo]);

  // useEffect para buscar turmas (sem alterações)
  useEffect(() => {
    if (show && sourceTurma) {
      getTargetTurmas();
    }
    // Limpa a seleção ao fechar o modal
    if (!show) {
       setFormData({ targetTurmaId: '' });
    }
  }, [show, sourceTurma, getTargetTurmas]);

  const handleTransfer = useCallback(async () => {
    // ... (lógica inalterada) ...
    if (!formData.targetTurmaId || !selectedStudents?.length) {
      toast.error('Selecione uma turma de destino');
      return;
    }
    try {
      setIsTransferring(true);
      const studentIds = selectedStudents.map((student) => student.aluno_id);
      const selectedTurma = targetTurmas.find(
        (t) => t.id === parseInt(formData.targetTurmaId, 10)
      );
      await TurmaService.transferStudents(
        sourceTurma.id,
        formData.targetTurmaId,
        studentIds
      );
      const turmaNome = selectedTurma?.nome || 'turma desconhecida';
      const turmaAno = selectedTurma?.ano_letivo || '';
      toast.success(
        `Alunos transferidos para a turma ${turmaNome} de ${turmaAno}.`
      );
      onTransferSuccess();
      setTimeout(() => {
        onHide();
      }, 500);
    } catch (error) {
      console.error('Erro na transferência:', error);
      const message =
        error?.response?.data?.message || 'Erro ao transferir alunos';
      toast.error(message);
    } finally {
      setIsTransferring(false);
    }
  }, [
    formData.targetTurmaId,
    selectedStudents,
    sourceTurma?.id,
    onTransferSuccess,
    onHide,
    targetTurmas,
  ]);

  const handleClose = useCallback(() => {
    // Limpa o formulário e fecha
    setFormData({ targetTurmaId: '' });
    onHide();
  }, [onHide]);

  const selectedTargetTurmaData = targetTurmas.find(
    (t) => t.id === parseInt(formData.targetTurmaId, 10)
  );

  return (
    // ===================================================================
    // 1. ADICIONAR a propriedade 'centered'
    // ===================================================================
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Transferir Alunos de Ano</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Info Turma Origem (sem alterações) */}
        {sourceTurma && (
          <Row className="mb-4">
            <Col>
              <h5>Turma de Origem</h5>
              <div className="p-3 bg-light rounded">
                <strong>{sourceTurma.nome}</strong> - {sourceTurma.ano_letivo}
                <span className="badge bg-success ms-2">
                  {sourceTurma.status}
                </span>
              </div>
            </Col>
          </Row>
        )}

        {/* LISTA DE ALUNOS COM ACORDEÃO */}
        <Row className="mb-4">
          <Col>
            <h5>Alunos Selecionados ({selectedStudents?.length || 0})</h5>
            {selectedStudents?.length > 0 && sourceTurma && (
              // ===================================================================
              // 2. REMOVER 'defaultActiveKey' para começar fechado
              // ===================================================================
              <Accordion className="mt-2">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                     <span className="fw-bold">{sourceTurma.nome}</span>
                     <span className="ms-2 text-muted">({selectedStudents.length} alunos)</span>
                  </Accordion.Header>
                  <Accordion.Body className="p-0">
                    <Table striped bordered hover size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nome</th>
                          <th>Ano Letivo Atual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudents.map((student, index) => (
                          <tr key={student.aluno_id || index}>
                            <td>{student.aluno_id}</td>
                            <td>{student.aluno_nome}</td>
                            <td>{student.ano_letivo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            )}
          </Col>
        </Row>

        {/* Seleção da Turma de Destino (sem alterações) */}
        <Row className="mb-4">
          <Col>
            <h5>Selecionar Turma de Destino</h5>
            <Form.Group>
              <Form.Label>Turma do Ano Seguinte (Não Iniciada)</Form.Label>
              {isLoading ? (
                <div className="d-flex align-items-center">
                  <Spinner size="sm" className="me-2" />
                  Carregando turmas...
                </div>
              ) : (
                <Form.Select
                  value={formData.targetTurmaId}
                  onChange={(e) => {
                    const turmaId = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      targetTurmaId: turmaId,
                    }));
                  }}
                  disabled={isLoading}
                >
                  <option value="">Selecione a turma de destino</option>
                  {targetTurmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.ano_letivo} ({turma.periodo} -{' '}
                      {turma.semestre}º ano)
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
          </Col>
        </Row>

        {/* MENSAGEM DE CONFIRMAÇÃO (sem alterações) */}
        {selectedTargetTurmaData && (
          <Alert variant="warning">
            <Alert.Heading>Confirmação</Alert.Heading>
            Deseja realmente transferir os{' '}
            <strong>{selectedStudents.length} alunos</strong> da turma{' '}
            <strong>{sourceTurma?.nome} ({sourceTurma?.ano_letivo})</strong>{' '}
            para a turma{' '}
            <strong>
              {selectedTargetTurmaData.nome} (
              {selectedTargetTurmaData.ano_letivo})
            </strong>
            ?
          </Alert>
        )}

        {/* Aviso de Nenhuma Turma Encontrada (sem alterações) */}
        {targetTurmas.length === 0 && !isLoading && (
          <Row>
            <Col>
              <div className="alert alert-warning">
                <strong>Atenção:</strong> Não foram encontradas turmas "Não
                iniciadas" para o ano seguinte (
                {parseInt(sourceTurma?.ano_letivo || 0) + 1}).
              </div>
            </Col>
          </Row>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isTransferring}
        >
          Cancelar
        </Button>

        {/* BOTÃO SEM TIMER (sem alterações) */}
        <Button
          variant="primary"
          onClick={handleTransfer}
          disabled={
            !formData.targetTurmaId ||
            isTransferring ||
            targetTurmas.length === 0
          }
        >
          {isTransferring ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Transferindo...
            </>
          ) : (
            `Confirmar Transferência`
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};