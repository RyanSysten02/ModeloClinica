import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Container, Row, Col, Alert } from "react-bootstrap";
import TurmaService from "../../services/Turma";


function FormularioMatricula({ show, onHide, onMatriculaRealizada }) {
  const [dados, setDados] = useState({
    aluno_id: "",
    turma_id: "",
    responsavel_id: "",
    observacoes: "",
  });

  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [erro, setErro] = useState("");

  const carregarDados = async () => {
  try {
    const [alunoRes, turmaRes, respRes] = await Promise.all([
      fetch("http://localhost:5001/api/aluno/allaluno").then((res) => res.json()),
      TurmaService.findAll(),
      fetch("http://localhost:5001/api/responsavel/allresponsavel").then((res) => res.json()),
    ]);

    setAlunos(alunoRes);
    setTurmas(turmaRes); 
    setResponsaveis(respRes);
  } catch (e) {
    setErro("Erro ao carregar dados.");
  }
};

  useEffect(() => {
    if (show) carregarDados();
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setErro("");
    if (!dados.aluno_id || !dados.turma_id) {
      setErro("Aluno e turma são obrigatórios.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/api/matricula/cadastrarmatricula", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
      });

      if (response.ok) {
        onHide();
        onMatriculaRealizada();
      } else {
        const res = await response.json();
        setErro(res.message || "Erro ao cadastrar matrícula.");
      }
    } catch {
      setErro("Erro na requisição.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Matrícula</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          {erro && <Alert variant="danger">{erro}</Alert>}
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Aluno *</Form.Label>
                  <Form.Select name="aluno_id" value={dados.aluno_id} onChange={handleChange}>
                    <option value="">Selecione o aluno</option>
                    {alunos.map((aluno) => (
                      <option key={aluno.id} value={aluno.id}>
                        {aluno.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Turma *</Form.Label>
                  <Form.Select name="turma_id" value={dados.turma_id} onChange={handleChange}>
                    <option value="">Selecione a turma</option>
                    {turmas.map((turma) => (
                      <option key={turma.id} value={turma.id}>
                        {turma.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Responsável</Form.Label>
                  <Form.Select name="responsavel_id" value={dados.responsavel_id} onChange={handleChange}>
                    <option value="">Opcional</option>
                    {responsaveis.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Observações</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="observacoes"
                    value={dados.observacoes}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button className="mt-3" variant="primary" onClick={handleSubmit}>
              Salvar Matrícula
            </Button>
          </Form>
        </Container>
      </Modal.Body>
    </Modal>
  );
}

export default FormularioMatricula;
