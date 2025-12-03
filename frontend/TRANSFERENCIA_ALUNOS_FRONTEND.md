# Funcionalidade de Transferência de Alunos - Frontend

## Descrição
Esta funcionalidade permite transferir alunos de uma turma concluída para uma turma do ano seguinte que esteja com status "Não iniciada", diretamente pela interface do usuário.

## Como Usar

### 1. Acessar a Funcionalidade
- Navegue para a página "Montar Turma"
- A funcionalidade de transferência aparece automaticamente quando as condições são atendidas

### 2. Condições para Transferência
Para que o botão de transferência apareça, é necessário:
- ✅ Ter alunos selecionados na tabela
- ✅ A turma atual deve estar com status "Concluída"
- ✅ Deve haver turmas "Não iniciadas" disponíveis para o ano seguinte

### 3. Processo de Transferência

#### Passo 1: Selecionar Turma e Alunos
1. **Filtrar por ano letivo**: Use o seletor de anos para escolher o ano da turma concluída
2. **Selecionar turma**: Escolha a turma com status "Concluída"
3. **Buscar alunos**: Clique em "Buscar" para carregar os alunos da turma
4. **Selecionar alunos**: Marque os alunos que deseja transferir usando os checkboxes

#### Passo 2: Iniciar Transferência
1. **Botão aparece automaticamente**: Quando as condições são atendidas, aparece o botão verde "📚 Transferir Alunos para o Próximo Ano"
2. **Clique no botão**: Isso abrirá o modal de transferência

#### Passo 3: Configurar Transferência
1. **Verificar informações**: O modal mostra:
   - Turma de origem (concluída)
   - Lista dos alunos selecionados
   - Opções de turmas de destino

2. **Selecionar turma de destino**:
   - Escolha uma turma "Não iniciada" do ano seguinte
   - O sistema mostra detalhes da turma selecionada

3. **Confirmar transferência**: Clique em "Transferir X Alunos"

### 4. O que Acontece na Transferência

#### Validações Automáticas:
- ✅ Turma de origem deve estar "Concluída"
- ✅ Turma de destino deve estar "Não iniciada"
- ✅ Turma de destino deve ser do ano seguinte
- ✅ Deve haver pelo menos um aluno selecionado

#### Atualizações no Sistema:
1. **Matrículas**: Atualizadas com nova turma e ano letivo
2. **Aluno-Turma**: Registros atualizados com nova turma
3. **Status da turma**: Turma de destino muda para "Em andamento"
4. **Interface**: Dados recarregados automaticamente

### 5. Feedback Visual

#### Estados do Botão:
- **Não visível**: Quando condições não são atendidas
- **Visível**: Quando pode transferir (turma concluída + alunos selecionados)
- **Carregando**: Durante o processo de transferência

#### Mensagens:
- ✅ **Sucesso**: "Transferência realizada com sucesso! X alunos transferidos."
- ⚠️ **Aviso**: "Apenas turmas com status 'Concluída' podem ter alunos transferidos"
- ❌ **Erro**: Mensagens específicas de erro (turma não encontrada, etc.)

### 6. Exemplo Prático

**Cenário**: Transferir alunos da turma 1A de 2025 (concluída) para 2A de 2026 (não iniciada)

1. **Filtrar**: Ano 2025
2. **Selecionar**: Turma "1A"
3. **Buscar**: Carregar alunos
4. **Selecionar**: Alunos desejados (ex: 5 alunos)
5. **Transferir**: Clicar no botão verde
6. **Escolher destino**: Turma "2A" de 2026
7. **Confirmar**: Transferir 5 alunos
8. **Resultado**:
   - 5 alunos transferidos
   - Turma 2A agora está "Em andamento"
   - Dados atualizados na interface

### 7. Permissões
- Apenas usuários com permissão de "ADM" ou "COORDENADOR" podem executar transferências
- Sistema verifica permissões automaticamente

### 8. Tratamento de Erros
- **Sem turmas de destino**: Aviso para criar turma "Não iniciada" para o ano seguinte
- **Erro de validação**: Mensagens específicas sobre o que está incorreto
- **Erro de rede**: Mensagem de erro genérica com detalhes no console

## Arquivos Modificados

### Novos Arquivos:
- `frontend/src/componentes/montarturma/ModalTransferencia.jsx` - Modal de transferência

### Arquivos Modificados:
- `frontend/src/services/Turma.js` - Novos métodos de API
- `frontend/src/componentes/montarturma/index.jsx` - Integração da funcionalidade

## Integração com Backend
A funcionalidade utiliza os seguintes endpoints:
- `GET /api/turma/by-status-year` - Buscar turmas por status e ano
- `POST /api/turma/transfer-students` - Executar transferência
