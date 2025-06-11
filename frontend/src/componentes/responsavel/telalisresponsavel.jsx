import React, { useState, useEffect, useMemo } from 'react';
import { Container, Table, Button, InputGroup, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ResponsavelDetalhesModal from './ResponsavelDetalhesModal';
import ResponsavelHistorico from './historicoresponsavel';
import FormularioResponsavel from './Responsavel';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const TelaListaResponsavels = ({ onSelectResponsavel }) => {
  const [responsavels, setResponsavels] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [responsavelSelecionado, setResponsavelSelecionado] = useState(null);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [mensagemErroControle, setMensagemErroControle] = useState('');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  // Lista filtrada e ordenada pelo nome
  const responsavelFiltrados = useMemo(() => {
    const currentSearch = searchText?.toLowerCase() || '';

    const filtered = responsavels.filter((resp) => {
      return (
        resp?.nome?.toLowerCase().includes(currentSearch) ||
        resp?.cpf?.toLowerCase().includes(currentSearch)
      );
    });

    // Ordena por nome
    filtered.sort((a, b) => a.nome.localeCompare(b.nome));
    return filtered;
  }, [searchText, responsavels]);

  const fetchResponsavels = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.warning('Token não encontrado. Faça login novamente.');
        navigate('/login');
        return;
      }

      const response = await fetch(
        'http://localhost:5001/api/responsavel/allresponsavel',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResponsavels(data);
        setMensagemErro('');
      } else {
        toast.warning('Erro ao carregar os responsáveis.');
      }
    } catch (error) {
      toast.warning('Erro ao conectar com o servidor.');
    }
  };

  useEffect(() => {
    fetchResponsavels();
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
        `http://localhost:5001/api/responsavel/responsavel/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setResponsavelSelecionado(data[0]);
          setShowModal(true);
          setMensagemErro('');
        } else {
          toast.warning('Dados do responsável não encontrados.');
        }
      } else {
        toast.warning('Erro ao carregar detalhes do responsável.');
      }
    } catch {
      toast.warning('Erro ao conectar com o servidor.');
    }
  };

  const handleHistorico = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.warning('Token não encontrado. Faça login novamente.');
        navigate('/login');
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/consulta/historico/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.warning(
          data.message || 'Erro ao carregar histórico do responsável.'
        );
        return;
      }

      if (data) {
        setResponsavelSelecionado({ id, ...data });
        setShowHistoricoModal(true);
        setMensagemErro('');
        setMensagemErroControle('');
      } else {
        toast.warning('Histórico do responsável não encontrado.');
      }
    } catch {
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
      if (!token) {
        toast.warning('Token não encontrado. Faça login novamente.');
        navigate('/login');
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/responsavel/responsavel/${formData.id}`,
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
        setResponsavels((prev) =>
          prev.map((p) => (p.id === formData.id ? formData : p))
        );
        toast.success('Responsável atualizado com sucesso.');
      } else {
        toast.warning(
          data.message || 'Erro ao salvar alterações do responsável.'
        );
      }
    } catch {
      toast.warning('Erro ao conectar com o servidor.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setResponsavelSelecionado(null);
  };

  const closeHistoricoModal = () => {
    setShowHistoricoModal(false);
    setResponsavelSelecionado(null);
  };

  const handleExcluirResponsavel = async (id) => {
    const confirmado = window.confirm(
      'Deseja realmente excluir este responsável?'
    );
    if (!confirmado) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.warning('Token não encontrado. Faça login novamente.');
        navigate('/login');
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/responsavel/responsavel/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Responsável excluído com sucesso.');
        fetchResponsavels();
      } else {
        const data = await response.json();
        toast.warning(data.message || 'Erro ao excluir responsável.');
      }
    } catch {
      toast.warning('Erro ao conectar com o servidor.');
    }
  };

  return (
    <Container>
      <h1 className='mt-4'>Lista de Responsáveis</h1>
      <div className='m-2 d-flex justify-content-start'>
        <Button variant='info' onClick={() => setShowCadastroModal(true)}>
          Cadastrar Responsável
        </Button>
      </div>
      <InputGroup className='mb-3'>
        <Form.Control
          placeholder='Busque o responsável'
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          aria-label='Buscar responsável'
        />
        <Button variant='outline-secondary' id='button-addon1'>
          <i className='bi bi-search'></i>
        </Button>
      </InputGroup>
      {mensagemErro && <p className='text-danger'>{mensagemErro}</p>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {responsavelFiltrados.map((responsavel) => (
            <tr key={responsavel.id}>
              <td>{responsavel.nome}</td>
              <td>{responsavel.cpf}</td>
              <td
                style={{
                  display: 'inline-flex',
                  gap: 10,
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Button
                  variant='primary'
                  onClick={() => handleDetalhes(responsavel.id)}
                >
                  Detalhes
                </Button>

                <Button
                  variant='danger'
                  onClick={() => handleExcluirResponsavel(responsavel.id)}
                >
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showModal && (
        <ResponsavelDetalhesModal
          show={showModal}
          onHide={closeModal}
          responsavel={responsavelSelecionado}
          onSave={handleSave}
        />
      )}

      <ResponsavelHistorico
        show={showHistoricoModal}
        onHide={closeHistoricoModal}
        responsavelId={responsavelSelecionado?.id}
        mensagemErroControle={mensagemErroControle}
      />

      <FormularioResponsavel
        show={showCadastroModal}
        onHide={() => {
          setShowCadastroModal(false);
          fetchResponsavels();
        }}
        onResponsavelsAtualizados={fetchResponsavels}
      />
    </Container>
  );
};

export default TelaListaResponsavels;
