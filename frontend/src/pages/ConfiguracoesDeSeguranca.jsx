import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

export default function ConfiguracoesDeSeguranca() {
  const [roles, setRoles] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [permissoes, setPermissoes] = useState({});
  const [filtro, setFiltro] = useState('');
  const [roleSelecionada, setRoleSelecionada] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5001/api/permissoes')
      .then(res => res.json())
      .then(data => {
        setRoles(Object.keys(data));
        setPermissoes(data);

        const todosRecursos = new Set();
        Object.values(data).forEach(perms => {
          Object.keys(perms).forEach(recurso => todosRecursos.add(recurso));
        });
        setRecursos(Array.from(todosRecursos));
      });
  }, []);

  const togglePermissao = (role, recurso) => {
    setPermissoes(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [recurso]: !prev[role][recurso]
      }
    }));
  };

  const salvarPermissoes = async () => {
  try {
    const res = await fetch('http://localhost:5001/api/permissoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permissoes)
    });

    if (res.ok) {
      toast.success('Permissões salvas com sucesso!');
    } else {
      toast.error('Erro ao salvar permissões.');
    }
  } catch (error) {
    toast.error('Erro de conexão ao salvar permissões.');
  }
};


  const rolesFiltradas = roles.filter(role =>
    role.toLowerCase().includes(filtro.toLowerCase())
  );

  const fadeVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">Configurações de Segurança</h2>

      <AnimatePresence mode="wait">
        {!roleSelecionada ? (
          <motion.div
            key="lista-funcoes"
            variants={fadeVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <InputGroup className="mb-4">
              <Form.Control
                placeholder="Pesquisar função..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </InputGroup>

            <Row xs={1} md={2} lg={3} className="g-4">
              {rolesFiltradas.map(role => (
                <Col key={role}>
                  <Card className="shadow-sm h-100 hover-card" onClick={() => setRoleSelecionada(role)} style={{ cursor: 'pointer' }}>
                    <Card.Body className="text-center">
                      <h5 className="fw-bold text-primary">{role}</h5>
                      <p className="text-muted mb-0">Clique para configurar permissões</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              {rolesFiltradas.length === 0 && (
                <p className="text-center text-muted">Nenhuma função encontrada.</p>
              )}
            </Row>
          </motion.div>
        ) : (
          <motion.div
            key="configuracoes-funcao"
            variants={fadeVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="shadow mt-3">
              <Card.Header className="bg-primary text-white text-center fw-bold">
                Permissões da função: {roleSelecionada}
              </Card.Header>
              <Card.Body>
                {recursos.map(recurso => (
                  <Form.Check
                    key={recurso}
                    type="switch"
                    id={`${roleSelecionada}-${recurso}`}
                    label={recurso.charAt(0).toUpperCase() + recurso.slice(1)}
                    checked={permissoes[roleSelecionada]?.[recurso] || false}
                    onChange={() => togglePermissao(roleSelecionada, recurso)}
                    className="mb-2"
                  />
                ))}
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button variant="success" onClick={salvarPermissoes}>
                <i className="bi bi-save me-2"></i>Salvar Permissões
              </Button>
              <Button variant="outline-primary" onClick={() => setRoleSelecionada(null)}>
                <i className="bi bi-arrow-left me-2"></i>Voltar à lista de funções
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="d-flex justify-content-center mt-4">
        <Button variant="secondary" onClick={() => navigate("/paginicial")}>
          <i className="bi bi-house-door-fill me-2"></i>Voltar ao Início
        </Button>
      </div>
    </Container>
  );
}
