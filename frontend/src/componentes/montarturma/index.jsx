import { useCallback, useEffect, useState } from 'react';
import {
  Accordion,
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
  Table,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import gregorian_pt_br from 'react-date-object/locales/gregorian_pt_br';
import DatePicker from 'react-multi-date-picker';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { ApiConfig } from '../../api/config';
import { useLoading, useUser } from '../../hooks';
import { ModalTransferencia } from './ModalTransferencia';

const PERMISSIONS_MOCK = ['ADM', 'COORDENADOR'];

export const MontarTurma = () => {
  const [isLoadingButton, setIsLoadingButton] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [matriculas, setMatriculas] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [form, setForm] = useState({
    periodo: [],
    turma_id: '',
  });
  
  const [groupedMatriculas, setGroupedMatriculas] = useState(null);
  const [alocarTurmaId, setAlocarTurmaId] = useState(null);
  const [areTurmasDiferentes, setAreTurmasDiferentes] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedStudentsForTransfer, setSelectedStudentsForTransfer] =
    useState([]);
  const [sourceTurmaForTransfer, setSourceTurmaForTransfer] = useState(null);

  // ===================================================================
  // 1. NOVO ESTADO para controlar o Acordeão
  // ===================================================================
  const [activeAccordionKeys, setActiveAccordionKeys] = useState([]);
  // ===================================================================

  const { openLoading, closeLoading } = useLoading();
  const roleUser = useUser();

  const renderTooltip = (props, message) => (
    <Tooltip id={`tooltip-${Math.random()}`} {...props}>
      {message}
    </Tooltip>
  );

  // ... (funções getData, getTurmas permanecem iguais) ...
  const getData = useCallback(async () => {
    try {
      const periodoString = form.periodo
        .map((dateObj) => dateObj.format('YYYY'))
        .join(';');
      const apiParams = {
        turma_id: form.turma_id,
        periodo: periodoString,
      };
      const result = await ApiConfig.get('/matricula/query', {
        params: apiParams,
      });
      setMatriculas(result.data);
    } catch (error) {
      toast.error('Error ao buscar dados');
      setMatriculas([]);
    }
  }, [form]);

  const getTurmas = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) openLoading();
        const result = await ApiConfig.get('/turma/list');
        const filtered = result?.data ?? [];
        const turmasOrdenadas = [
          ...filtered,
          { id: 'null', nome: 'Sem Turma' },
        ].sort((a, b) => a.nome.localeCompare(b.nome));
        const turmasCompletas = [
          { nome: 'Selecione a turma', id: '' },
          ...turmasOrdenadas,
        ];
        setTurmas(turmasCompletas);
      } catch (error) {
        console.error(error);
        toast.error('Erro ao buscar as turmas para listar');
      } finally {
        if (showLoading) closeLoading();
      }
    },
    [openLoading, closeLoading]
  );
  
  // useEffect para agrupar os alunos (sem alterações)
  useEffect(() => {
    if (!matriculas) {
      setGroupedMatriculas(null);
      return;
    }
    const groups = matriculas.reduce((acc, aluno) => {
      const turmaNome = aluno.turma_nome || 'Sem Turma';
      if (!acc[turmaNome]) {
        acc[turmaNome] = {
          turma_id: aluno.turma_id,
          status: turmas.find(t => t.id === aluno.turma_id)?.status || 'N/A',
          alunos: []
        };
      }
      acc[turmaNome].alunos.push(aluno);
      return acc;
    }, {});
    const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
      if (a === 'Sem Turma') return 1;
      if (b === 'Sem Turma') return -1;
      return a.localeCompare(b);
    });
    const sortedGroups = {};
    for (const key of sortedGroupKeys) {
      sortedGroups[key] = groups[key];
    }
    setGroupedMatriculas(sortedGroups);
  }, [matriculas, turmas]);

  // useEffect para checar turmas diferentes (sem alterações)
  useEffect(() => {
    if (selectedRows.length < 2) {
      setAreTurmasDiferentes(false);
      return;
    }
    const firstTurmaId = selectedRows[0].turma_id;
    const different = selectedRows.some(
      (row) => row.turma_id !== firstTurmaId
    );
    setAreTurmasDiferentes(different);
  }, [selectedRows]);

  // ... (funções handleSelectedRow, isSelected, handleRemoveRow permanecem iguais) ...
  const handleSelectedRow = useCallback(
    (item) => {
      setSelectedRows((prev) => [...prev, item]);
    },
    []
  );

  const isSelected = useCallback(
    (item) =>
      !!selectedRows?.find((row) => row.campo_unico === item?.campo_unico),
    [selectedRows]
  );

  const handleRemoveRow = useCallback(
    (item) => {
      const filteredItems = selectedRows?.filter(
        (row) => row?.campo_unico !== item?.campo_unico
      );
      setSelectedRows(filteredItems);
    },
    [selectedRows]
  );

  // Funções de seleção por grupo (sem alterações)
  const handleSelectGroup = (alunosDoGrupo, checked) => {
    const groupIds = alunosDoGrupo.map(a => a.campo_unico);
    
    if (checked) {
      setSelectedRows(prev => [
        ...prev.filter(row => !groupIds.includes(row.campo_unico)),
        ...alunosDoGrupo
      ]);
    } else {
      setSelectedRows(prev => prev.filter(row => !groupIds.includes(row.campo_unico)));
    }
  };

  const isGroupSelected = (alunosDoGrupo) => {
    return alunosDoGrupo.every(aluno => isSelected(aluno));
  };


  const handleFiltered = useCallback(async () => {
    setIsLoadingButton(true);
    setSelectedRows([]);
    setAlocarTurmaId(null);
    setMatriculas(null);
    setGroupedMatriculas(null);
    
    // ===================================================================
    // 2. FECHA O ACORDEÃO ao clicar em buscar
    // ===================================================================
    setActiveAccordionKeys([]);
    // ===================================================================

    await getData();
    setIsLoadingButton(false);
  }, [getData]); // getData já está com 'useCallback'

  // ... (funções onUpdate, onSave, handleAlocarClick, etc... permanecem iguais) ...
  // Elas já contêm a lógica correta do campo_unico (mat + turma + ano)
  const updateMatricula = useCallback(async (payload) => {
    try {
      await ApiConfig.put(`/matricula/matricula/${payload?.id}`, payload);
    } catch (error) {
      toast.error('Erro ao atualizar a matrícula');
    }
  }, []);

  const executeFunctionWithRole = useCallback(
    (functionCallback) => {
      if (!PERMISSIONS_MOCK.includes(roleUser?.role)) {
        toast.warning('Você não possui permissão para executar essa ação!');
        return;
      }
      functionCallback();
    },
    [roleUser?.role]
  );
  
  const onUpdate = useCallback(
    async (id, payload) => {
      try {
        const novoCampoUnico = `${payload?.id}_${payload?.turma_id}_${payload?.ano_letivo}`;
        await ApiConfig.put(`/aluno-turma/update/${id}`, {
          matricula_id: payload?.id,
          turma_id: payload?.turma_id,
          ano_letivo: payload?.ano_letivo,
          data_alocacao: new Date().toISOString().split('T')[0],
          campo_unico: novoCampoUnico,
        });
        toast.success(`Aluno ${payload.aluno_nome} atualizado.`);
        handleRemoveRow(payload);
      } catch (error) {
        const message = error?.response?.data?.message;
        toast.error(`Erro ao atualizar, ${message}`);
      }
    },
    [handleRemoveRow]
  );

  const onSave = useCallback(
    async (payload) => {
      try {
        const novoCampoUnico = `${payload?.id}_${payload?.turma_id}_${payload?.ano_letivo}`;
        await ApiConfig.post('/aluno-turma/create', {
          matricula_id: payload?.id,
          turma_id: payload?.turma_id,
          ano_letivo: payload?.ano_letivo,
          data_alocacao: new Date().toISOString().split('T')[0],
          campo_unico: novoCampoUnico,
        });
        await updateMatricula(payload);
        toast.success(`Aluno ${payload.aluno_nome} alocado com sucesso.`);
        handleRemoveRow(payload);
      } catch (error) {
        const message = error?.response?.data?.message;
        toast.error(`Erro ao salvar, ${message}`);
      }
    },
    [updateMatricula, handleRemoveRow]
  );
  
  const handleAlocarClick = () => {
    if (!alocarTurmaId) {
      toast.error('Selecione uma turma de destino.');
      return;
    }
    const turmaDestino = turmas.find((t) => t.id === alocarTurmaId);
    if (!turmaDestino) {
      toast.error('Turma de destino inválida.');
      return;
    }
    executeFunctionWithRole(async () => {
      for (const row of selectedRows) {
        const payload = {
          ...row,
          turma_id: turmaDestino.id,
          turma_nome: turmaDestino.nome,
          ano_letivo: turmaDestino.ano_letivo,
        };
        const alunoTurmaId = payload?.aluno_turma_id;
        if (alunoTurmaId) {
          await onUpdate(alunoTurmaId, payload);
        } else {
          await onSave(payload);
        }
      }
    });
  };

  const defaultValue = useCallback(
    (turmaId) => {
      const filtered = turmas?.find((turma) => turma?.id === turmaId);
      if (!filtered) return null;
      return {
        value: filtered?.id,
        label: filtered?.nome,
        ...filtered,
      };
    },
    [turmas]
  );

  const getAlocarDisabledReason = () => {
    if (!alocarTurmaId) {
      return 'Selecione uma turma de destino primeiro.';
    }
    const filtered = turmas?.find((turma) => turma?.id === alocarTurmaId);
    if (!filtered) return 'Turma de destino inválida.';
    const status = filtered?.status?.toLowerCase();
    if (
      status !== 'Não iniciada'.toLowerCase() &&
      status !== 'Aberta para Alocação'.toLowerCase()
    ) {
      return `A turma "${filtered.nome}" não pode receber alunos (Status: ${filtered.status}).`;
    }
    return null;
  };

  const canTransferStudents = useCallback(() => {
    if (!selectedRows?.length) return false;
    const firstTurmaId = selectedRows[0].turma_id;
    if (!firstTurmaId || firstTurmaId === 'null') return false;
    const sourceTurma = turmas?.find((t) => t.id === firstTurmaId);
    if (!sourceTurma || sourceTurma.status !== 'Concluída') {
      return false;
    }
    return selectedRows.every((aluno) => aluno.turma_id === firstTurmaId);
  }, [selectedRows, turmas]);

  const handleOpenTransferModal = useCallback(() => {
    if (!canTransferStudents()) {
      return;
    }
    const firstStudent = selectedRows[0];
    const sourceTurma = turmas?.find((t) => t.id === firstStudent.turma_id);
    setSourceTurmaForTransfer(sourceTurma);
    setSelectedStudentsForTransfer(selectedRows);
    setShowTransferModal(true);
  }, [canTransferStudents, turmas, selectedRows]);

  const handleCloseTransferModal = useCallback(() => {
    setShowTransferModal(false);
    setSelectedStudentsForTransfer([]);
    setSourceTurmaForTransfer(null);
  }, []);

  const handleTransferSuccess = useCallback(() => {
    setSelectedRows([]);
    setAlocarTurmaId(null);
    getData();
    getTurmas(false);
  }, [getData, getTurmas]);

  useEffect(() => {
    getTurmas();
  }, [getTurmas]);

  const isFiltroDisabled =
    form.periodo.length === 0 && form.turma_id === '';

  const alocarDisabledReason = getAlocarDisabledReason();
  const canTransfer = canTransferStudents();

  // ===================================================================
  // INÍCIO DO LAYOUT (JSX)
  // ===================================================================
  return (
    <Container>
      <h2 className="mt-4">Montar Turma</h2>

      {/* PAINEL 1: FILTROS (Sem alterações) */}
      <Card className="mb-4">
        <Card.Header as="h5">1. Filtrar Alunos</Card.Header>
        <Card.Body>
          <Row>
            <Col md={5}>
              <Form.Group controlId="filtroAno">
                <Form.Label>Ano Letivo</Form.Label>
                <InputGroup>
                  <DatePicker
                    placeholder="Escolha os anos que deseja filtrar"
                    multiple
                    onlyYearPicker
                    format="YYYY"
                    name="periodo"
                    containerClassName="w-100"
                    inputClass="form-control"
                    locale={gregorian_pt_br}
                    value={form.periodo}
                    onChange={(dateObjects) => {
                      setForm((prev) => ({
                        ...prev,
                        periodo: dateObjects || [],
                      }));
                    }}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group controlId="filtroTurma">
                <Form.Label>Turma</Form.Label>
                <InputGroup>
                  <Select
                    className="w-100"
                    name="filtro_turma_id"
                    placeholder="Selecione a turma"
                    value={defaultValue(form?.turma_id)}
                    options={turmas?.map((t) => ({
                      value: t.id,
                      label: t.nome,
                    }))}
                    onChange={({ value }) =>
                      setForm((prev) => ({ ...prev, turma_id: value || '' }))
                    }
                    isClearable
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <OverlayTrigger
                placement="top"
                overlay={renderTooltip(
                  {},
                  'Selecione um Ano Letivo ou uma Turma para buscar.'
                )}
              >
                <span className="d-grid w-100">
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={handleFiltered}
                    disabled={isLoadingButton || isFiltroDisabled}
                    style={
                      isFiltroDisabled ? { pointerEvents: 'none' } : {}
                    }
                  >
                    {isLoadingButton ? 'Buscando' : 'Buscar'}&nbsp;
                    {isLoadingButton && (
                      <Spinner as="span" animation="border" size="sm" />
                    )}
                  </Button>
                </span>
              </OverlayTrigger>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* LAYOUT DE DUAS COLUNAS */}
      <Row>
        {/* =================================================================== */}
        {/* COLUNA DA ESQUERDA (Mestre / Resultados com ACORDEÃO)               */}
        {/* =================================================================== */}
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header as="h5">2. Lista de Alunos</Card.Header>
            <Card.Body
              style={{ minHeight: '500px', maxHeight: '70vh', overflowY: 'auto' }}
              className="p-0"
            >
              {isLoadingButton ? (
                <div className="text-center p-5">
                  <Spinner animation="border" role="status" />
                  <p className="mt-2 text-muted">Buscando alunos...</p>
                </div>
              ) : groupedMatriculas === null ? (
                <div className="text-center p-5 text-muted">
                  <i className="bi bi-search fs-3"></i>
                  <p className="mt-2">
                    Use os filtros acima para buscar alunos.
                  </p>
                </div>
              ) : Object.keys(groupedMatriculas).length === 0 ? (
                <div className="text-center p-5 text-muted">
                  <i className="bi bi-x-circle fs-3"></i>
                  <p className="mt-2">
                    Nenhum aluno encontrado para os filtros informados.
                  </p>
                </div>
              ) : (
                // 3. ACORDEÃO CONTROLADO
                <Accordion
                  activeKey={activeAccordionKeys}
                  onSelect={(keys) => setActiveAccordionKeys(keys)}
                  alwaysOpen
                >
                  {Object.entries(groupedMatriculas).map(([turmaNome, data], index) => {
                    const { alunos, status } = data;
                    const isGrupoTodoSelecionado = isGroupSelected(alunos);
                    const eventKey = index.toString();
                    
                    return (
                      <Accordion.Item eventKey={eventKey} key={turmaNome}>
                        <Accordion.Header>
                          {/* 4. CHECKBOX MOVIDO PARA O HEADER */}
                          <Form.Check
                            type="checkbox"
                            id={`select-group-${index}`}
                            label=""
                            checked={isGrupoTodoSelecionado}
                            onChange={(e) => handleSelectGroup(alunos, e.target.checked)}
                            onClick={(e) => e.stopPropagation()} // Impede o acordeão de abrir/fechar
                            className="me-2"
                          />
                          <span className="fw-bold">{turmaNome}</span>
                          <span className="ms-2 text-muted">
                            ({alunos.length} alunos)
                          </span>
                          {status !== 'N/A' && (
                             <span className={`ms-2 badge bg-${status === 'Concluída' ? 'success' : 'secondary'}`}>
                               {status}
                             </span>
                          )}
                        </Accordion.Header>
                        <Accordion.Body className="p-0">
                          <Table striped bordered hover responsive="md" size="sm" className="mb-0">
                            <thead>
                              <tr>
                                {/* 5. HEADER DA TABELA LIMPO */}
                                <th>{/* Coluna para checkbox individual */}</th>
                                <th>Aluno</th>
                                <th>Ano</th>
                              </tr>
                            </thead>
                            <tbody>
                              {alunos.map((item) => (
                                <tr key={item?.campo_unico}>
                                  <td>
                                    <Form.Check
                                      type="checkbox"
                                      id={`select-aluno-${item.id}`}
                                      label=""
                                      checked={isSelected(item)}
                                      onChange={() => {
                                        const isChecked = isSelected(item);
                                        if (isChecked) {
                                          handleRemoveRow(item);
                                        } else {
                                          handleSelectedRow(item);
                                        }
                                      }}
                                    />
                                  </td>
                                  <td>{item?.aluno_nome}</td>
                                  <td>{item?.ano_letivo}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </Accordion.Body>
                      </Accordion.Item>
                    )
                  })}
                </Accordion>
              )}
            </Card.Body>
            {matriculas && matriculas.length > 0 && (
              <Card.Footer className="text-muted">
                {matriculas.length} aluno(s) encontrado(s) em {Object.keys(groupedMatriculas || {}).length} grupo(s).
              </Card.Footer>
            )}
          </Card>
        </Col>

        {/* =================================================================== */}
        {/* COLUNA DA DIREITA (Painel de Ações) (Sem alterações)                */}
        {/* =================================================================== */}
        <Col md={4}>
          <Card
            className="mb-4 shadow-sm"
            border="primary"
            style={{ position: 'sticky', top: '20px' }}
          >
            <Card.Header as="h5" className="bg-primary bg-opacity-10">
              3. Ações ({selectedRows.length} selecionados)
            </Card.Header>
            <Card.Body style={{ minHeight: '300px' }}>
              {selectedRows.length === 0 ? (
                <div className="text-center p-4 text-muted d-flex align-items-center justify-content-center h-100">
                  <div>
                    <i className="bi bi-hand-index-thumb fs-2"></i>
                    <p className="mt-2">
                      Selecione um ou mais alunos na lista ao lado para agir.
                    </p>
                  </div>
                </div>
              ) : canTransfer ? (
                // --- PAINEL DE PROMOÇÃO (TRANSFERÊNCIA) ---
                <div className="p-3 text-center">
                  <Alert variant="success">
                    <Alert.Heading>
                      <i className="bi bi-arrow-up-circle-fill"></i> Promover
                      Alunos
                    </Alert.Heading>
                    <p className="mb-0">
                      Você selecionou <strong>{selectedRows.length}</strong>{' '}
                      aluno(s) de uma turma concluída.
                    </p>
                  </Alert>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleOpenTransferModal}
                    className="px-4 mt-3 w-100"
                  >
                    <i className="bi bi-arrow-right-circle"></i> Iniciar
                    Transferência
                  </Button>
                </div>
              ) : (
                // --- PAINEL DE ALOCAÇÃO / REMANEJAMENTO ---
                <div className="p-2">
                  <Alert variant="info">
                    <strong>Alocar ou Remanejar Alunos</strong>
                    <p className="mb-0 mt-1">
                      Escolha a turma de destino para os{' '}
                      <strong>{selectedRows.length}</strong> aluno(s)
                      selecionados.
                    </p>
                  </Alert>

                  {/* AVISO DE TURMAS DIFERENTES */}
                  {areTurmasDiferentes && (
                    <Alert variant="warning" className="py-2">
                      <i className="bi bi-exclamation-triangle-fill"></i>{' '}
                      <strong>Atenção:</strong> Você está movendo alunos de
                      turmas diferentes.
                    </Alert>
                  )}

                  <Form.Group controlId="alocarTurma" className="my-3">
                    <Form.Label>
                      <strong>Selecione a Turma de Destino:</strong>
                    </Form.Label>
                    <Select
                      name="turma_id_selecionados"
                      options={turmas
                        ?.filter(
                          (turma) =>
                            turma?.id !== '' && turma?.id !== 'null'
                        )
                        ?.map((t) => ({
                          value: t.id,
                          label: `${t.nome} (${t.ano_letivo}) - Status: ${t.status}`,
                          ano_letivo: t.ano_letivo,
                          ...t,
                        }))}
                      placeholder="Selecione a turma..."
                      onChange={(selectedOption) => {
                        setAlocarTurmaId(selectedOption?.value || null);
                      }}
                    />
                  </Form.Group>

                  <OverlayTrigger
                    placement="top"
                    overlay={renderTooltip(
                      {},
                      alocarDisabledReason || 'Salvar alocações na turma'
                    )}
                  >
                    <span className="d-grid w-100">
                      <Button
                        variant="primary"
                        className="w-100"
                        size="lg"
                        onClick={handleAlocarClick}
                        disabled={!!alocarDisabledReason}
                        style={
                          alocarDisabledReason
                            ? { pointerEvents: 'none' }
                            : {}
                        }
                      >
                        <i className="bi bi-check-lg"></i> Salvar Alocações
                      </Button>
                    </span>
                  </OverlayTrigger>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* MODAL DE TRANSFERÊNCIA (Já modificado) */}
      <ModalTransferencia
        show={showTransferModal}
        onHide={handleCloseTransferModal}
        sourceTurma={sourceTurmaForTransfer}
        selectedStudents={selectedStudentsForTransfer}
        onTransferSuccess={handleTransferSuccess}
      />
    </Container>
  );
};