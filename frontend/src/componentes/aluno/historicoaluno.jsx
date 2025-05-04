import React, { useState, useEffect } from "react";
import { Modal, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ptBR from "date-fns/locale/pt-BR";
import { differenceInMinutes, format } from "date-fns";
import "./csshistorico.css";

const AlunoHistorico = ({ show, onHide, alunoId, mensagemErroControle }) => {
  const [historicos, setHistoricos] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistorico = async () => {
      if (!alunoId) {
        setMensagemErro("ID do aluno não foi fornecido.");
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

        const response = await fetch(
          `http://localhost:5001/api/consulta/historico/${alunoId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

    if (alunoId) {
      fetchHistorico();
    }
  }, [alunoId, navigate]);

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
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
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Histórico do Aluno</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mensagemErro && <p className="text-danger">{mensagemErro}</p>}
        {mensagemErroControle && (
          <p style={{ color: "orange" }}>
            Erro do Backend: {mensagemErroControle}
          </p>
        )}
        {historicos.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Data:</th>
                <th>Inicio da Aula</th>
                <th>Fim da Aula</th>
                <th>Tempo Ausente</th>
                <th>Professor</th>
                <th>Matéria</th>
                {/*<th>Status</th> verificar se é possivel reutilizar essa funcionalidade depois*/}
              </tr>
            </thead>
            <tbody>
              {historicos.map((consulta) => (
                <tr key={consulta.id}>
                  <td>{formatDate(consulta.dh_inclusao)}</td>
                  <td>{formatDate(consulta.start)}</td>
                  <td>{formatDate(consulta.end)}</td>
                  <td>{calculateDuration(consulta.start, consulta.end)}</td>
                  <td>{consulta.professor_nome}</td>
                  <td>{consulta.tipo}</td>
                  {/*<td>
                  {consulta.status === 'C' ? (
                    <>
                      <strong>Cancelada</strong>
                      <br />
                      <span>{`Data: ${formatDate(consulta.dh_cancelamento)}`}</span>
                      <br />
                      <span>{`Motivo: ${consulta.motivocancelamento}`}</span>
                    </>
                  ) : consulta.status === 'AD' ? (
                    <>
                      <strong>Adiada</strong>
                      <br />
                      <span>{`Data: ${formatDate(consulta.dh_adiamento)}`}</span>
                      <br />
                      <span>{`Motivo: ${consulta.motivo_adiamento}`}</span>
                    </>
                  ) : consulta.status === 'P' ? (
                    <>
                      <strong>Primeira</strong>
                      <br />
                      <span>{`Data de Inclusão: ${formatDate(consulta.dh_inclusao)}`}</span>
                    </>
                  ) : (
                    consulta.status
                  )}
                </td>*/}
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          !mensagemErro && <p>Nenhum histórico encontrado para este aluno.</p>
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

export default AlunoHistorico;
