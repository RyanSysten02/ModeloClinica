import React, { useState, useEffect } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import FormularioAtendimento from './FormularioAtendimento';
import axios from 'axios';
import { toast } from 'react-toastify';

const IniciarAtendimento = ({ onSelectProfessor }) => {
  const [atendimentos, setAtendimentos] = useState([]);
  const [handleListaAtendimentos, setHandleListaAtendimentos] = useState(true);
  const [mensagemErro, setMensagemErro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [professorSelecionado, setProfessorSelecionado] = useState(null);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const navigate = useNavigate();

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

  const editarAtendimento = async (id, tipo) => {
    const token = localStorage.getItem('token');

    const response = await axios.put(
      `http://localhost:5001/api/atendimentos/${id}/editar?tipo=${tipo}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    toast.success(response.data.message);
    setHandleListaAtendimentos(!handleListaAtendimentos);
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
        setMensagemErro('Erro ao carregar os atendimentos.');
      }
    } catch (error) {
      setMensagemErro('Erro ao conectar com o servidor.');
    }
  };

  useEffect(() => {
    fetchAtendimentos();
  }, [handleListaAtendimentos]);

  const handleSave = async (formData) => {
    console.log('Tentando salvar:', formData);

    // Corrigir a data no formato aceito pelo MySQL (yyyy-MM-dd)
    if (formData.data_nasc) {
      try {
        const dataFormatada = format(
          new Date(formData.data_nasc),
          'yyyy-MM-dd'
        );
        formData.data_nasc = dataFormatada;
      } catch (e) {
        console.error('Erro ao formatar data:', e.message);
      }
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMensagemErro('Token não encontrado. Faça login novamente.');
        navigate('/login');
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/professor/professor/${formData.id}`,
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
      console.log('Resposta do servidor:', data);

      if (response.ok) {
        await fetchAtendimentos();
      } else {
        setMensagemErro('Erro ao salvar alterações do funcionário.');
      }
    } catch (error) {
      console.error('Erro na atualização:', error.message);
      setMensagemErro('Erro ao conectar com o servidor.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setProfessorSelecionado(null);
  };

  return (
    <Container>
      <h1 className='mt-4'>Iniciar Atendimento</h1>
      <div className='m-2 d-flex justify-content-start'>
        <Button variant='info' onClick={() => setShowCadastroModal(true)}>
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
              <td>{atendimento.status_descricao}</td>
              <td>
                <div className='d-flex w-100 h-100 align-items-center justify-content-center gap-2'>
                  <i
                    className='bi bi-pause cursor-pointer'
                    role='button'
                    title='Pausar Atendimento'
                    onClick={() => editarAtendimento(atendimento.id, 5)}
                  ></i>
                  <i
                    className='bi bi-x'
                    role='button'
                    title='Cancelar Atendimento'
                    onClick={() => editarAtendimento(atendimento.id, 4)}
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
        onHide={() => setShowCadastroModal(false)}
        onCadastroSuccess={fetchAtendimentos}
      />
    </Container>
  );
};

export default IniciarAtendimento;
