export function getProfessoresSubstitutosPriorizados(alocacao, todosOsProfessores) {
  console.log("==================================================");
  console.log("======= INICIANDO ANÁLISE DE PRIORIZAÇÃO =======");
  console.log("==================================================");

  // --- 1. DADOS DE ENTRADA ---
  console.log("Dados da Aula (alocacao):", alocacao);
  console.log("Lista de Todos os Professores (todosOsProfessores):", todosOsProfessores);

  const professorAtualId = alocacao.professorAtual.id;
  const areaDaAula = alocacao.disciplina.areaConhecimento;
  const nivelDaTurma = alocacao.turma.nivel;

  console.log(`\n--- 2. PARÂMETROS EXTRAÍDOS ---`);
  console.log(`ID do Professor Atual: ${professorAtualId}`);
  console.log(`Área da Aula: "${areaDaAula}"`);
  console.log(`Nível da Turma: "${nivelDaTurma}"`);

  const professoresDisponiveis = todosOsProfessores.filter(p => p.id !== professorAtualId);
  console.log("\n--- 3. PROFESSORES DISPONÍVEIS (após remover o atual) ---", professoresDisponiveis);

  let listaPriorizada = [];

  if (nivelDaTurma === 'Anos Finais') {
    console.log("\n--- 4. APLICANDO REGRAS PARA 'ANOS FINAIS' ---");

    // --- REGRA II.a ---
    console.log("\n--- Verificando Regra II.a (Docentes da mesma área) ---");
    const regraII_a = professoresDisponiveis.filter(p => {
      const condTipo = p.tipo === 'docente';
      const condArea = p.areaConhecimento === areaDaAula;
      console.log(`- ${p.nome}: tipo é 'docente'? ${condTipo}. área é '${areaDaAula}'? ${condArea}.`);
      return condTipo && condArea;
    }).sort((a, b) => a.cargaHoraria - b.cargaHoraria);
    console.log("Resultado Regra II.a:", regraII_a);

    // --- REGRA II.b ---
    console.log("\n--- Verificando Regra II.b (Docentes de outras áreas) ---");
    const regraII_b = professoresDisponiveis.filter(p => {
        const condTipo = p.tipo === 'docente';
        const condArea = p.areaConhecimento !== areaDaAula;
        console.log(`- ${p.nome}: tipo é 'docente'? ${condTipo}. área é diferente de '${areaDaAula}'? ${condArea}.`);
        return condTipo && condArea;
    }).sort((a, b) => a.cargaHoraria - b.cargaHoraria);
    console.log("Resultado Regra II.b:", regraII_b);
    
    // --- REGRA II.c ---
    console.log("\n--- Verificando Regra II.c (Coordenadores da mesma área) ---");
    const regraII_c = professoresDisponiveis.filter(p => {
        const condTipo = p.tipo === 'coordenador';
        const condArea = p.areaConhecimento === areaDaAula;
        console.log(`- ${p.nome}: tipo é 'coordenador'? ${condTipo}. área é '${areaDaAula}'? ${condArea}.`);
        return condTipo && condArea;
    });
    console.log("Resultado Regra II.c:", regraII_c);

    // --- REGRA II.d ---
    console.log("\n--- Verificando Regra II.d (Coordenadores de outras áreas) ---");
    const regraII_d = professoresDisponiveis.filter(p => {
        const condTipo = p.tipo === 'coordenador';
        const condArea = p.areaConhecimento !== areaDaAula; // <-- MUDANÇA AQUI
        console.log(`- ${p.nome}: tipo é 'coordenador'? ${condTipo}. área é diferente de '${areaDaAula}'? ${condArea}.`);
        return condTipo && condArea;
    }).sort((a, b) => a.cargaHoraria - b.cargaHoraria);
    console.log("Resultado Regra II.d:", regraII_d);
    
    listaPriorizada = [
        { label: "Prioridade 1: Docentes da mesma área", opcoes: regraII_a },
        { label: "Prioridade 2: Docentes de outras áreas", opcoes: regraII_b },
        { label: "Prioridade 3: Coordenadores da mesma área", opcoes: regraII_c }, // <-- MUDANÇA AQUI
        { label: "Prioridade 4: Coordenadores de outras áreas", opcoes: regraII_d } // <-- MUDANÇA AQUI
    ];

  } else if (nivelDaTurma === 'Anos Iniciais') {
    console.log("\n--- 4. APLICANDO REGRAS PARA 'ANOS INICIAIS' ---");
    // Adicione logs aqui se precisar depurar este bloco também
    const regraIII_a = professoresDisponiveis.filter(p => p.tipo === 'colaborativo');
    const regraIII_b = professoresDisponiveis.filter(p => p.tipo === 'coordenador' && p.areaConhecimento === 'Linguagens');
    listaPriorizada = [
        { label: "Prioridade 1: Professor Colaborativo", opcoes: regraIII_a },
        { label: "Prioridade 2: Coordenação de Linguagens", opcoes: regraIII_b },
    ];
  }

  // --- Outras Opções ---
  console.log("\n--- 5. CALCULANDO 'OUTRAS OPÇÕES' ---");
  const todosPriorizadosIds = listaPriorizada.flatMap(grupo => grupo.opcoes.map(p => p.id));
  const outros = professoresDisponiveis.filter(p => !todosPriorizadosIds.includes(p.id));
  console.log("Professores que não se encaixaram em nenhuma regra:", outros);

  if (outros.length > 0) {
    listaPriorizada.push({ label: "Outras Opções", opcoes: outros });
  }

  console.log("\n--- 6. LISTA FINAL ANTES DE FILTRAR GRUPOS VAZIOS ---");
  console.log(listaPriorizada);
  console.log("==================================================");
  console.log("========= FIM DA ANÁLISE DE PRIORIZAÇÃO =========");
  console.log("==================================================");

  return listaPriorizada.filter(grupo => grupo.opcoes.length > 0);
}


