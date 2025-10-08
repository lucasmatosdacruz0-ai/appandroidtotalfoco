import { GenerateWorkoutParams, GenerateWeeklyWorkoutParams, GetAutoSwapExerciseParams, GetSimilarExercisesParams, WorkoutPlan, Exercise, AiGeneratedWeeklyPlan, DayOfWeek } from '../types.ts';

// --- Banco de Dados de Exercícios Simulado ---
// Uma lista de exercícios pré-definidos para a "IA" escolher.
const mockExercises: Omit<Exercise, 'id' | 'completedSets' | 'equipmentUsed'>[] = [
    // Peito
    { name: 'Supino Reto com Barra', sets: '3', reps: '8-12', description: 'Deite-se no banco, pegue a barra com as mãos um pouco mais afastadas que a largura dos ombros e desça a barra até o peito, empurrando de volta para a posição inicial.' },
    { name: 'Supino Inclinado com Halteres', sets: '3', reps: '10-15', description: 'Em um banco inclinado, levante os halteres acima do peito, com as palmas das mãos voltadas para a frente, e retorne controladamente.' },
    { name: 'Flexão de Braço', sets: '4', reps: 'Até a falha', description: 'Com as mãos no chão na largura dos ombros, desça o corpo até o peito quase tocar o chão e empurre de volta, mantendo o corpo reto.' },
    { name: 'Cross Over', sets: '3', reps: '12-15', description: 'Com as polias altas, puxe os cabos para baixo e para frente, cruzando as mãos na frente do corpo, focando na contração do peitoral.' },
    { name: 'Voador', sets: '3', reps: '12-15', description: 'Sentado na máquina, junte os braços à frente do corpo, mantendo uma leve flexão nos cotovelos.' },
    // Costas
    { name: 'Barra Fixa', sets: '3', reps: 'Até a falha', description: 'Pendure-se na barra com as mãos afastadas e puxe o corpo para cima até o queixo passar da barra.' },
    { name: "Remada Curvada com Barra", sets: '4', reps: '8-12', description: 'Incline o tronco para a frente, mantendo as costas retas. Puxe a barra em direção ao abdômen, contraindo os músculos das costas.' },
    { name: 'Remada Serrote', sets: '3', reps: '10-12', description: 'Com um joelho e uma mão apoiados no banco, puxe o halter para cima, ao lado do corpo, mantendo o cotovelo próximo ao tronco.' },
    { name: 'Puxada Frontal', sets: '3', reps: '10-15', description: 'Sentado na máquina, puxe a barra para baixo, em direção ao peito, contraindo as costas.' },
    // Pernas
    { name: 'Agachamento Livre', sets: '4', reps: '8-12', description: 'Com a barra nos ombros, agache como se fosse sentar em uma cadeira, mantendo as costas retas e os joelhos alinhados com os pés.' },
    { name: 'Leg Press', sets: '3', reps: '10-15', description: 'Sentado na máquina, empurre a plataforma com os pés, estendendo as pernas quase completamente.' },
    { name: 'Cadeira Extensora', sets: '3', reps: '12-15', description: 'Sentado na máquina, estenda as pernas para levantar o peso, focando na contração do quadríceps.' },
    { name: 'Stiff com Barra', sets: '3', reps: '10-12', description: 'Segurando a barra, desça o tronco com as pernas quase retas, sentindo o posterior da coxa alongar.' },
    { name: 'Afundo com Halteres', sets: '3', reps: '10-12', description: 'Dê um passo à frente e flexione os dois joelhos, descendo o corpo até o joelho de trás quase tocar o chão.' },
    // Ombros
    { name: 'Desenvolvimento com Halteres', sets: '4', reps: '10-12', description: 'Sentado, levante os halteres acima da cabeça até os braços estarem estendidos.' },
    { name: 'Elevação Lateral com Halteres', sets: '3', reps: '12-15', description: 'De pé, levante os halteres para os lados até a altura dos ombros, com os cotovelos levemente flexionados.' },
    { name: 'Remada Alta', sets: '3', reps: '10-12', description: 'Puxe a barra ou halteres para cima, em direção ao queixo, liderando o movimento com os cotovelos.' },
    // Bíceps
    { name: 'Rosca Direta com Barra', sets: '3', reps: '10-12', description: 'De pé, segure a barra com as palmas para cima e levante-a em direção aos ombros, sem balançar o corpo.' },
    { name: 'Rosca Alternada com Halteres', sets: '3', reps: '10-12', description: 'De pé ou sentado, levante um halter de cada vez, girando o pulso durante o movimento.' },
    // Tríceps
    { name: 'Tríceps na Polia com Corda', sets: '3', reps: '12-15', description: 'De pé, puxe a corda para baixo até os braços estarem totalmente estendidos, afastando as mãos no final.' },
    { name: 'Mergulho no Banco', sets: '3', reps: 'Até a falha', description: 'Com as mãos apoiadas em um banco, desça o corpo flexionando os cotovelos e empurre de volta.' }
];

