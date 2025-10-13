import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Modal,
  Row,
} from 'react-bootstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import TurmaService from '../../services/Turma';

function FormularioMatricula({
  show,
  onHide,
  onMatriculaRealizada,
  modoEdicao = false,
  matriculaEdicao = null,
}) {
  const [dados, setDados] = useState({
    aluno_id: '',
    turma_id: null,
    responsavel_id: '',
    observacoes: '',
    data_matricula: new Date().toISOString().split('T')[0],
    ano_letivo: new Date().getFullYear(),
    turno: '',
  });

  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [matriculasExistentes, setMatriculasExistentes] = useState([]);
  const [erro, setErro] = useState('');
  const [validados, setValidados] = useState({});

  const carregarDados = async () => {
    try {
      const [alunoRes, turmaRes, respRes, matriculasRes] = await Promise.all([
        fetch('http://localhost:5001/api/aluno/allaluno').then((res) =>
          res.json()
        ),
        TurmaService.findAll(),
        fetch('http://localhost:5001/api/responsavel/allresponsavel').then(
          (res) => res.json()
        ),
        fetch('http://localhost:5001/api/matricula/allmatricula').then((res) =>
          res.json()
        ),
      ]);

      setAlunos(alunoRes);
      setTurmas(turmaRes);
      setResponsaveis(respRes);
      setMatriculasExistentes(matriculasRes);
    } catch (e) {
      setErro('Erro ao carregar dados.');
    }
  };

  useEffect(() => {
    if (show) {
      carregarDados();
    } else {
      setDados({
        aluno_id: '',
        turma_id: null,
        responsavel_id: '',
        observacoes: '',
        data_matricula: new Date().toISOString().split('T')[0],
        ano_letivo: new Date().getFullYear(),
        turno: '',
      });
      setErro('');
      setValidados({});
    }
  }, [show]);

  useEffect(() => {
    if (
      show &&
      modoEdicao &&
      matriculaEdicao &&
      alunos.length > 0 &&
      turmas.length > 0 &&
      responsaveis.length > 0
    ) {
      setDados({
        aluno_id: matriculaEdicao.aluno?.id || '',
        turma_id: matriculaEdicao.turma?.id || null,
        responsavel_id: matriculaEdicao.responsavel?.id || '',
        observacoes: matriculaEdicao.observacoes || '',
        data_matricula:
          matriculaEdicao.data_matricula?.split('T')[0] ||
          new Date().toISOString().split('T')[0],
        ano_letivo: matriculaEdicao.ano_letivo || new Date().getFullYear(),
        turno: matriculaEdicao.turno || '',
      });
    }
  }, [show, modoEdicao, matriculaEdicao, alunos, turmas, responsaveis]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selected, { name }) => {
    setDados((prev) => ({ ...prev, [name]: selected ? selected.value : '' }));
  };

  const handleSubmit = async () => {
    setErro('');

    const camposObrigatorios = ['aluno_id', 'ano_letivo', 'turno'];
    const erros = {};
    camposObrigatorios.forEach((campo) => {
      if (!dados[campo]) erros[campo] = true;
    });

    if (Object.keys(erros).length > 0) {
      setValidados(erros);
      const msg = 'Preencha todos os campos obrigatórios.';
      setErro(msg);
      toast.error(msg);
      return;
    }

    if (!modoEdicao) {
      const jaMatriculado = matriculasExistentes.some(
        (m) => m.aluno_id === dados.aluno_id && m.turma_id === dados.turma_id
      );
      if (jaMatriculado) {
        const msg = 'Este aluno já está matriculado nesta turma.';
        setErro(msg);
        toast.error(msg);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const url = modoEdicao
        ? `http://localhost:5001/api/matricula/matricula/${matriculaEdicao.id}`
        : `http://localhost:5001/api/matricula/cadastrarmatricula`;

      const method = modoEdicao ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...dados, status: 'ativa' }),
      });

      const resJson = await response.json();

      if (response.ok) {
        toast.success(
          `Matrícula ${modoEdicao ? 'atualizada' : 'cadastrada'} com sucesso!`
        );
        onHide();
      } else {
        const msg = resJson.message || 'Erro ao salvar matrícula.';
        toast.error(msg);
        setErro(msg);
      }
    } catch (e) {
      console.error('Erro de requisição:', e);
      toast.error('Erro na requisição.');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>
          {modoEdicao ? 'Editar Matrícula' : 'Cadastrar Matrícula'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          {erro && <Alert variant='danger'>{erro}</Alert>}
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Aluno *</Form.Label>
                  <Select
                    name='aluno_id'
                    value={
                      alunos.find((a) => a.id === dados.aluno_id) && {
                        value: dados.aluno_id,
                        label: alunos.find((a) => a.id === dados.aluno_id)
                          ?.nome,
                      }
                    }
                    onChange={handleSelectChange}
                    options={alunos.map((a) => ({
                      value: a.id,
                      label: a.nome,
                    }))}
                    placeholder='Selecione o aluno'
                    className={validados.aluno_id ? 'is-invalid' : ''}
                  />
                </Form.Group>
              </Col>
              {/* <Col md={6}>
                <Form.Group>
                  <Form.Label>Turma *</Form.Label>
                  <Select
                    name='turma_id'
                    value={
                      turmas.find((t) => t.id === dados.turma_id) && {
                        value: dados.turma_id,
                        label: turmas.find((t) => t.id === dados.turma_id)
                          ?.nome,
                      }
                    }
                    onChange={handleSelectChange}
                    options={turmas.map((t) => ({
                      value: t.id,
                      label: t.nome,
                    }))}
                    placeholder='Selecione a turma'
                    className={validados.turma_id ? 'is-invalid' : ''}
                  />
                </Form.Group>
              </Col> */}
            </Row>

            <Row className='mt-3'>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Responsável</Form.Label>
                  <Select
                    name='responsavel_id'
                    value={
                      responsaveis.find(
                        (r) => r.id === dados.responsavel_id
                      ) && {
                        value: dados.responsavel_id,
                        label: responsaveis.find(
                          (r) => r.id === dados.responsavel_id
                        )?.nome,
                      }
                    }
                    onChange={handleSelectChange}
                    options={responsaveis.map((r) => ({
                      value: r.id,
                      label: r.nome,
                    }))}
                    placeholder='Opcional'
                    isClearable
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Observações</Form.Label>
                  <Form.Control
                    as='textarea'
                    name='observacoes'
                    value={dados.observacoes}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className='mt-3'>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Data da Matrícula</Form.Label>
                  <Form.Control
                    type='date'
                    name='data_matricula'
                    value={dados.data_matricula}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Ano Letivo *</Form.Label>
                  <Form.Control
                    type='number'
                    name='ano_letivo'
                    value={dados.ano_letivo}
                    onChange={handleChange}
                    isInvalid={validados.ano_letivo}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Turno *</Form.Label>
                  <Form.Select
                    name='turno'
                    value={dados.turno}
                    onChange={handleChange}
                    isInvalid={validados.turno}
                  >
                    <option value=''>Selecione o turno</option>
                    <option value='manhã'>Manhã</option>
                    <option value='tarde'>Tarde</option>
                    <option value='noite'>Noite</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Button className='mt-4' variant='primary' onClick={handleSubmit}>
              {modoEdicao ? 'Salvar Alterações' : 'Salvar Matrícula'}
            </Button>
          </Form>
        </Container>
      </Modal.Body>
    </Modal>
  );
}

export default FormularioMatricula;
