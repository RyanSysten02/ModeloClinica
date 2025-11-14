import { useState, useEffect } from 'react';
import {
  Container,
  Table,
  Button,
  Form,
  Row,
  Col,
  Badge,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import FormularioAtendimento from './FormularioAtendimento';
import axios from 'axios';
import { toast } from 'react-toastify';

const IniciarAtendimento = ({ onSelectProfessor }) => {
  const [atendimentos, setAtendimentos] = useState([]);
  const [handleListaAtendimentos, setHandleListaAtendimentos] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [dataInicioPeriodoAtendimento, setDataInicioPeriodoAtendimento] =
    useState('');
  const [dataFimPeriodoAtendimento, setDataFimPeriodoAtendimento] =
    useState('');
  const [nomeAtendimento, setNomeAtendimento] = useState('');
  const [editarAtendimentoFormFields, setEditarAtendimentoFormFields] =
    useState(null);
  const navigate = useNavigate();

  const BG_BADGES_BY_STATUS = {
    1: 'success',
    2: 'danger',
    3: 'primary',
    4: 'warning',
    5: 'secondary',
  };

  const deletarAtendimento = async (id) => {
    const token = localStorage.getItem('token');

    const response = await axios.delete(
      `http://localhost:5001/api/atendimentos/${id}/excluir`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    toast.success(response.data.message);
    setHandleListaAtendimentos(!handleListaAtendimentos);
  };

  const editarAtendimentoExistente = async (id) => {
    setEditarAtendimentoFormFields(
      atendimentos.find((at) => parseInt(at.id) === parseInt(id))
    );
    setShowCadastroModal(true);
  };

  const fetchAtendimentos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMensagemErro('Token não encontrado. Faça login novamente.');
        navigate('/login');
        return;
      }

      const response = await fetch(
        'http://localhost:5001/api/atendimentos/listar',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAtendimentos(data);
      } else {
        setMensagemErro('Erro ao carregar os funcionários.');
      }
    } catch (error) {
      setMensagemErro('Erro ao conectar com o servidor.');
    }
  };

  useEffect(() => {
    fetchAtendimentos();
  }, [handleListaAtendimentos]);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMensagemErro('Token não encontrado. Faça login novamente.');
        navigate('/login');
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/atendimentos/listar?nome=${nomeAtendimento}&dataInicio=${dataInicioPeriodoAtendimento}&dataFim=${dataFimPeriodoAtendimento}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAtendimentos(data);
        setMensagemErro('');
      } else {
        setMensagemErro('Erro ao carregar os funcionários.');
      }
    } catch (error) {
      setMensagemErro('Erro ao conectar com o servidor.');
    }
  };

  return (
    <Container>
      <h1 className='mt-4'>Listar Atendimentos</h1>
      <div>
        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Data */}
            <Col md={6}>
              <Form.Group className='mb-3 text-start'>
                <Form.Label>Nome do Atendido</Form.Label>
                <Form.Control
                  type='text'
                  name='data'
                  value={nomeAtendimento}
                  onChange={(e) => setNomeAtendimento(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className='mb-3 text-start'>
                <Form.Label>Data Inicial Atendimento</Form.Label>
                <Form.Control
                  type='date'
                  name='data'
                  value={dataInicioPeriodoAtendimento}
                  onChange={(e) =>
                    setDataInicioPeriodoAtendimento(e.target.value)
                  }
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className='mb-3 text-start'>
                <Form.Label>Data Final Atendimento</Form.Label>
                <Form.Control
                  type='date'
                  name='data'
                  value={dataFimPeriodoAtendimento}
                  onChange={(e) => setDataFimPeriodoAtendimento(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </div>
      <div className='d-flex align-items-center justify-content-center'>
        <Button variant='primary' onClick={handleSubmit}>
          Buscar
        </Button>
      </div>
      <div className='m-2 d-flex justify-content-start'>
        <Button
          variant='info'
          onClick={() => {
            setEditarAtendimentoFormFields(null);
            setShowCadastroModal(true);
          }}
        >
          Novo Atendimento
        </Button>
      </div>
      {mensagemErro && <p className='text-danger'>{mensagemErro}</p>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Atendido</th>
            <th>Data</th>
            <th>Motivo</th>
            <th>Resolução</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {atendimentos.map((atendimento) => (
            <tr key={atendimento.id}>
              <td>{atendimento.nome}</td>
              <td>{atendimento.data}</td>
              <td>{atendimento.motivo}</td>
              <td>{atendimento.resolucao}</td>
              <td>
                <Badge bg={BG_BADGES_BY_STATUS[atendimento.status]}>
                  {atendimento.status_descricao}
                </Badge>
              </td>
              <td>
                <div className='d-flex w-100 h-100 align-items-center justify-content-center gap-2'>
                  <i
                    className='bi bi-pencil-square cursor-pointer'
                    role='button'
                    title='Editar Atendimento'
                    onClick={() => editarAtendimentoExistente(atendimento.id)}
                  ></i>
                  <i
                    className='bi bi-trash'
                    role='button'
                    title='Excluir Atendimento'
                    onClick={() => deletarAtendimento(atendimento.id)}
                  ></i>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <FormularioAtendimento
        show={showCadastroModal}
        formValues={editarAtendimentoFormFields}
        onHide={() => setShowCadastroModal(false)}
        onCadastroSuccess={fetchAtendimentos}
      />
    </Container>
  );
};

export default IniciarAtendimento;
