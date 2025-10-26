# API de Transferência de Alunos entre Turmas

## Descrição
Esta funcionalidade permite transferir alunos de uma turma concluída para uma turma do ano seguinte que esteja com status "Não iniciada".

## Endpoints Criados

### 1. Buscar Turmas por Status e Ano Letivo
**GET** `/api/turma/by-status-year`

**Parâmetros de Query:**
- `status` (string, obrigatório): Status da turma ("Concluída", "Não iniciada", "Em andamento", "Encerrada")
- `anoLetivo` (string, obrigatório): Ano letivo (ex: "2025", "2026")

**Exemplo:**
```
GET /api/turma/by-status-year?status=Concluída&anoLetivo=2025
```

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "1A",
    "ano_letivo": "2025",
    "periodo": "manha",
    "semestre": "1",
    "status": "Concluída"
  }
]
```

### 2. Transferir Alunos entre Turmas
**POST** `/api/turma/transfer-students`

**Body:**
```json
{
  "sourceTurmaId": 1,
  "targetTurmaId": 2,
  "studentIds": [1, 2, 3, 4, 5]
}
```

**Validações:**
- A turma de origem deve estar com status "Concluída"
- A turma de destino deve estar com status "Não iniciada"
- A turma de destino deve ser do ano letivo seguinte
- Deve selecionar pelo menos um aluno
- As turmas de origem e destino não podem ser a mesma

**Resposta de Sucesso:**
```json
{
  "message": "Transferência realizada com sucesso! 5 alunos transferidos.",
  "data": {
    "transferredStudents": 5,
    "targetTurmaId": 2,
    "newStatus": "Em andamento"
  }
}
```

## Fluxo de Uso

1. **Buscar turmas concluídas do ano atual:**
   ```
   GET /api/turma/by-status-year?status=Concluída&anoLetivo=2025
   ```

2. **Buscar turmas não iniciadas do ano seguinte:**
   ```
   GET /api/turma/by-status-year?status=Não iniciada&anoLetivo=2026
   ```

3. **Listar alunos da turma de origem:**
   ```
   GET /api/turma/list/students/1
   ```

4. **Realizar transferência:**
   ```
   POST /api/turma/transfer-students
   {
     "sourceTurmaId": 1,
     "targetTurmaId": 2,
     "studentIds": [1, 2, 3, 4, 5]
   }
   ```

## O que acontece na transferência:

1. **Mantém a tabela `matricula` intacta:**
   - ✅ **Preserva o histórico** - não altera a matrícula original
   - ✅ **Mantém rastreabilidade** - permite consultar turma de origem

2. **Cria novos registros na tabela `aluno_turma`:**
   - ✅ **Cria novo registro** para a turma de destino
   - ✅ **Mantém registro original** para histórico
   - ✅ **Atualiza `ano_letivo`** para o novo ano
   - ✅ **Define `status_final`** como 'ativo'
   - ✅ **Registra `data_alocacao`** da transferência

3. **Atualiza a tabela `turma`:**
   - Muda o status da turma de destino de "Não iniciada" para "Em andamento"

## Exemplo Prático

**Cenário:** Turma 1A de 2025 está concluída, queremos transferir os alunos para a turma 2A de 2026.

1. Buscar turmas concluídas de 2025
2. Buscar turmas não iniciadas de 2026
3. Selecionar alunos da turma 1A
4. Transferir para turma 2A
5. A turma 2A automaticamente fica "Em andamento"
