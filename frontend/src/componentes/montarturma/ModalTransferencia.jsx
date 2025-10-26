import { useCallback, useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
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

  const handleTransfer = useCallback(async () => {
    if (!formData.targetTurmaId || !selectedStudents?.length) {
      toast.error('Selecione uma turma de destino');
      return;
    }

    try {
      setIsTransferring(true);
      const studentIds = selectedStudents.map((student) => student.aluno_id);

      await TurmaService.transferStudents(
        sourceTurma.id,
        formData.targetTurmaId,
        studentIds
      );

      toast.success(
        `Transferência realizada com sucesso! ${studentIds.length} alunos transferidos.`
      );
      onTransferSuccess();
      onHide();
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
  ]);

  const handleClose = useCallback(() => {
    setFormData({ targetTurmaId: '' });
    onHide();
  }, [onHide]);

  useEffect(() => {
    if (show && sourceTurma) {
      getTargetTurmas();
    }
  }, [show, sourceTurma, getTargetTurmas]);

  const selectedTargetTurmaData = targetTurmas.find(
    (t) => t.id === formData.targetTurmaId
  );

  return (
    <Modal show={show} onHide={handleClose} size='xl'>
      <Modal.Header closeButton>
        <Modal.Title>Transferir Alunos de Ano</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {sourceTurma && (
          <Row className='mb-4'>
            <Col>
              <h5>Turma de Origem</h5>
              <div className='p-3 bg-light rounded'>
                <strong>{sourceTurma.nome}</strong> - {sourceTurma.ano_letivo}
                <span className='badge bg-success ms-2'>
                  {sourceTurma.status}
                </span>
              </div>
            </Col>
          </Row>
        )}

        <Row className='mb-4'>
          <Col>
            <h5>Alunos Selecionados ({selectedStudents?.length || 0})</h5>
            {selectedStudents?.length > 0 && (
              <Table striped bordered hover size='sm'>
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
            )}
          </Col>
        </Row>

        <Row className='mb-4'>
          <Col>
            <h5>Selecionar Turma de Destino</h5>
            <Form.Group>
              <Form.Label>Turma do Ano Seguinte (Não Iniciada)</Form.Label>
              {isLoading ? (
                <div className='d-flex align-items-center'>
                  <Spinner size='sm' className='me-2' />
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
                  <option value=''>Selecione a turma de destino</option>
                  {targetTurmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.ano_letivo} ({turma.periodo} -{' '}
                      {turma.semestre}º ano)
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>

            {selectedTargetTurmaData && (
              <div className='mt-3 p-3 bg-info bg-opacity-10 rounded'>
                <h6>Turma de Destino Selecionada:</h6>
                <p className='mb-1'>
                  <strong>{selectedTargetTurmaData.nome}</strong> -{' '}
                  {selectedTargetTurmaData.ano_letivo}
                </p>
                <p className='mb-1'>
                  Período: {selectedTargetTurmaData.periodo} | Série:{' '}
                  {selectedTargetTurmaData.semestre}º ano
                </p>
                <p className='mb-0'>
                  Status:{' '}
                  <span className='badge bg-warning'>
                    {selectedTargetTurmaData.status}
                  </span>
                </p>
              </div>
            )}
          </Col>
        </Row>

        {targetTurmas.length === 0 && !isLoading && (
          <Row>
            <Col>
              <div className='alert alert-warning'>
                <strong>Atenção:</strong> Não foram encontradas turmas "Não
                iniciadas" para o ano seguinte (
                {parseInt(sourceTurma?.ano_letivo || 0) + 1}).
                <br />É necessário criar uma turma com status "Não iniciada"
                para o ano seguinte antes de realizar a transferência.
              </div>
            </Col>
          </Row>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant='secondary'
          onClick={handleClose}
          disabled={isTransferring}
        >
          Cancelar
        </Button>
        <Button
          variant='primary'
          onClick={handleTransfer}
          disabled={
            !formData.targetTurmaId ||
            isTransferring ||
            targetTurmas.length === 0
          }
        >
          {isTransferring ? (
            <>
              <Spinner
                as='span'
                animation='border'
                size='sm'
                className='me-2'
              />
              Transferindo...
            </>
          ) : (
            `Transferir ${selectedStudents?.length || 0} Alunos`
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
