import { useState, useEffect } from 'react';
import { Modal, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ptBR from 'date-fns/locale/pt-BR';
import { differenceInMinutes, format } from 'date-fns';
import './csshistorico.css';
import axios from 'axios';

const AlunoHistorico = ({ show, onHide, alunoId, mensagemErroControle }) => {
  const [mensagemErro, setMensagemErro] = useState('');
  const [atendimentos, setAtendimentos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistorico = async () => {
      if (!alunoId) {
        setMensagemErro('ID do aluno não foi fornecido.');
        return;
      }

      setMensagemErro(''); // Limpa mensagem de erro ao iniciar a busca

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMensagemErro('Token não encontrado. Faça login novamente.');
          navigate('/login');
          return;
        }

        const responseAtendimentos = await axios.get(
          `http://localhost:5001/api/atendimentos/${alunoId}?tipo=1`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (responseAtendimentos.status === 200) {
          setAtendimentos(responseAtendimentos.data);
        } else {
          setAtendimentos([]);
        }
      } catch (error) {
        setMensagemErro('Erro ao conectar com o servidor.');
      }
    };

    if (alunoId) {
      fetchHistorico();
    }
  }, [alunoId, navigate]);

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const duration = differenceInMinutes(endDate, startDate);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Modal show={show} onHide={onHide} size='xl' centered>
      <Modal.Header closeButton>
        <Modal.Title>Histórico do Aluno</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mensagemErro && <p className='text-danger'>{mensagemErro}</p>}
        {mensagemErroControle && (
          <p style={{ color: 'orange' }}>
            Erro do Backend: {mensagemErroControle}
          </p>
        )}
        <Modal.Title>Atendimentos do Aluno</Modal.Title>
        {atendimentos.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Atendido</th>
                <th>Data</th>
                <th>Motivo</th>
                <th>Resolução</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {atendimentos.map((atendimento) => (
                <tr key={atendimento.id}>
                  <td>{atendimento.nome}</td>
                  <td>{atendimento.data}</td>
                  <td>{atendimento.motivo}</td>
                  <td>{atendimento.resolucao}</td>
                  <td>{atendimento.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !mensagemErro && <p>Nenhum atendimento encontrado para este aluno.</p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant='secondary' onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AlunoHistorico;
