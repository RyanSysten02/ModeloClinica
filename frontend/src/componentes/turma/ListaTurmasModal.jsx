import React, { useState, useEffect } from "react";
import { Modal, Table, Button, Form, InputGroup } from "react-bootstrap";
import TurmaService from "../../services/Turma";

const ListaTurmasModal = ({ show, onHide, onSelectTurma }) => {
  const [turmas, setTurmas] = useState([]);
  const [mensagemErro, setMensagemErro] = useState("");
  const [searchText, setSearchText] = useState("");

  const fetchTurmas = async () => {
    try {
      const data = await TurmaService.findAll();
      setTurmas(data);
    } catch (error) {
      setMensagemErro("Erro ao carregar as turmas.");
    }
  };

  useEffect(() => {
    if (show) fetchTurmas();
  }, [show]);

  const turmasFiltradas = turmas.filter((turma) => {
    const textoBusca = searchText.toLowerCase();
    return (
      turma?.nome?.toLowerCase().includes(textoBusca) ||
      String(turma?.ano_letivo).includes(textoBusca) ||
      turma?.periodo?.toLowerCase().includes(textoBusca) ||
      String(turma?.semestre).includes(textoBusca)
    );
  });

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Lista de Turmas</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mensagemErro && <p className="text-danger">{mensagemErro}</p>}

        <InputGroup className="mb-3">
          <Form.Control
            placeholder="Buscar por nome, ano letivo, período ou semestre"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button variant="outline-secondary">
            <i className="bi bi-search" />
          </Button>
        </InputGroup>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Ano Letivo</th>
              <th>Período</th>
              <th>Semestre</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {turmasFiltradas.map((turma) => (
              <tr key={turma.id}>
                <td>{turma.nome}</td>
                <td>{turma.ano_letivo}</td>
                <td>{turma.periodo}</td>
                <td>{turma.semestre}</td>
                <td>
                  <Button
                    variant="success"
                    onClick={() => onSelectTurma(turma)}
                  >
                    Selecionar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ListaTurmasModal;
