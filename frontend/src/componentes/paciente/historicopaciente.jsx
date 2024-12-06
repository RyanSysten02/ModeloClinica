import React, { useState, useEffect } from "react";
import { Modal, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ptBR from 'date-fns/locale/pt-BR';
import { differenceInMinutes, format } from 'date-fns';
import './csshistorico.css';

const PacienteHistorico = ({ show, onHide, pacienteId }) => {
  const [historicos, setHistoricos] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistorico = async () => {
      if (!pacienteId) {
        setMensagemErro("ID do paciente não foi fornecido.");
        return;
      }
  
      setMensagemErro(""); // Limpa mensagem de erro ao iniciar a busca
  
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMensagemErro("Token não encontrado. Faça login novamente.");
          navigate("/login");
          return;
        }
  
        const response = await fetch(`http://localhost:5001/api/consulta/historico/${pacienteId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setHistoricos(data);
        } else {
          setMensagemErro("Erro ao carregar os históricos.");
        }
      } catch (error) {
        setMensagemErro("Erro ao conectar com o servidor.");
      }
    };
  
    if (pacienteId) {
      fetchHistorico();
    }
  }, [pacienteId, navigate]);
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  }

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const duration = differenceInMinutes(endDate, startDate);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Histórico de Consultas</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mensagemErro && <p className="text-danger">{mensagemErro}</p>}
        {historicos.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Criada em:</th>
                <th>Inicio</th>
                <th>Fim</th>
                <th>Duração</th>
                <th>Médico</th>
                <th>Especialidade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {historicos.map((consulta) => (
                <tr key={consulta.id} className={consulta.status === 'C' ? 'status-C' : consulta.status === 'AD' ? 'status-AD' : ''}>
                  <td>{formatDate(consulta.dh_inclusao)}</td>
                  <td>{formatDate(consulta.start)}</td>
                  <td>{formatDate(consulta.end)}</td>  
                  <td>{calculateDuration(consulta.start, consulta.end)}</td>
                  <td>{consulta.funcionario_nome}</td>
                  <td>{consulta.tipo}</td>
                  <td>{consulta.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !mensagemErro && <p>Nenhum histórico encontrado para este paciente.</p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PacienteHistorico;