// Mapeia o exercício ao equipamento necessário. Um array dentro de um array significa uma condição 'OU'.
const exerciseEquipmentMap: { [key: string]: (string | string[])[] } = {
    // Peito
    'Supino Reto com Barra': ['Barra Livre', 'Banco Reto', 'Anilhas'],
    'Supino Inclinado com Halteres': ['Halteres', 'Banco Inclinado'],
    'Flexão de Braço': ['Peso Corporal'],
    'Cross Over': ['Cross Over (Polia)'],
    'Voador': ['Remada (Máquina)'], // Voador/Pec Deck machine
    // Costas
    'Barra Fixa': ['Peso Corporal'], // Assume pull-up bar is available in parks or home
    "Remada Curvada com Barra": ['Barra Livre', 'Anilhas'],
    'Remada Serrote': ['Halteres', ['Banco Reto', 'Cadeira', 'Sofá']],
    'Puxada Frontal': ['Puxador (Pulley)'],
    // Pernas
    'Agachamento Livre': [['Barra Livre', 'Smith Machine'], 'Anilhas'],
    'Leg Press': ['Leg Press'],
    'Cadeira Extensora': ['Cadeira Extensora'],
    'Stiff com Barra': ['Barra Livre', 'Anilhas'],
    'Afundo com Halteres': ['Halteres'],
    // Ombros
    'Desenvolvimento com Halteres': ['Halteres', ['Banco Reto', 'Banco Inclinado']],
    'Elevação Lateral com Halteres': [['Halteres', 'Garrafas de Água/Sacos de Arroz', 'Elásticos (Bands)']],
    'Remada Alta': [['Barra Livre', 'Halteres', 'Kettlebell']],
    // Bíceps
    'Rosca Direta com Barra': ['Barra Livre', 'Anilhas'],
    'Rosca Alternada com Halteres': [['Halteres', 'Garrafas de Água/Sacos de Arroz']],
    // Tríceps
    'Tríceps na Polia com Corda': [['Puxador (Pulley)', 'Cross Over (Polia)']],
    'Mergulho no Banco': [['Banco Reto', 'Cadeira', 'Sofá']],
};


// --- Funções Auxiliares ---

/**
 * Retorna uma quantidade 'n' de itens aleatórios de um array.
 */
const getRandomItems = <T>(arr: T[], n: number): T[] => {
    if (n >= arr.length) return [...arr];
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
};

/**
 * Filtra exercícios com base no foco do treino.
 */
const filterExercisesByFocus = (focus: string): Omit<Exercise, 'id' | 'completedSets' | 'equipmentUsed'>[] => {
    const focusLower = focus.toLowerCase();
    
    if (focusLower.includes('corpo inteiro')) return mockExercises;
    if (focusLower.includes('superiores')) return mockExercises.filter(ex => /supino|flexão|cross|voador|barra|remada|puxada|desenvolvimento|elevação|rosca|tríceps|mergulho/i.test(ex.name));
    if (focusLower.includes('pernas') || focusLower.includes('glúteos')) return mockExercises.filter(ex => /agachamento|leg|extensora|stiff|afundo/i.test(ex.name) || ex.name.includes('Mesa Flexora'));
    if (focusLower.includes('peito') && focusLower.includes('tríceps')) return mockExercises.filter(ex => /supino|flexão|cross|voador|tríceps|mergulho/i.test(ex.name));
    if (focusLower.includes('costas') && focusLower.includes('bíceps')) return mockExercises.filter(ex => /barra|remada|puxada|rosca/i.test(ex.name));
    if (focusLower.includes('pernas') && focusLower.includes('ombros')) return mockExercises.filter(ex => /agachamento|leg|extensora|stiff|afundo|desenvolvimento|elevação|remada alta/i.test(ex.name) || ex.name.includes('Mesa Flexora'));

    return mockExercises; // Fallback para todos os exercícios
};


