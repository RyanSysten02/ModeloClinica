import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './paginical.css'; 

export default function Paginicial(){
    return(
            <Container fluid className="pagina-inicial d-flex flex-column min-vh-100">
              <header className="bg-primary text-white text-center py-4">
                <h1>Pagina Protegida</h1>
                <p>teste da pagina Protegida.</p>
              </header>
        
              <main className="flex-grow-1 py-5">
                <Container>
                  <Row className="g-4">
                    <Col xs={12} md={4}>
                      <Card className="shadow">
                        <Card.Body>
                          <Card.Title>Funcionalidade 1</Card.Title>
                          <Card.Text>
                            Descubra as funcionalidades incríveis do nosso aplicativo. Veja como ele pode ajudar você a atingir seus objetivos.
                          </Card.Text>
                          <Button variant="primary">Saiba Mais</Button>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={12} md={4}>
                      <Card className="shadow">
                        <Card.Body>
                          <Card.Title>Funcionalidade 2</Card.Title>
                          <Card.Text>
                            Explore as funcionalidades avançadas que tornam nosso aplicativo único. Conheça mais detalhes.
                          </Card.Text>
                          <Button variant="primary">Saiba Mais</Button>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={12} md={4}>
                      <Card className="shadow">
                        <Card.Body>
                          <Card.Title>Funcionalidade 3</Card.Title>
                          <Card.Text>
                            Saiba mais sobre os benefícios e aspectos únicos do nosso aplicativo. Veja como ele pode fazer a diferença.
                          </Card.Text>
                          <Button variant="primary">Saiba Mais</Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Container>
              </main>
        
              <footer className="bg-light text-center py-4">
                <p>© 2024 Nosso Aplicativo. Todos os direitos reservados.</p>
              </footer>
            </Container>
    )
}