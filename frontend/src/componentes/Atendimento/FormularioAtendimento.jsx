import { useState, useEffect } from "react";
import { Modal, Button, Form, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function FormularioAtendimento({ show, onHide, onCadastroSuccess }) {
  const [atendimento, setAtendimento] = useState({
    status: "",
    tipo: "",
    data: "",
    nome: "",
    motivo: "",
    resolucao: "",
  });

  const [statusAtendimento, setStatusAtendimento] = useState([]);
  const [tipoAtendimento] = useState([
    { id: 1, descricao: "Aluno" },
    { id: 2, descricao: "Responsável" },
    { id: 3, descricao: "Outro" },
  ]);

  // ✅ Novo state: lista de nomes (alunos ou responsáveis)
  const [listaNomes, setListaNomes] = useState([]);

  const [mensagemErro, setMensagemErro] = useState("");
  const navigate = useNavigate();

  // 🔹 Busca inicial de status de atendimento
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("http://localhost:5001/api/atendimentos/status/listar", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setStatusAtendimento(data);
      } catch (err) {
        console.error("Erro ao buscar status:", err);
      }
    })();
  }, []);

  // 🔹 Quando o tipo muda → limpa nome e busca lista se for 1 ou 2
  useEffect(() => {
    if (!atendimento.tipo) {
      setListaNomes([]);
      return;
    }

    // Limpa o nome sempre que o tipo mudar
    setAtendimento((prev) => ({ ...prev, nome: "" }));

    // Se tipo for 1 ou 2, busca a lista de nomes na API
    if (atendimento.tipo === "1" || atendimento.tipo === "2") {
      const fetchNomes = async () => {
        try {
          const token = localStorage.getItem("token");
          const { data } = await axios.get(
            `http://localhost:5001/api/atendimentos/listar-nomes?tipo=${atendimento.tipo}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setListaNomes(data);
        } catch (err) {
          console.error("Erro ao buscar nomes:", err);
          setListaNomes([]);
        }
      };

      fetchNomes();
    } else {
      // tipo = 3 (Outro) → campo texto
      setListaNomes([]);
    }
  }, [atendimento.tipo]);

  const handleChange = ({ target: { name, value } }) => {
    setAtendimento((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemErro("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMensagemErro("Token de autenticação não encontrado. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5001/api/atendimentos/adicionar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(atendimento),
      });

      const data = await response.json();

      if (response.ok) {
        setAtendimento({
          status: "",
          tipo: "",
          data: "",
          nome: "",
          motivo: "",
          resolucao: "",
        });

        if (onCadastroSuccess) onCadastroSuccess();
        onHide();
        navigate("/centralRelacionamentos");
      } else {
        setMensagemErro(data.message || "Falha ao adicionar atendimento");
      }
    } catch (error) {
      setMensagemErro("Ocorreu um erro. Tente novamente.");
    }
  };

  // 🔹 Campo nome condicional e desabilitado enquanto tipo não for escolhido
  const renderCampoNome = () => {
    if (!atendimento.tipo) {
      return (
        <Form.Control
          type="text"
          placeholder="Selecione o tipo para informar o nome"
          disabled
        />
      );
    }

    if (atendimento.tipo === "1" || atendimento.tipo === "2") {
      return (
        <Form.Select
          name="nome"
          value={atendimento.nome}
          onChange={handleChange}
          disabled={!listaNomes.length}
        >
          <option value="">
            {listaNomes.length
              ? "Selecione um nome..."
              : "Carregando nomes..."}
          </option>
          {listaNomes.map((item, index) => (
            <option key={index} value={item.id}>
              {item.descricao}
            </option>
          ))}
        </Form.Select>
      );
    }

    // tipo = 3 (Outro)
    return (
      <Form.Control
        type="text"
        name="nome"
        value={atendimento.nome}
        onChange={handleChange}
        placeholder="Digite o nome"
      />
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Formulário de Atendimento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container className="mt-4">
          {mensagemErro && <div className="alert alert-danger">{mensagemErro}</div>}
          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Tipo */}
              <Col md={2}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Tipo*</Form.Label>
                  <Form.Select name="tipo" value={atendimento.tipo} onChange={handleChange}>
                    <option value="">Selecione...</option>
                    {tipoAtendimento.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.descricao}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Nome */}
              <Col md={5}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Nome*</Form.Label>
                  {renderCampoNome()}
                </Form.Group>
              </Col>

              {/* Data */}
              <Col md={3}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Data Atendimento*</Form.Label>
                  <Form.Control
                    type="date"
                    name="data"
                    value={atendimento.data}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              {/* Status */}
              <Col md={2}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Status*</Form.Label>
                  <Form.Select name="status" value={atendimento.status} onChange={handleChange}>
                    <option value="">Selecione...</option>
                    {statusAtendimento.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.descricao}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Motivo */}
              <Col md={12}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Motivo do Contato/Atendimento*</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="motivo"
                    value={atendimento.motivo}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>

              {/* Resolução */}
              <Col md={12}>
                <Form.Group className="mb-3 text-start">
                  <Form.Label>Resolução do Atendimento*</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="resolucao"
                    value={atendimento.resolucao}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default FormularioAtendimento;