/**
 * Filtra uma lista de exercícios com base nos equipamentos disponíveis.
 */
const filterExercisesByEquipment = (
    exercises: Omit<Exercise, 'id' | 'completedSets' | 'equipmentUsed'>[],
    availableEquipment: string[]
): Omit<Exercise, 'id' | 'completedSets' | 'equipmentUsed'>[] => {
    const userEquipmentSet = new Set(availableEquipment);
    
    // Se nenhum equipamento for selecionado, assume-se que apenas exercícios de peso corporal podem ser feitos.
    if (userEquipmentSet.size === 0) {
        userEquipmentSet.add('Peso Corporal');
    }

    return exercises.filter(exercise => {
        const requirements = exerciseEquipmentMap[exercise.name];

        // Se um exercício não tem requisitos mapeados, vamos considerá-lo de peso corporal.
        if (!requirements) {
            return userEquipmentSet.has('Peso Corporal');
        }

        // Itera sobre cada requisito para o exercício.
        return requirements.every(req => {
            if (Array.isArray(req)) {
                // Se o requisito for um array, é uma condição OU.
                return req.some(option => userEquipmentSet.has(option));
            } else {
                // Se for uma string, é uma condição E simples.
                return userEquipmentSet.has(req as string);
            }
        });
    });
};

/**
 * Atribui o equipamento utilizado a um exercício.
 */
const assignEquipmentToExercise = (exercise: Omit<Exercise, 'id' | 'equipmentUsed'>, availableEquipment: string[]): Omit<Exercise, 'id'> => {
    const requirements = exerciseEquipmentMap[exercise.name];
    const userEquipmentSet = new Set(availableEquipment);
    let equipmentUsed: string[] = [];

    if (requirements) {
        requirements.forEach(req => {
            if (Array.isArray(req)) {
                // For 'OR' conditions, find the first available equipment and add it
                const found = req.find(option => userEquipmentSet.has(option));
                if (found) equipmentUsed.push(found);
            } else {
                // For 'AND' conditions, add the equipment if available
                if (userEquipmentSet.has(req)) {
                    equipmentUsed.push(req);
                }
            }
        });
    } else if (userEquipmentSet.has('Peso Corporal')) {
        equipmentUsed.push('Peso Corporal');
    }

    // Remove duplicates and return
    return { ...exercise, equipmentUsed: [...new Set(equipmentUsed)] };
};


// --- Funções da "IA" Simulada ---

export const generateWorkoutPlan = async (params: GenerateWorkoutParams): Promise<Omit<WorkoutPlan, 'exercises'> & { exercises: Omit<Exercise, 'id'>[] }> => {
  const { duration, focus, equipment } = params;

  await new Promise(resolve => setTimeout(resolve, 1500));

  const focusFilteredExercises = filterExercisesByFocus(focus);
  let availableExercises = filterExercisesByEquipment(focusFilteredExercises, equipment);
  
  // Lógica de Fallback: se houver poucos exercícios com o equipamento, adicione exercícios de peso corporal
  if (availableExercises.length < 4 && equipment.includes('Peso Corporal')) {
      const bodyweightExercises = filterExercisesByEquipment(focusFilteredExercises, ['Peso Corporal']);
      const combined = [...availableExercises, ...bodyweightExercises];
      // Remove duplicatas
      availableExercises = Array.from(new Set(combined.map(e => e.name))).map(name => combined.find(e => e.name === name)!);
  }

  const numExercises = duration < 40 ? 4 : duration < 55 ? 5 : 6;
  let selectedExercises = getRandomItems(availableExercises, numExercises);

  // Fallback final: se ainda não houver exercícios suficientes, pegue aleatoriamente do mock geral de peso corporal
  if (selectedExercises.length === 0) {
      const fallback = getRandomItems(filterExercisesByEquipment(mockExercises, ['Peso Corporal']), numExercises);
      selectedExercises = fallback;
  }
  
  const exercisesWithEquipment = selectedExercises.map(ex => assignEquipmentToExercise(ex, equipment));

  const workoutData: Omit<WorkoutPlan, 'exercises'> & { exercises: Omit<Exercise, 'id'>[] } = {
    title: `Treino FocoTotal - ${focus}`,
    duration: duration,
    focus: focus,
    exercises: exercisesWithEquipment,
  };

  return workoutData;
};

