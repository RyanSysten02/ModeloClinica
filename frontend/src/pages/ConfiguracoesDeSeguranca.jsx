import { useEffect, useState } from 'react';
import { Container, Table, Button, Form } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";

export default function ConfiguracoesDeSeguranca() {
  const [roles, setRoles] = useState([]);
  const [recursos, setRecursos] = useState(['aluno', 'professor', 'responsavel']);
  const [permissoes, setPermissoes] = useState({}); // { ADM: { aluno: true, professor: false, ... }, ... }
  const navigate = useNavigate();
  useEffect(() => {
    fetch('http://localhost:5001/api/permissoes')
      .then(res => res.json())
      .then(data => {
        setRoles(Object.keys(data));
        setPermissoes(data);
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
    await fetch('http://localhost:5001/api/permissoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permissoes)
    });
    alert('Permissões salvas!');
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Configurações de Segurança</h2>
      <Table striped bordered hover responsive className="text-center">
        <thead>
          <tr>
            <th>Função</th>
            {recursos.map(recurso => (
              <th key={recurso}>{recurso}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role}>
              <td className="fw-bold">{role}</td>
              {recursos.map(recurso => (
                <td key={recurso}>
                  <Form.Check
                    type="checkbox"
                    checked={permissoes[role]?.[recurso] || false}
                    onChange={() => togglePermissao(role, recurso)}
                    className="mx-auto"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

    <div className="d-flex justify-content-center gap-3 mt-4">
      <Button variant="primary" onClick={salvarPermissoes}>
        Salvar Permissões
      </Button>

      <Button variant="secondary" onClick={() => navigate("/paginicial")}>
        <i className="bi bi-house-door-fill me-2"></i>
        Voltar para o início
      </Button>
    </div>

    </Container>
  );
}