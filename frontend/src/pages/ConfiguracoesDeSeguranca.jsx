import { useEffect, useState } from 'react';
// --- Importações Atualizadas ---
import { Container, Row, Col, Card, Button, Form, InputGroup, Tabs, Tab, Spinner } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

// --- Nome original mantido ---
export default function ConfiguracoesDeSeguranca() {
  const navigate = useNavigate();

  // --- Estados para Permissões (Seu código original) ---
  const [roles, setRoles] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [permissoes, setPermissoes] = useState({});
  const [filtro, setFiltro] = useState('');
  const [roleSelecionada, setRoleSelecionada] = useState(null);

  // --- Estados para Configuração de Email (Novos) ---
  const [configEmail, setConfigEmail] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: false,
    sender_name: '',
    sender_email: ''
  });
  const [loadingEmail, setLoadingEmail] = useState(true);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  // --- Efeito para carregar DADOS DAS PERMISSÕES ---
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
      })
      .catch(err => toast.error("Erro ao carregar permissões."));
  }, []);

  // --- Efeito para carregar DADOS DE EMAIL ---
  useEffect(() => {
    const fetchConfig = async () => {
      setLoadingEmail(true);
      try {
        const token = localStorage.getItem("token"); 
        const res = await fetch('http://localhost:5001/api/configuracao-email', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setConfigEmail(data);
        } else {
          toast.error("Falha ao carregar configuração de e-mail.");
        }
      } catch (error) {
        toast.error("Erro de conexão ao carregar dados de e-mail.");
      } finally {
        setLoadingEmail(false);
      }
    };
    fetchConfig();
  }, []);


  // --- Funções de Permissões (Seu código original) ---
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

  
  // --- Funções de Configuração de Email (Novas) ---
  const handleSalvarEmail = async () => {
    setIsSavingEmail(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('http://localhost:5001/api/configuracao-email', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(configEmail)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro de conexão ao salvar e-mail.');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleTestarEmail = async () => {
    setIsTestingEmail(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('http://localhost:5001/api/configuracao-email/testar', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(configEmail) 
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Erro de conexão ao testar e-mail.');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleChangeEmail = (e) => {
    const { name, value } = e.target;
    setConfigEmail(prev => ({
      ...prev,
      [name]: name === 'smtp_port' ? parseInt(value) || 0 : value
    }));
  };

  const handleSecureToggleEmail = (e) => {
    setConfigEmail(prev => ({
      ...prev,
      smtp_secure: e.target.checked
    }));
  };


  // --- Variantes de Animação ---
  const fadeVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <Container className="py-5">
      {/* --- Título Alterado --- */}
      <h2 className="text-center mb-4">Configurações</h2>

      {/* --- NOVO: Estrutura de Abas --- */}
      <Tabs defaultActiveKey="permissoes" id="config-tabs" className="mb-3" fill>
        
        {/* --- ABA 1: PERMISSÕES (Seu código) --- */}
        <Tab eventKey="permissoes" title="Permissões de Acesso">
          <AnimatePresence mode="wait">
            {!roleSelecionada ? (
              <motion.div
                key="lista-funcoes"
                variants={fadeVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <InputGroup className="mb-4 mt-4">
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
        </Tab>

        {/* --- ABA 2: CONFIGURAÇÃO DE EMAIL (Novo) --- */}
        <Tab eventKey="email" title="Configuração de Email">
          <motion.div
            variants={fadeVariant}
            initial="hidden"
            animate="visible"
            className="mt-4" // Adiciona espaço do topo da aba
          >
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Configurações do Servidor SMTP</h5>
              </Card.Header>
              <Card.Body>
                {loadingEmail ? (
                  <div className="text-center p-5">
                    <Spinner animation="border" />
                    <p className="mt-2">Carregando...</p>
                  </div>
                ) : (
                  <Form>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nome do Remetente</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="Ex: Escola Saber"
                            name="sender_name"
                            value={configEmail.sender_name}
                            onChange={handleChangeEmail}
                          />
                          <Form.Text>O nome que aparecerá no campo "De:".</Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>E-mail do Remetente</Form.Label>
                          <Form.Control 
                            type="email" 
                            placeholder="Ex: contato@escolasaber.com"
                            name="sender_email"
                            value={configEmail.sender_email}
                            onChange={handleChangeEmail}
                          />
                          <Form.Text>O e-mail que aparecerá no campo "De:".</Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <hr />

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Servidor SMTP (Host)</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="Ex: smtp.gmail.com"
                            name="smtp_host"
                            value={configEmail.smtp_host}
                            onChange={handleChangeEmail}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Porta</Form.Label>
                          <Form.Control 
                            type="number" 
                            placeholder="Ex: 587"
                            name="smtp_port"
                            value={configEmail.smtp_port}
                            onChange={handleChangeEmail}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3} className="d-flex align-items-center pt-3">
                        <Form.Check 
                          type="switch"
                          id="smtp-secure"
                          label="Usar SSL"
                          checked={configEmail.smtp_secure}
                          onChange={handleSecureToggleEmail}
                        />
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Usuário SMTP</Form.Label>
                          <Form.Control 
                            type="email" 
                            placeholder="Geralmente o e-mail completo"
                            name="smtp_user"
                            value={configEmail.smtp_user}
                            onChange={handleChangeEmail}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Senha SMTP</Form.Label>
                          <Form.Control 
                            type="password" 
                            placeholder="Senha do e-mail ou 'Senha de App' (Google/Microsoft)"
                            name="smtp_pass"
                            value={configEmail.smtp_pass}
                            onChange={handleChangeEmail}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Form>
                )}
              </Card.Body>
            </Card>

            <div className="d-flex justify-content-center gap-3 mt-4">
              <Button 
                variant="info" 
                onClick={handleTestarEmail} 
                disabled={isTestingEmail || isSavingEmail || loadingEmail}
              >
                {isTestingEmail ? (
                  <><Spinner as="span" animation="border" size="sm" /> Testando...</>
                ) : (
                  <><i className="bi bi-send-check me-2"></i>Testar Conexão</>
                )}
              </Button>
              
              <Button 
                variant="success" 
                onClick={handleSalvarEmail} 
                disabled={isSavingEmail || isTestingEmail || loadingEmail}
              >
                {isSavingEmail ? (
                  <><Spinner as="span" animation="border" size="sm" /> Salvando...</>
                ) : (
                  <><i className="bi bi-save me-2"></i>Salvar Configuração</>
                )}
              </Button>
            </div>
          </motion.div>
        </Tab>
      </Tabs>

      {/* --- Botão Global de Voltar --- */}
      <div className="d-flex justify-content-center mt-4">
        <Button variant="secondary" onClick={() => navigate("/paginicial")}>
          <i className="bi bi-house-door-fill me-2"></i>Voltar ao Início
        </Button>
      </div>
    </Container>
  );
}