export function getLinhasDaMatriz(disciplinas, turmas) {
    // 1. Encontra o ID de uma turma de "Anos Finais" (para associar as áreas)
    const turmaAnosFinais = turmas.find(t => t.nivel === 'Anos Finais');
    const idReferenciaAF = turmaAnosFinais ? turmaAnosFinais.id : null;

    // 2. Extrai as Áreas de Conhecimento
    const areas = new Set(
        disciplinas
            .filter(d => d.areaConhecimento) // Garante que tem área
            .map(d => d.areaConhecimento)
    );

    // 3. Monta a lista de linhas (objetos)
    const linhas = Array.from(areas).map(area => ({
        id: area, // O nome da área será o ID
        nome: area,
        nivel: 'Anos Finais',
        turmaReferenciaId: idReferenciaAF 
    }));

    // 4. Adiciona a linha especial para "Anos Iniciais"
    const turmaAnosIniciais = turmas.find(t => t.nivel === 'Anos Iniciais');
    if (turmaAnosIniciais) {
        linhas.push({
            id: 'anos-iniciais',
            nome: 'Anos Iniciais',
            nivel: 'Anos Iniciais',
            turmaReferenciaId: turmaAnosIniciais.id
        });
    }

    return linhas;
}

export function calcularPrioridadeCelula(professor, linhaMatriz) {
    const { nivel, nome: areaDaLinha } = linhaMatriz;
    const { tipo, areaConhecimento, cargaHoraria } = professor;
    const label = `${professor.nome} (${cargaHoraria}h)`; // Tooltip

    if (nivel === 'Anos Finais') {
        // Regra II.a (Docente, mesma área) - Marcado como TITULAR
        if (tipo === 'docente' && areaConhecimento === areaDaLinha) {
            return { id: 'TITULAR', label: `Titular (${cargaHoraria}h)`, tooltip: label };
        }
        // Regra II.b (Docente, outra área)
        if (tipo === 'docente' && areaConhecimento !== areaDaLinha) {
            return { id: 'P2', label: `P2 (${cargaHoraria}h)`, tooltip: label };
        }
        // Regra II.c (Coordenador, mesma área)
        if (tipo === 'coordenador' && areaConhecimento === areaDaLinha) {
            return { id: 'P3', label: `P3 (${cargaHoraria}h)`, tooltip: label };
        }
        // Regra II.d (Coordenador, outra área)
        if (tipo === 'coordenador' && areaConhecimento !== areaDaLinha) {
            return { id: 'P4', label: `P4 (${cargaHoraria}h)`, tooltip: label };
        }
    }

    if (nivel === 'Anos Iniciais') {
        // Regra III.a (Colaborativo)
        if (tipo === 'colaborativo') {
            return { id: 'P1-AI', label: `P1 (${cargaHoraria}h)`, tooltip: label };
        }
        // Regra III.b (Coord. Linguagens)
        if (tipo === 'coordenador' && areaConhecimento === 'Linguagens') {
            return { id: 'P2-AI', label: `P2 (${cargaHoraria}h)`, tooltip: label };
        }
    }

    // Se não se encaixa em nada, não é uma opção
    return { id: 'N/A', label: 'N/A', tooltip: label };
}


/**
 * Gera a estrutura de dados completa para a Matriz de Resiliência.
 */
export function gerarDadosMatriz(professoresProcessados, disciplinas, turmas) {
    
    // 1. Obter linhas (Áreas e Níveis)
    const linhasMatriz = getLinhasDaMatriz(disciplinas, turmas);
    
    // 2. Obter colunas (Professores)
    // MODIFICAÇÃO: Removemos o .sort() daqui. A lista agora vem pré-filtrada e pré-ordenada.
    const colunasProfessores = professoresProcessados;

    // 3. Construir os dados da matriz
    const dados = linhasMatriz.map(linha => {
        
        // Para cada linha (ex: "Matemática"), calculamos as células
        const celulas = colunasProfessores.map(professor => {
            const prioridade = calcularPrioridadeCelula(professor, linha);
            
            return {
                professorId: professor.id,
                prioridade: prioridade
            };
        });

        return {
            ...linha, // id, nome, nivel
            celulas: celulas // array de { professorId, prioridade }
        };
    });

    return {
        linhas: dados, // Contém os dados das células
        colunas: colunasProfessores // A lista de professores para o <Thead>
    };
}