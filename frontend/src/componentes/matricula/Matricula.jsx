import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Container, Row, Col, Alert } from "react-bootstrap";
import Select from "react-select";
import TurmaService from "../../services/Turma";
import { toast } from "react-toastify";


function FormularioMatricula({ show, onHide, onMatriculaRealizada }) {
  const [dados, setDados] = useState({
    aluno_id: "",
    turma_id: "",
    responsavel_id: "",
    observacoes: "",
    data_matricula: new Date().toISOString().split("T")[0],
    ano_letivo: new Date().getFullYear(),
    turno: "",
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

  const handleSelectChange = (selected, { name }) => {
    setDados((prev) => ({ ...prev, [name]: selected ? selected.value : "" }));
  };

 const handleSubmit = async () => {
  setErro("");

  if (!dados.aluno_id || !dados.turma_id || !dados.ano_letivo || !dados.turno) {
    toast.error("Aluno, turma, ano letivo e turno são obrigatórios.");
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
      body: JSON.stringify({ ...dados, status: "ativa" }),
    });

    const resJson = await response.json();

    if (response.ok) {
      toast.success("Matrícula cadastrada com sucesso!");
      onHide();
      onMatriculaRealizada(); // caso precise atualizar a lista
    } else {
      toast.error(resJson.message || "Erro ao cadastrar matrícula.");
    }
  } catch (e) {
    console.error("Erro de requisição:", e);
    toast.error("Erro na requisição.");
  }
};



  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Cadastrar Matrícula</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          {erro && <Alert variant="danger">{erro}</Alert>}
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Aluno *</Form.Label>
                  <Select
                    name="aluno_id"
                    value={alunos.find((a) => a.id === dados.aluno_id) && {
                      value: dados.aluno_id,
                      label: alunos.find((a) => a.id === dados.aluno_id)?.nome,
                    }}
                    onChange={handleSelectChange}
                    options={alunos.map((a) => ({ value: a.id, label: a.nome }))}
                    placeholder="Selecione o aluno"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Turma *</Form.Label>
                  <Select
                    name="turma_id"
                    value={turmas.find((t) => t.id === dados.turma_id) && {
                      value: dados.turma_id,
                      label: turmas.find((t) => t.id === dados.turma_id)?.nome,
                    }}
                    onChange={handleSelectChange}
                    options={turmas.map((t) => ({ value: t.id, label: t.nome }))}
                    placeholder="Selecione a turma"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Responsável</Form.Label>
                  <Select
                    name="responsavel_id"
                    value={responsaveis.find((r) => r.id === dados.responsavel_id) && {
                      value: dados.responsavel_id,
                      label: responsaveis.find((r) => r.id === dados.responsavel_id)?.nome,
                    }}
                    onChange={handleSelectChange}
                    options={responsaveis.map((r) => ({ value: r.id, label: r.nome }))}
                    placeholder="Opcional"
                    isClearable
                  />
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

            <Row className="mt-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Data da Matrícula</Form.Label>
                  <Form.Control
                    type="date"
                    name="data_matricula"
                    value={dados.data_matricula}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Ano Letivo *</Form.Label>
                  <Form.Control
                    type="number"
                    name="ano_letivo"
                    value={dados.ano_letivo}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Turno *</Form.Label>
                  <Form.Select name="turno" value={dados.turno} onChange={handleChange}>
                    <option value="">Selecione o turno</option>
                    <option value="manhã">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Button className="mt-4" variant="primary" onClick={handleSubmit}>
              Salvar Matrícula
            </Button>
          </Form>
        </Container>
      </Modal.Body>
    </Modal>
  );
}

export default FormularioMatricula;
