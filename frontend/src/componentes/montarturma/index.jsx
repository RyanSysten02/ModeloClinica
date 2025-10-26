import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Col,
  Container,
  InputGroup,
  Row,
  Spinner,
  Table,
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
  const [selectedRows, setSelectedRows] = useState();
  const [matriculas, setMatriculas] = useState();
  const [turmas, setTurmas] = useState();
  const [form, setForm] = useState({
    periodo: [],
    turma_id: '',
  });
  const [currentTurmaId, setCurrentTurmaId] = useState(null);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedStudentsForTransfer, setSelectedStudentsForTransfer] =
    useState([]);
  const [sourceTurmaForTransfer, setSourceTurmaForTransfer] = useState(null);

  const { openLoading, closeLoading } = useLoading();

  const roleUser = useUser();

  const getData = useCallback(async () => {
    try {
      const result = await ApiConfig.get('/matricula/query', {
        params: form,
      });
      setMatriculas(result.data);
    } catch (error) {
      toast.error('Error ao buscar dados');
    }
  }, [form]);

  const getTurmas = useCallback(async () => {
    try {
      openLoading();
      const result = await ApiConfig.get('/turma/list');
      const filtered = result?.data ?? [];

      const turmas = [...filtered, { id: 'null', nome: 'Sem Turma' }].sort(
        (a, b) => a.nome.localeCompare(b.nome)
      );

      turmas.unshift(...[{ nome: 'Selecione a turma', id: '' }]);

      setTurmas(turmas);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao buscar as turmas para listar');
    } finally {
      closeLoading();
    }
  }, [openLoading, closeLoading]);

  const handleSelectedRow = useCallback(
    (item) => {
      const filteredItems =
        selectedRows?.filter((row) => row?.aluno_id !== item?.aluno_id) || [];

      setSelectedRows((_) => [...filteredItems, item]);
    },
    [selectedRows]
  );

  const isSelected = useCallback(
    (item) =>
      selectedRows?.find((row) => row.campo_unico === item?.campo_unico),
    [selectedRows]
  );

  const handleRemoveRow = useCallback(
    (item) => {
      const filteredItems = selectedRows?.filter(
        (row) => row?.aluno_id !== item?.aluno_id
      );
      setSelectedRows(filteredItems);
    },
    [selectedRows]
  );

  const resetAll = useCallback(() => {
    setSelectedRows();
    setMatriculas([]);
    setCurrentTurmaId(null);
    setSelectedStudentsForTransfer([]);
    setSourceTurmaForTransfer(null);
  }, []);

  const handleFiltered = useCallback(async () => {
    setIsLoadingButton(true);
    resetAll();

    const timer = setTimeout(async () => {
      await getData();

      setIsLoadingButton(false);
      clearTimeout(timer);
    }, 1000);
  }, [resetAll, getData]);

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
        await ApiConfig.put(`/aluno-turma/update/${id}`, {
          matricula_id: payload?.id,
          turma_id: payload?.turma_id,
          ano_letivo: payload?.ano_letivo,
          data_alocacao: new Date().toISOString().split('T')[0],
        });

        toast.success('Sucesso ao atualizar');

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
        await ApiConfig.post('/aluno-turma/create', {
          matricula_id: payload?.id,
          turma_id: payload?.turma_id,
          ano_letivo: payload?.ano_letivo,
          data_alocacao: new Date().toISOString().split('T')[0],
        });

        await updateMatricula(payload);

        await handleFiltered();

        toast.success('Aluno alocado a turma com sucesso');

        handleRemoveRow(payload);
      } catch (error) {
        const message = error?.response?.data?.message;
        toast.error(`Erro ao salvar, ${message}`);
      }
    },
    [updateMatricula, handleFiltered, handleRemoveRow]
  );

  const handleExecuteFunctions = useCallback(
    (payload) => {
      const alunoTurmaId = payload?.aluno_turma_id;

      const caseFunction = {
        edit: () => onUpdate(alunoTurmaId, payload),
        create: () => onSave(payload),
      }[alunoTurmaId ? 'edit' : 'create'];

      executeFunctionWithRole(async () => {
        await caseFunction();
      });
    },
    [executeFunctionWithRole, onSave, onUpdate]
  );

  const handleEdit = useCallback(
    (id, turmaId) => {
      let filtered = selectedRows?.find((row) => row?.id === id);

      if (!filtered || filtered?.turma_id === turmaId) return;

      const filteredTurma = turmas?.find((turma) => turma?.id === turmaId);

      filtered = {
        ...filtered,
        payloadTurma: { ...filteredTurma },
        turma_id: filteredTurma?.id,
        turma_nome: filteredTurma?.nome,
      };
      filtered.type = 'edit';

      setSelectedRows((prev) => [
        ...prev?.filter((row) => row?.id !== id),
        filtered,
      ]);
    },
    [selectedRows, turmas]
  );

  const defaultValue = useCallback(
    (turmaId) => {
      const filtered = turmas?.find((turma) => turma?.id === turmaId);
      if (!filtered) return [];

      return {
        value: filtered?.id,
        label: filtered?.nome,
        ...filtered,
      };
    },
    [turmas]
  );

  const isDisabled = useCallback(
    (turmaId) => {
      const filtered = turmas?.find((turma) => turma?.id === turmaId);

      if (!filtered) return true;

      return (
        filtered?.status?.toLowerCase() !== 'Não iniciada'.toLowerCase() &&
        filtered?.status?.toLowerCase() !== 'Aberta para Alocação'.toLowerCase()
      );
    },
    [turmas]
  );

  const canTransferStudents = useCallback(() => {
    if (!selectedRows?.length) return false;

    return selectedRows.every((aluno) => {
      const turmaDoAluno = turmas?.find((t) => t.id === aluno.turma_id);
      return turmaDoAluno?.status === 'Concluída';
    });
  }, [selectedRows, turmas]);

  const handleOpenTransferModal = useCallback(() => {
    if (!canTransferStudents()) {
      toast.warning(
        'Apenas alunos de turmas com status "Concluída" podem ser transferidos'
      );
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
    setCurrentTurmaId(null);
    getData();
    getTurmas();
  }, [getData, getTurmas]);

  useEffect(() => {
    getTurmas();
  }, [getTurmas]);

  return (
    <Container>
      <h2 className='mt-4'>Montar Turma</h2>

      <Row className='mt-4 mb-4 w-100'>
        <Col className='col-5'>
          <InputGroup className='h-100 w-100'>
            <DatePicker
              placeholder='Escolha os anos que deseja filtar'
              multiple
              onlyYearPicker
              format='YYYY'
              name='periodo'
              containerClassName='w-100 h-100'
              inputClass='px-2 py-2 w-100 h-100 rounded-1 border border-1 border-[#dee2e6] focus-ring'
              locale={gregorian_pt_br}
              value={null}
              onChange={(data) => {
                setForm((prev) => ({
                  ...prev,
                  periodo: data?.join(';'),
                }));
              }}
            />
          </InputGroup>
        </Col>

        <Col className='col-5'>
          <InputGroup className='h-100 w-100'>
            <Select
              className='w-100'
              name='filtro_turma_id'
              placeholder='Selecione a turma'
              value={defaultValue(form?.turma_id)}
              options={turmas?.map((t) => ({
                value: t.id,
                label: t.nome,
              }))}
              onChange={({ value }) =>
                setForm((prev) => ({ ...prev, turma_id: value }))
              }
            />
          </InputGroup>
        </Col>

        <Col className='col-2'>
          <Button
            variant='primary'
            className='w-100'
            onClick={handleFiltered}
            disabled={!form?.periodo?.length && form?.turma_id === ''}
          >
            {isLoadingButton ? 'Buscando' : 'Buscar'}&nbsp;
            {isLoadingButton && (
              <Spinner as='span' animation='border' size='sm' />
            )}
          </Button>
        </Col>
      </Row>

      {selectedRows?.length > 0 && canTransferStudents() && (
        <Row className='mb-4'>
          <Col>
            <div className='d-flex justify-content-center'>
              <Button
                variant='success'
                size='lg'
                onClick={handleOpenTransferModal}
                className='px-4'
              >
                📚 Transferir Alunos para o Próximo Ano
              </Button>
            </div>
            <div className='text-center mt-2'>
              <small className='text-muted'>
                Transferir {selectedRows.length} aluno(s) da turma concluída
                para o ano seguinte
              </small>
            </div>
          </Col>
        </Row>
      )}

      {matriculas?.length > 0 && (
        <Row>
          <Col>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>
                    <input
                      type='checkbox'
                      name='campo_unico'
                      onClick={(event) => {
                        const value = event.target.checked;

                        if (!value) {
                          setSelectedRows();
                          return;
                        }

                        setSelectedRows(matriculas);
                      }}
                    />
                  </th>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Turma</th>
                  <th>Ano Letivo</th>
                </tr>
              </thead>
              <tbody>
                {matriculas?.map((item, index) => (
                  <tr
                    key={item?.aluno_id || index}
                    className='user-select-none'
                  >
                    <td>
                      <input
                        type='checkbox'
                        name='aluno_id'
                        checked={isSelected(item)}
                        onClick={() => {
                          const isChecked = isSelected(item);

                          if (isChecked) {
                            handleRemoveRow(item);
                            return;
                          }

                          handleSelectedRow(item);
                        }}
                      />
                    </td>
                    <td>{item?.aluno_id}</td>
                    <td>{item?.aluno_nome}</td>
                    <td>{item?.turma_nome || 'Sem turma'}</td>
                    <td>{item?.ano_letivo}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      )}

      {selectedRows?.length > 0 && (
        <Row>
          <hr className='w-100 mt-4 mb-4' />
          <Col>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>
                    <Select
                      name='turma_id_selecionados'
                      onChange={({ value }) => {
                        setCurrentTurmaId(value);

                        selectedRows?.forEach((row) =>
                          handleEdit(row?.id, value)
                        );
                      }}
                      options={turmas
                        ?.filter(
                          (turma) => turma?.id !== '' && turma?.id !== 'null'
                        )
                        ?.map((t) => ({
                          value: t.id,
                          label: t.nome,
                        }))}
                      placeholder='Selecione a turma'
                    />
                  </th>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Ano Letivo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {selectedRows?.map((item, index) => (
                  <tr
                    key={item?.aluno_id || index}
                    className='user-select-none'
                  >
                    <td>
                      <span>{item?.turma_nome || ''}</span>
                    </td>
                    <td>{item?.aluno_id}</td>
                    <td>{item?.aluno_nome}</td>
                    <td>{item?.ano_letivo}</td>
                    <td className='d-flex gap-2 justify-content-center'>
                      <Button
                        variant='danger'
                        onClick={() => handleRemoveRow(item)}
                      >
                        Remover
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>
                    <Button
                      variant='primary'
                      className='w-100'
                      onClick={() => {
                        selectedRows?.forEach((row) =>
                          handleExecuteFunctions(row)
                        );
                      }}
                      disabled={isDisabled(currentTurmaId)}
                    >
                      Salvar
                    </Button>
                  </td>
                </tr>
              </tfoot>
            </Table>
          </Col>
        </Row>
      )}

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
