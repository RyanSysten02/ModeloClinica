import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Col,
  Container,
  InputGroup,
  Row,
  Table,
} from 'react-bootstrap';
import gregorian_pt_br from 'react-date-object/locales/gregorian_pt_br';
import DatePicker from 'react-multi-date-picker';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { ApiConfig } from '../../api/config';
import { useUser } from '../../hooks';

const PERMISSIONS_MOCK = ['ADM', 'COORDENADOR'];

export const MontarTurma = () => {
  const [selectedRows, setSelectedRows] = useState();
  const [matriculas, setMatriculas] = useState();
  const [turmas, setTurmas] = useState();
  const [form, setForm] = useState({
    periodo: [],
  });

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

  const getTurmas = async () => {
    try {
      const result = await ApiConfig.get('/turma/list');
      const filtered = result?.data;

      setTurmas(filtered);
    } catch (error) {
      toast.error('Erro ao buscar as turmas para listar');
    }
  };

  const handleSelectedRow = useCallback(
    (item) => {
      const filteredItems =
        selectedRows?.filter((row) => row?.aluno_id !== item?.aluno_id) || [];

      setSelectedRows((_) => [...filteredItems, item]);
    },
    [selectedRows]
  );

  const isSelected = useCallback(
    (item) => selectedRows?.find((row) => row.aluno_id === item?.aluno_id),
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

  const handleFiltered = useCallback(async () => {
    await getData();
  }, [getData]);

  const updateMatricula = useCallback(async (payload) => {
    try {
      await ApiConfig.put(`/matricula/matricula/${payload?.id}`, payload);
    } catch (error) {
      toast.error('Erro ao atualizar a matrícula');
    }
  }, []);

  const executeFuncionWithRole = useCallback(
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

      executeFuncionWithRole(async () => {
        await caseFunction();
      });
    },
    [executeFuncionWithRole, onSave, onUpdate]
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

  useEffect(() => {
    getTurmas();
  }, []);

  return (
    <Container>
      <h2 className='mt-4'>Montar Turma</h2>

      <Row className='mt-4 mb-4 w-100'>
        <Col className='col-6'>
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
        <Col className='col-2'>
          <Button
            variant='primary'
            className='w-100'
            onClick={handleFiltered}
            disabled={!form?.periodo?.length}
          >
            Buscar
          </Button>
        </Col>
      </Row>

      {matriculas?.length > 0 && (
        <Row>
          <Col>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Turma</th>
                  <th>Ano Letivo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {matriculas?.map((item, index) => (
                  <tr
                    key={item?.aluno_id || index}
                    className='user-select-none'
                  >
                    <td>{item?.aluno_id}</td>
                    <td>{item?.aluno_nome}</td>
                    <td>{item?.turma_nome || 'Sem turma'}</td>
                    <td>{item?.ano_letivo}</td>
                    <td>{item?.status}</td>
                    <td className='d-flex gap-2 justify-content-center'>
                      <Button
                        variant='primary'
                        onClick={() => handleSelectedRow(item)}
                        disabled={isSelected(item)}
                      >
                        Selecionar
                      </Button>
                    </td>
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
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Turma</th>
                  <th>Ano Letivo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {selectedRows?.map((item, index) => (
                  <tr
                    key={item?.aluno_id || index}
                    className='user-select-none'
                  >
                    <td>{item?.aluno_id}</td>
                    <td>{item?.aluno_nome}</td>
                    <td>
                      <Select
                        name='turma_id'
                        value={defaultValue(item?.turma_id)}
                        onChange={({ value }) => handleEdit(item?.id, value)}
                        options={turmas?.map((t) => ({
                          value: t.id,
                          label: t.nome,
                        }))}
                        placeholder='Selecione a turma'
                      />
                    </td>
                    <td>{item?.ano_letivo}</td>
                    <td>{item?.status}</td>
                    <td className='d-flex gap-2 justify-content-center'>
                      <Button
                        variant='danger'
                        onClick={() => handleRemoveRow(item)}
                      >
                        Remover
                      </Button>
                      <Button
                        variant='primary'
                        onClick={() => handleExecuteFunctions(item)}
                        disabled={isDisabled(item?.turma_id)}
                      >
                        Salvar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      )}
    </Container>
  );
};
