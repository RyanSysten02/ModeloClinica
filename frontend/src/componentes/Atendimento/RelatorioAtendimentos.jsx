import { useState, useEffect } from 'react';
import { Container, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const RelatorioAtendimentos = () => {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [operadores, setOperadores] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [operador, setOperador] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [loading, setLoading] = useState(false);

  // Carrega operadores e responsáveis (mock: mesma lista)
  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data: responsaveis } = await axios.get(
        'http://localhost:5001/api/responsavel/allresponsavel',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { data: operadores } = await axios.get(
        'http://localhost:5001/api/atendimentos/listar/usuarios',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(operadores);
      setOperadores(operadores);
      setResponsaveis(responsaveis);
    } catch (error) {
      console.log('Erro ao carregar usuários', error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const gerarRelatorio = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Construir query string com os parâmetros
      const params = new URLSearchParams({
        dataInicio: dataInicio || '',
        dataFim: dataFim || '',
        operador: operador || '',
        responsavel: responsavel || '',
      }).toString();

      const response = await axios.get(
        `http://localhost:5001/api/atendimentos/relatorios/gerar?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      if (response.data.size === 0) {
        toast.error('Relatório gerado está vazio.');
        return;
      }

      // Criar blob com tipo correto
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Criar link temporário e fazer download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `Relatorio-Atendimentos-${new Date().toISOString().split('T')[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();

      // Limpar recursos
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Relatório gerado com sucesso!');
    } catch (e) {
      toast.error('Erro ao gerar relatório.');
      console.error('Erro detalhado:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1 className='mt-4 mb-4'>Relatório de Atendimentos</h1>

      <Form>
        <Row>
          <Col md={4}>
            <Form.Group className='mb-3'>
              <Form.Label>Data Inicial</Form.Label>
              <Form.Control
                type='date'
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className='mb-3'>
              <Form.Label>Data Final</Form.Label>
              <Form.Control
                type='date'
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group className='mb-3'>
              <Form.Label>Operador</Form.Label>
              <Form.Select
                value={operador}
                onChange={(e) => setOperador(e.target.value)}
                disabled={loading}
              >
                <option value=''>Selecione...</option>
                {operadores.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          {/* <Col md={3}>
            <Form.Group className='mb-3'>
              <Form.Label>Responsável</Form.Label>
              <Form.Select
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                disabled={loading}
              >
                <option value=''>Selecione...</option>
                {responsaveis.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col> */}
        </Row>
      </Form>

      <div className='d-flex justify-content-center mt-3'>
        <Button variant='primary' onClick={gerarRelatorio} disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as='span'
                animation='border'
                size='sm'
                role='status'
                aria-hidden='true'
                className='me-2'
              />
              Gerando Relatório...
            </>
          ) : (
            'Gerar Relatório'
          )}
        </Button>
      </div>
    </Container>
  );
};

export default RelatorioAtendimentos;
