import React, { useEffect, useMemo, useState } from "react";
import { Container, Table, Button, InputGroup, Form, Collapse, Row, Col, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";

const METODOS = ["Presencial", "Telefone", "E-mail", "WhatsApp", "Outro"];
const TIPOS_ATENDIDO = ["Aluno", "Professor", "Responsável", "Colaborador", "Visitante"];

const TelaAtendimentos = () => {
  const navigate = useNavigate();


  const [tipoAtendido, setTipoAtendido] = useState("Aluno");
  const [nomeAtendido, setNomeAtendido] = useState("");
  const [metodo, setMetodo] = useState("Presencial");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [hora, setHora] = useState(() => format(new Date(), "HH:mm"));
  const [funcionario, setFuncionario] = useState("");

  const [salvando, setSalvando] = useState(false);


  const [showConsulta, setShowConsulta] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [atendimentos, setAtendimentos] = useState([]);
  const [carregandoLista, setCarregandoLista] = useState(false);


  const getTokenOrRedirect = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warning("Token não encontrado. Faça login novamente.");
      navigate("/login");
      return null;
    }
    return token;
  };

 
  const fetchAtendimentos = async () => {
    const token = getTokenOrRedirect();
    if (!token) return;

    setCarregandoLista(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.append("q", busca);
      if (filtroMetodo) params.append("metodo", filtroMetodo);
      if (filtroData) params.append("data", filtroData);

      const response = await fetch(`http://localhost:5001/api/atendimentos?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        toast.error("Erro ao carregar atendimentos.");
        setCarregandoLista(false);
        return;
      }
      const data = await response.json();
      setAtendimentos(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Falha na conexão com o servidor.");
    } finally {
      setCarregandoLista(false);
    }
  };


  useEffect(() => {
    if (showConsulta) fetchAtendimentos();
  
  }, [showConsulta]);

  useEffect(() => {
    const i = setTimeout(() => {
      if (showConsulta) fetchAtendimentos();
    }, 300);
    return () => clearTimeout(i);
    
  }, [busca, filtroMetodo, filtroData]);


  const handleSalvar = async (e) => {
    e.preventDefault();


    if (!nomeAtendido?.trim()) return toast.warning("Informe o nome do atendido.");
    if (!funcionario?.trim()) return toast.warning("Informe o funcionário responsável.");
    if (!descricao?.trim()) return toast.warning("Descreva o atendimento.");

    const token = getTokenOrRedirect();
    if (!token) return;

    const payload = {
      tipoAtendido,
      nomeAtendido: nomeAtendido.trim(),
      metodo,
      descricao: descricao.trim(),
      data,       
      hora,       
      funcionario: funcionario.trim(),
    };

    try {
      setSalvando(true);
      const response = await fetch("http://localhost:5001/api/atendimentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const msg = await response.text();
        toast.error(msg || "Erro ao salvar atendimento.");
        return;
      }

      toast.success("Atendimento registrado com sucesso!");
      
      setNomeAtendido("");
      setDescricao("");
      setFuncionario("");

      // se painel aberto, atualiza a lista
      if (showConsulta) fetchAtendimentos();
    } catch (error) {
      toast.error("Falha ao salvar. Verifique sua conexão.");
    } finally {
      setSalvando(false);
    }
  };

  const atendimentosFiltradosOrdenados = useMemo(() => {
   
    const base = [...atendimentos];
    base.sort((a, b) => {
      const d1 = new Date(`${a.data}T${a.hora || "00:00"}`);
      const d2 = new Date(`${b.data}T${b.hora || "00:00"}`);
      return d2 - d1; 
    });
    return base;
  }, [atendimentos]);

  return (
    <Container>
      <h1 className="mt-4">Registro de Atendimentos</h1>

      {}
      <Form className="border rounded p-3 mt-3" onSubmit={handleSalvar}>
        <Row className="g-3">
          <Col md={3} xs={12}>
            <Form.Label>Tipo de atendido</Form.Label>
            <Form.Select value={tipoAtendido} onChange={(e) => setTipoAtendido(e.target.value)}>
              {TIPOS_ATENDIDO.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Form.Select>
          </Col>

          <Col md={5} xs={12}>
            <Form.Label>Nome do atendido</Form.Label>
            <Form.Control
              placeholder="Ex.: João da Silva"
              value={nomeAtendido}
              onChange={(e) => setNomeAtendido(e.target.value)}
            />
          </Col>

          <Col md={4} xs={12}>
            <Form.Label>Método</Form.Label>
            <Form.Select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              {METODOS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Form.Select>
          </Col>

          <Col xs={12}>
            <Form.Label>Descrição do atendimento</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Descreva o motivo, orientações, encaminhamentos, protocolos, etc."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </Col>

          <Col md={3} xs={12}>
            <Form.Label>Data</Form.Label>
            <Form.Control type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </Col>

          <Col md={3} xs={12}>
            <Form.Label>Hora</Form.Label>
            <Form.Control type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          </Col>

          <Col md={6} xs={12}>
            <Form.Label>Funcionário responsável</Form.Label>
            <Form.Control
              placeholder="Ex.: Maria Aparecida"
              value={funcionario}
              onChange={(e) => setFuncionario(e.target.value)}
            />
          </Col>
        </Row>

        <div className="mt-3 d-flex gap-2">
          <Button type="submit" variant="primary" disabled={salvando}>
            {salvando ? (<><Spinner size="sm" /> Salvando...</>) : "Salvar atendimento"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowConsulta((s) => !s)}
            aria-controls="painel-consulta"
            aria-expanded={showConsulta}
          >
            Consultar atendimentos
          </Button>
        </div>
      </Form>

      {/* Consulta */}
      <Collapse in={showConsulta}>
        <div id="painel-consulta" className="mt-4 border rounded p-3">
          <h5 className="mb-3">Atendimentos realizados</h5>

          <Row className="g-3 align-items-end mb-2">
            <Col md={6} xs={12}>
              <InputGroup>
                <Form.Control
                  placeholder="Buscar por nome, funcionário ou descrição"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  aria-label="Busca de atendimentos"
                />
                <Button onClick={fetchAtendimentos} variant="outline-secondary">
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </Col>

            <Col md={3} xs={12}>
              <Form.Label>Filtrar por método</Form.Label>
              <Form.Select value={filtroMetodo} onChange={(e) => setFiltroMetodo(e.target.value)}>
                <option value="">Todos</option>
                {METODOS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3} xs={12}>
              <Form.Label>Filtrar por data</Form.Label>
              <Form.Control type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
            </Col>
          </Row>

          <div className="mb-2">
            <Button size="sm" variant="outline-primary" onClick={fetchAtendimentos} disabled={carregandoLista}>
              {carregandoLista ? "Atualizando..." : "Atualizar lista"}
            </Button>
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Tipo</th>
                <th>Atendido</th>
                <th>Método</th>
                <th>Descrição</th>
                <th>Funcionário</th>
              </tr>
            </thead>
            <tbody>
              {carregandoLista ? (
                <tr><td colSpan={6} className="text-center">Carregando...</td></tr>
              ) : atendimentosFiltradosOrdenados.length === 0 ? (
                <tr><td colSpan={6} className="text-center">Nenhum atendimento encontrado.</td></tr>
              ) : (
                atendimentosFiltradosOrdenados.map((a) => {
                  // suporte a campos: a.data ("yyyy-MM-dd"), a.hora ("HH:mm") ou createdAt ISO
                  const dataStr = a?.data
                    ? a.hora
                      ? `${format(parseISO(`${a.data}T${a.hora}`), "dd/MM/yyyy HH:mm")}`
                      : `${format(parseISO(`${a.data}T00:00`), "dd/MM/yyyy")} ${a.hora || ""}`
                    : a?.createdAt
                      ? format(parseISO(a.createdAt), "dd/MM/yyyy HH:mm")
                      : "-";

                  return (
                    <tr key={a.id || `${a.nomeAtendido}-${a.data}-${a.hora}-${Math.random()}`}>
                      <td>{dataStr}</td>
                      <td>{a?.tipoAtendido || "-"}</td>
                      <td>{a?.nomeAtendido || "-"}</td>
                      <td>{a?.metodo || "-"}</td>
                      <td style={{ maxWidth: 420, whiteSpace: "pre-wrap" }}>{a?.descricao || "-"}</td>
                      <td>{a?.funcionario || "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </Collapse>
    </Container>
  );
};

export default TelaAtendimentos;
