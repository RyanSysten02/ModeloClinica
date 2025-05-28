import React, { useEffect, useState } from "react";
import { Modal, Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DetalhesMatriculaModal from "./DetalhesMatriculaModal";

const ListaMatriculasModal = ({ show, onHide, onSelectMatricula }) => {
  const [matriculas, setMatriculas] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [matriculaSelecionada, setMatriculaSelecionada] = useState(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const navigate = useNavigate();

  const fetchMatriculas = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5001/api/matricula/allmatricula", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMatriculas(data);
      } else {
        setMensagemErro("Erro ao carregar as matrículas.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  useEffect(() => {
    if (show) fetchMatriculas();
  }, [show]);

  const handleDetalhes = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/api/matricula/matricula/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setMatriculaSelecionada(data[0]);
          setShowDetalhes(true);
        } else {
          setMensagemErro("Detalhes não encontrados.");
        }
      } else {
        setMensagemErro("Erro ao carregar detalhes.");
      }
    } catch (error) {
      setMensagemErro("Erro ao conectar com o servidor.");
    }
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Lista de Matrículas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mensagemErro && <p className="text-danger">{mensagemErro}</p>}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Turma</th>
                <th>Responsável</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {matriculas.map((matricula) => (
                <tr key={matricula.id}>
                  <td>{matricula.aluno_nome}</td>
                  <td>{matricula.turma_nome}</td>
                  <td>{matricula.responsavel_nome || "-"}</td>
                  <td>
                    <Button variant="primary" onClick={() => handleDetalhes(matricula.id)}>
                      Detalhes
                    </Button>
                    <Button variant="success" onClick={() => onSelectMatricula(matricula)} style={{ marginLeft: "10px" }}>
                      Selecionar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {showDetalhes && matriculaSelecionada && (
            <DetalhesMatriculaModal
              show={showDetalhes}
              onHide={() => setShowDetalhes(false)}
              matricula={matriculaSelecionada}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Fechar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ListaMatriculasModal;