export const generateWeeklyWorkoutPlan = async (params: GenerateWeeklyWorkoutParams): Promise<AiGeneratedWeeklyPlan> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    // A geração de plano semanal não leva em conta equipamentos, pois gera planos genéricos para salvar.
    // O usuário os executaria com base no equipamento que tem no dia.
    const planA = { name: 'Treino A: Peito e Tríceps', exercises: getRandomItems(filterExercisesByFocus('Peito e Tríceps'), 5) };
    const planB = { name: 'Treino B: Costas e Bíceps', exercises: getRandomItems(filterExercisesByFocus('Costas e Bíceps'), 5) };
    const planC = { name: 'Treino C: Pernas e Ombros', exercises: getRandomItems(filterExercisesByFocus('Pernas e Ombros'), 5) };
    const restPlan = { name: 'Descanso', exercises: [] };

    const weeklyPlan: AiGeneratedWeeklyPlan = {
        plans: [planA, planB, planC, restPlan],
        schedule: {
            monday: planA.name,
            tuesday: planB.name,
            wednesday: planC.name,
            thursday: restPlan.name,
            friday: planA.name,
            saturday: planB.name,
            sunday: restPlan.name,
        }
    };
    
    return weeklyPlan;
};

const getSwapAlternatives = (params: GetAutoSwapExerciseParams | GetSimilarExercisesParams): Omit<Exercise, 'id' | 'equipmentUsed'>[] => {
    const { currentPlan, exerciseToReplace, equipment, focus } = params;

    const currentExerciseNames = currentPlan.exercises.map(e => e.name);
    
    // Filtra primeiro pelo foco, depois pelo equipamento
    const focusFiltered = filterExercisesByFocus(focus);
    const equipmentFiltered = filterExercisesByEquipment(focusFiltered, equipment);

    // Encontra alternativas que não estão no plano atual e não são o exercício a ser substituído
    let alternatives = equipmentFiltered.filter(ex => 
        ex.name !== exerciseToReplace.name && !currentExerciseNames.includes(ex.name)
    );

    // Se não houver alternativas, use um fallback mais amplo (qualquer exercício possível com o equipamento)
    if (alternatives.length === 0) {
        const fallbackEquipmentFiltered = filterExercisesByEquipment(mockExercises, equipment);
        alternatives = fallbackEquipmentFiltered.filter(ex => 
            ex.name !== exerciseToReplace.name && !currentExerciseNames.includes(ex.name)
        );
    }
    
    return alternatives;
};

export const getAutoSwapExercise = async (params: GetAutoSwapExerciseParams): Promise<Omit<Exercise, 'id'>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const alternatives = getSwapAlternatives(params);

    if (alternatives.length > 0) {
        const chosen = getRandomItems(alternatives, 1)[0];
        return assignEquipmentToExercise(chosen, params.equipment);
    }
    
    // Fallback final: retorna o exercício a ser substituído se nenhuma alternativa for encontrada
    const { exerciseToReplace } = params;
    const fallbackExercise = { name: exerciseToReplace.name, sets: exerciseToReplace.sets, reps: exerciseToReplace.reps, description: exerciseToReplace.description };
    return assignEquipmentToExercise(fallbackExercise, params.equipment);
};

export const getSimilarExerciseChoices = async (params: GetSimilarExercisesParams): Promise<Omit<Exercise, 'id'>[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const alternatives = getSwapAlternatives(params);

    if (alternatives.length > 0) {
        const choices = getRandomItems(alternatives, 2);
        return choices.map(choice => assignEquipmentToExercise(choice, params.equipment));
    }

    return []; // Retorna vazio se não houver alternativas
};