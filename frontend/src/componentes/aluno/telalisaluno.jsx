import React, { useState, useEffect, useMemo } from 'react';
import { Container, Table, Button, InputGroup, Form, Card, Row, Col } from 'react-bootstrap'; // Adicionado Card, Row, Col
import { useNavigate } from 'react-router-dom';
import AlunoDetalhesModal from './AlunoDetalhesModal';
import AlunoHistorico from './historicoaluno';
import FormularioAluno from './Aluno';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

// Se você tiver o ApiConfig configurado, substitua os fetchs manuais por ele
// import { ApiConfig } from '../services/ApiConfig'; 

const TelaListaAlunos = ({ onSelectAluno }) => {
  const [alunos, setAlunos] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [mensagemErroControle, setMensagemErroControle] = useState('');
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  // Ordena a lista em ordem alfabética pelo nome
  const alunosOrdenados = useMemo(() => {
    return [...alunos].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [alunos]);

  const alunosFiltrados = useMemo(() => {
    const currentSearch = searchText?.toLowerCase() || '';
    const list = alunosOrdenados.filter((aluno) => {
      return (
        aluno?.nome?.toLowerCase().includes(currentSearch) ||
        aluno?.cpf?.toLowerCase().includes(currentSearch)
      );
    });

    return list.length > 0 ? list : alunosOrdenados;
  }, [searchText, alunosOrdenados]);

  const fetchAlunos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.warning('Token não encontrado. Faça login novamente.');
        navigate('/login');
        return;
      }

      // Recomendo usar a BASE_URL ou ApiConfig aqui futuramente
      const response = await fetch('http://localhost:5001/api/aluno/allaluno', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlunos(data);
      } else {
        toast.warning('Erro ao carregar os alunos.');
      }
    } catch (error) {
      toast.warning('Erro ao conectar com o servidor.');
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, [navigate]);

  const handleDetalhes = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.warning('Token não encontrado. Faça login novamente.');
        navigate('/login');
        return;
      }
      const response = await fetch(
        `http://localhost:5001/api/aluno/aluno/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setAlunoSelecionado(data[0]);
          setShowModal(true);
        } else {
          toast.warning('Dados do aluno não encontrados.');
        }
      } else {
        toast.warning('Erro ao carregar detalhes do aluno.');
      }
    } catch (error) {
      toast.warning('Erro ao conectar com o servidor.');
    }
  };

  const handleHistorico = async (id) => {
    try {
      // Apenas abre o modal e seta o ID, a busca é feita dentro do componente AlunoHistorico?
      // Se sim, isso está correto.
      setAlunoSelecionado({ id });
      setShowHistoricoModal(true);
      setMensagemErro('');
      setMensagemErroControle('');
    } catch (error) {
      toast.warning('Erro ao conectar com o servidor.');
    }
  };

  const handleSave = async (formData) => {
    if (formData.dataNascimento) {
      const date = new Date(formData.dataNascimento);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
      formData.dataNascimento = format(date, 'yyyy-MM-dd');
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `http://localhost:5001/api/aluno/aluno/${formData.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAlunos((prevState) =>
          prevState.map((p) => (p.id === formData.id ? formData : p))
        );
        toast.success('Dados do aluno atualizados com sucesso!');
      } else {
        toast.error(data.message || 'Erro ao salvar alterações do aluno.');
        throw new Error(data.message || 'Erro ao salvar alterações.');
      }
    } catch (error) {
      toast.error(error.message || 'Erro ao conectar com o servidor.');
      throw error;
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setAlunoSelecionado(null);
  };

  const closeHistoricoModal = () => {
    setShowHistoricoModal(false);
    setAlunoSelecionado(null);
  };

  const handleExcluirAluno = async (id) => {
    const confirmado = window.confirm(
      'Tem certeza que deseja excluir este aluno?'
    );
    if (!confirmado) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `http://localhost:5001/api/aluno/aluno/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Aluno excluído com sucesso.');
        fetchAlunos();
      } else {
        toast.warning(data.message || 'Erro ao apagar o aluno.');
      }
    } catch (error) {
      toast.warning('Erro ao conectar com o servidor.');
    }
  };

  // Componente de Botões para reutilizar (DRY)
  const ActionButtons = ({ aluno, mobile = false }) => (
    <div className={mobile ? "d-grid gap-2" : "d-flex gap-2 justify-content-center"}>
      <Button
        variant='primary'
        size={mobile ? '' : 'sm'}
        onClick={() => handleDetalhes(aluno.id)}
      >
        <i className="bi bi-eye"></i> {mobile && " Detalhes"}
      </Button>
      <Button
        variant='warning'
        size={mobile ? '' : 'sm'}
        onClick={() => handleHistorico(aluno.id)}
      >
        <i className="bi bi-clock-history"></i> {mobile && " Histórico"}
      </Button>
      <Button
        variant='danger'
        size={mobile ? '' : 'sm'}
        onClick={() => handleExcluirAluno(aluno.id)}
      >
        <i className="bi bi-trash"></i> {mobile && " Excluir"}
      </Button>
    </div>
  );

  return (
    <Container className="pb-5"> {/* Padding bottom para não colar no fim da tela no mobile */}
      <h2 className='mt-4 mb-3 text-center text-md-start'>Lista de Alunos</h2>
      
      {/* Área de Controle: Busca e Cadastro Responsivos */}
      <Row className="mb-3 g-2">
        <Col xs={12} md={4} lg={3} className="order-md-2 text-end">
             <Button variant='info' className="w-100" onClick={() => setShowCadastroModal(true)}>
                <i className="bi bi-plus-lg"></i> Cadastrar Aluno
            </Button>
        </Col>
        <Col xs={12} md={8} lg={9} className="order-md-1">
            <InputGroup>
                <InputGroup.Text className="bg-white">
                    <i className='bi bi-search'></i>
                </InputGroup.Text>
                <Form.Control
                placeholder='Busque por Nome ou CPF'
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                />
            </InputGroup>
        </Col>
      </Row>

      {mensagemErro && <p className='text-danger'>{mensagemErro}</p>}

      {/* --- VERSÃO DESKTOP (Tabela) --- */}
      <div className="d-none d-md-block shadow-sm rounded overflow-hidden">
        <Table striped hover responsive className="mb-0 bg-white">
            <thead className="bg-light">
            <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th className="text-center">Ações</th>
            </tr>
            </thead>
            <tbody>
            {alunosFiltrados.map((aluno) => (
                <tr key={aluno.id} className="align-middle">
                <td>{aluno.nome}</td>
                <td>{aluno.cpf}</td>
                <td>
                    <ActionButtons aluno={aluno} />
                </td>
                </tr>
            ))}
            {alunosFiltrados.length === 0 && (
                <tr>
                    <td colSpan="3" className="text-center py-4 text-muted">Nenhum aluno encontrado</td>
                </tr>
            )}
            </tbody>
        </Table>
      </div>

      {/* --- VERSÃO MOBILE (Cards) --- */}
      <div className="d-md-none">
        {alunosFiltrados.map((aluno) => (
            <Card key={aluno.id} className="mb-3 shadow-sm border-0">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <Card.Title className="mb-0 fs-5">{aluno.nome}</Card.Title>
                            <Card.Text className="text-muted small">CPF: {aluno.cpf}</Card.Text>
                        </div>
                        {/* Se tiver foto ou icone de usuário, pode por aqui */}
                        <div className="bg-light rounded-circle p-2 text-secondary">
                            <i className="bi bi-person-fill fs-4"></i>
                        </div>
                    </div>
                    <hr className="my-2" />
                    <ActionButtons aluno={aluno} mobile={true} />
                </Card.Body>
            </Card>
        ))}
        {alunosFiltrados.length === 0 && (
             <div className="text-center py-5 text-muted">
                <i className="bi bi-search fs-1 d-block mb-2"></i>
                Nenhum aluno encontrado
             </div>
        )}
      </div>

      {/* Modais (Sem alterações de lógica) */}
      {showModal && (
        <AlunoDetalhesModal
          show={showModal}
          onHide={closeModal}
          aluno={alunoSelecionado}
          onSave={handleSave}
          mensagemErro={mensagemErroControle}
          setMensagemErro={setMensagemErroControle}
        />
      )}

      {showHistoricoModal && (
        <AlunoHistorico
          show={showHistoricoModal}
          onHide={closeHistoricoModal}
          alunoId={alunoSelecionado?.id}
          mensagemErroControle={mensagemErroControle}
        />
      )}

      <FormularioAluno
        show={showCadastroModal}
        onHide={() => {
          setShowCadastroModal(false);
          fetchAlunos();
        }}
        onAlunosAtualizados={fetchAlunos}
      />
    </Container>
  );
};

export default TelaListaAlunos;