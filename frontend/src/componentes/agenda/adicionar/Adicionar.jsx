import React, { useState } from "react";
import { Button, Form, Alert, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ListaAlunosModal from "../../aluno/ListaAlunos";
import ListaProfessoresModal from "../../professor/ListaProfessores";

function Adicionar({ show, onHide, onUpdate }) {
  const [novoEvento, setNovoEvento] = useState({
    id_aluno: "",
    alunoNome: "", // Nome do aluno para exibição
    id_func_responsavel: "",
    professorNome: "",
    start: "",
    end: "",
    desc: "",
    tipo: "",
  });
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [showListaAlunosModal, setShowListaAlunosModal] = useState(false);
  const [showListaProfessoresModal, setShowListaProfessoresModal] =
    useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "start") {
      const startDate = new Date(value);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const timezoneOffset = startDate.getTimezoneOffset() * 60000;
      const adjustedStartDate = new Date(startDate.getTime() - timezoneOffset);
      const adjustedEndDate = new Date(endDate.getTime() - timezoneOffset);

      setNovoEvento({
        ...novoEvento,
        start: adjustedStartDate.toISOString().slice(0, 16),
        end: adjustedEndDate.toISOString().slice(0, 16),
      });
    } else {
      setNovoEvento({ ...novoEvento, [name]: value });
    }
  };

  const handleSelectAluno = (aluno) => {
    setNovoEvento({
      ...novoEvento,
      id_aluno: aluno.id,
      alunoNome: aluno.nome, // Para exibição
    });
    setShowListaAlunosModal(false);
  };
  const handleSelectProfessor = (professor) => {
    setNovoEvento({
      ...novoEvento,
      id_func_responsavel: professor.id,
      professorNome: professor.nome, // Para exibição
    });
    setShowListaProfessoresModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemErro("");
    setMensagemSucesso("");

    try {
      if (novoEvento.id_aluno && novoEvento.start) {
        const startDate = new Date(novoEvento.start);
        const endDate = new Date(novoEvento.end);

        if (startDate >= endDate) {
          alert("A data início deve ser anterior à data de término");
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          setMensagemErro(
            "Token de autenticação não encontrado. Faça login novamente."
          );
          navigate("/login");
          return;
        }

        const response = await fetch("http://localhost:5001/api/consulta/x", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(novoEvento),
        });

        const data = await response.json();

        if (response.ok) {
          setMensagemSucesso("Consulta adicionada com sucesso!");
          setNovoEvento({
            id_aluno: "",
            id_func_responsavel: "",
            start: "",
            end: "",
            desc: "",
            tipo: "",
          });

          // Lógica de atualização do calendário
          if (onUpdate) {
            onUpdate(novoEvento);
          }

          onHide(); // Fechar o modal após sucesso
        } else {
          setMensagemErro(data.message || "Falha ao adicionar consulta");
        }
      }
    } catch (error) {
      setMensagemErro(
        "Ocorreu um erro inesperado. Verifique os dados e tente novamente."
      );
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Registrar Aulas</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {mensagemErro && <Alert variant="danger">{mensagemErro}</Alert>}
        {mensagemSucesso && <Alert variant="success">{mensagemSucesso}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formBasicAluno" className="mb-3">
            <Form.Label>Turma</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type="text"
                placeholder="Selecione uma Turma"
                name="alunoNome"
                value={novoEvento.alunoNome} // Exibe o nome do aluno
                readOnly // Torna o campo não editável
                style={{ flex: 1, backgroundColor: "#e9ecef" }} // Estilo para indicar que está desabilitado
              />
              <Button
                variant="secondary"
                onClick={() => setShowListaAlunosModal(true)}
                className="ms-2"
              >
                <i className="bi bi-search"></i>
              </Button>
            </div>
          </Form.Group>
          <Form.Group controlId="formBasicProfessor" className="mb-3">
            <Form.Label>Professor Responsável</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control
                type="text"
                placeholder="Selecione o funcionário responsável"
                name="professorNome"
                value={novoEvento.professorNome} // Exibe o nome do funcionário
                readOnly // Torna o campo não editável
                style={{ flex: 1, backgroundColor: "#e9ecef" }} // Estilo para indicar que está desabilitado
              />
              <Button
                variant="secondary"
                onClick={() => setShowListaProfessoresModal(true)}
                className="ms-2"
              >
                <i className="bi bi-search"></i>
              </Button>
            </div>
          </Form.Group>
          <Form.Group controlId="formBasicStart" className="mb-3">
            <Form.Label>Início</Form.Label>
            <Form.Control
              type="datetime-local"
              name="start"
              value={novoEvento.start}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group controlId="formBasicTipo" className="mb-3">
            <Form.Label>Disciplina</Form.Label>
            <Form.Select
              name="tipo"
              value={novoEvento.tipo}
              onChange={handleChange}
            >
              <option value="">Selecione uma Disciplina</option>
                <option value="Matemática">Matemática</option>
                <option value="Português">Português</option>
                <option value="História">História</option>
                <option value="Geografia">Geografia</option>
                <option value="Ciências">Ciências</option>
                <option value="Inglês">Inglês</option>
                <option value="Educação Física">Educação Física</option>
                <option value="Artes">Artes</option>

            </Form.Select>
          </Form.Group>
          <Form.Group controlId="formBasicDesc" className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite a descrição"
              name="desc"
              value={novoEvento.desc}
              onChange={handleChange}
            />
          </Form.Group>
          <Button variant="success" type="submit" className="w-100">
            Salvar
          </Button>
        </Form>
        <ListaAlunosModal
          show={showListaAlunosModal}
          onHide={() => setShowListaAlunosModal(false)}
          onSelectAluno={handleSelectAluno}
        />
        <ListaProfessoresModal
          show={showListaProfessoresModal}
          onHide={() => setShowListaProfessoresModal(false)}
          onSelectProfessor={handleSelectProfessor}
        />
      </Modal.Body>
    </Modal>
  );
}

export default Adicionar;
