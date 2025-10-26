# Exemplo de Histórico de Transferência de Alunos

## Cenário
Transferir 3 alunos da turma "1A" (2025, concluída) para a turma "2A" (2026, não iniciada).

## Estado ANTES da Transferência

### Tabela `matricula`:
```sql
| id | aluno_id | turma_id | ano_letivo | status |
|----|----------|----------|------------|--------|
| 1  | 101      | 1        | 2025       | ativa  |
| 2  | 102      | 1        | 2025       | ativa  |
| 3  | 103      | 1        | 2025       | ativa  |
```

### Tabela `aluno_turma`:
```sql
| id | matricula_id | turma_id | ano_letivo | campo_unico | data_alocacao | status_final |
|----|--------------|----------|------------|-------------|---------------|--------------|
| 1  | 1            | 1        | 2025       | 1_2025      | 2025-01-15    | concluído    |
| 2  | 2            | 1        | 2025       | 2_2025      | 2025-01-15    | concluído    |
| 3  | 3            | 1        | 2025       | 3_2025      | 2025-01-15    | concluído    |
```

### Tabela `turma`:
```sql
| id | nome | ano_letivo | status     |
|----|------|------------|------------|
| 1  | 1A   | 2025       | Concluída  |
| 2  | 2A   | 2026       | Não iniciada |
```

## Estado DEPOIS da Transferência

### Tabela `matricula` (INALTERADA - histórico preservado):
```sql
| id | aluno_id | turma_id | ano_letivo | status |
|----|----------|----------|------------|--------|
| 1  | 101      | 1        | 2025       | ativa  |  ← MANTIDO
| 2  | 102      | 1        | 2025       | ativa  |  ← MANTIDO
| 3  | 103      | 1        | 2025       | ativa  |  ← MANTIDO
```

### Tabela `aluno_turma` (NOVOS registros adicionados):
```sql
| id | matricula_id | turma_id | ano_letivo | campo_unico | data_alocacao | status_final |
|----|--------------|----------|------------|-------------|---------------|--------------|
| 1  | 1            | 1        | 2025       | 1_2025      | 2025-01-15    | concluído    |  ← HISTÓRICO
| 2  | 2            | 1        | 2025       | 2_2025      | 2025-01-15    | concluído    |  ← HISTÓRICO
| 3  | 3            | 1        | 2025       | 3_2025      | 2025-01-15    | concluído    |  ← HISTÓRICO
| 4  | 1            | 2        | 2026       | 1_2026      | 2026-01-10    | ativo        |  ← NOVO
| 5  | 2            | 2        | 2026       | 2_2026      | 2026-01-10    | ativo        |  ← NOVO
| 6  | 3            | 2        | 2026       | 3_2026      | 2026-01-10    | ativo        |  ← NOVO
```

### Tabela `turma` (status atualizado):
```sql
| id | nome | ano_letivo | status      |
|----|------|------------|-------------|
| 1  | 1A   | 2025       | Concluída   |  ← MANTIDO
| 2  | 2A   | 2026       | Em andamento |  ← ATUALIZADO
```

## Vantagens desta Abordagem

### ✅ **Histórico Completo Preservado:**
- Matrícula original mantida
- Registros de turma anteriores preservados
- Rastreabilidade completa do aluno

### ✅ **Consultas Possíveis:**
```sql
-- Ver histórico completo de um aluno
SELECT
  at.ano_letivo,
  t.nome as turma_nome,
  at.status_final,
  at.data_alocacao
FROM aluno_turma at
JOIN turma t ON at.turma_id = t.id
WHERE at.matricula_id = 1
ORDER BY at.ano_letivo;

-- Resultado:
-- 2025 | 1A | concluído | 2025-01-15
-- 2026 | 2A | ativo     | 2026-01-10
```

### ✅ **Relatórios de Progressão:**
- Quantos alunos foram promovidos por ano
- Taxa de aprovação por turma
- Histórico de transferências
- Análise de evasão

### ✅ **Integridade de Dados:**
- Não perde informações históricas
- Permite auditoria completa
- Facilita correções futuras
- Mantém consistência temporal

## Comparação: Antes vs Depois

| Aspecto | ❌ Abordagem Anterior | ✅ Nova Abordagem |
|---------|----------------------|-------------------|
| **Histórico** | Perdido | Preservado |
| **Rastreabilidade** | Limitada | Completa |
| **Auditoria** | Difícil | Fácil |
| **Relatórios** | Limitados | Completos |
| **Correções** | Complexas | Simples |
| **Integridade** | Comprometida | Mantida |
