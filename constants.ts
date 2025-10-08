import { DumbbellIcon, FlameIcon, ZapIcon, MedalIcon, CalendarIcon, TrophyIcon, BrainCircuitIcon, RepeatIcon, MountainIcon, SparklesIcon, DiamondIcon, LockIcon } from './components/icons.tsx';
import { Achievement } from './types.ts';

// --- Gamification Constants ---
export const XP_PER_WORKOUT = 50;
export const XP_PER_PR = 25;
export const BASE_XP_TO_LEVEL_UP = 200;


// --- Equipment Lists ---
export const GYM_EQUIPMENT = [
  'Barra Livre', 'Halteres', 'Anilhas', 'Banco Reto', 'Banco Inclinado', 'Banco Declinado',
  'Leg Press', 'Cadeira Extensora', 'Mesa Flexora', 'Puxador (Pulley)', 'Remada (Máquina)',
  'Cross Over (Polia)', 'Smith Machine', 'Kettlebell', 'Corda Naval', 'Esteira', 'Bicicleta Ergométrica'
];

export const HOME_EQUIPMENT = [
  'Peso Corporal', 'Elásticos (Bands)', 'Cadeira', 'Sofá', 'Garrafas de Água/Sacos de Arroz',
  'Toalha', 'Cabo de Vassoura', 'Corda de Pular'
];

// --- Timers ---
export const REST_TIMER_DURATION_SECONDS = 90;

// --- UI Content ---
export const WORKOUT_TIPS = [
  'Lembre-se de aquecer por 5-10 minutos antes de cada treino.',
  'A hidratação é fundamental. Beba água antes, durante e depois do exercício.',
  'Concentre-se na execução correta dos movimentos, não apenas na quantidade de peso.',
  'A respiração correta potencializa seu desempenho. Expire no esforço, inspire no retorno.',
  'Não pule o descanso entre as séries. Ele é crucial para a recuperação muscular.',
  'Uma boa noite de sono é tão importante quanto o treino para a construção de músculos.',
  'Varie seus treinos para evitar platôs e manter a motivação em alta.',
  'Escute seu corpo. Dor aguda é sinal para parar e reavaliar o exercício.',
  'A alimentação pós-treino ajuda na recuperação. Consuma proteínas e carboidratos.',
  'A consistência é o segredo do sucesso. Continue firme no seu plano!',
  'Alongar após o treino pode ajudar a melhorar a flexibilidade e reduzir a tensão muscular.',
  'Progrida gradualmente. Aumente o peso ou as repetições aos poucos para evitar lesões.',
];

// --- Achievements List ---
export const ACHIEVEMENTS_LIST: Omit<Achievement, 'unlocked'>[] = [
  // --- Basic Milestones ---
  {
    id: 'FIRST_WORKOUT',
    title: 'Que Comecem os Jogos!',
    description: 'Completou seu primeiro treino.',
    icon: FlameIcon,
    isSecret: false,
    condition: (history) => history.length >= 1,
  },
  {
    id: 'TEN_WORKOUTS',
    title: 'Rato de Academia',
    description: 'Completou 10 treinos.',
    icon: DumbbellIcon,
    isSecret: false,
    condition: (history) => history.length >= 10,
  },
  {
    id: 'TWENTY_FIVE_WORKOUTS',
    title: 'Habituado',
    description: 'Completou 25 treinos.',
    icon: RepeatIcon,
    isSecret: false,
    condition: (history) => history.length >= 25,
  },
  {
    id: 'FIFTY_WORKOUTS',
    title: 'Veterano',
    description: 'Completou 50 treinos.',
    icon: MedalIcon,
    isSecret: false,
    condition: (history) => history.length >= 50,
  },
   {
    id: 'ONE_HUNDRED_WORKOUTS',
    title: 'Centurião',
    description: 'Completou 100 treinos.',
    icon: DiamondIcon,
    isSecret: false,
    condition: (history) => history.length >= 100,
  },
  // --- Volume Milestones ---
  {
    id: 'LIFT_10000KG',
    title: 'Hulk!',
    description: 'Levantou um total de 10 toneladas de volume.',
    icon: TrophyIcon,
    isSecret: false,
    condition: (_history, stats) => stats.totalVolume >= 10000,
  },
    {
    id: 'LIFT_50000KG',
    title: 'Titan',
    description: 'Levantou um total de 50 toneladas de volume.',
    icon: MountainIcon,
    isSecret: false,
    condition: (_history, stats) => stats.totalVolume >= 50000,
  },
  // --- Consistency ---
  {
    id: 'WEEK_STREAK',
    title: 'Consistência é a Chave',
    description: 'Treinou por 7 dias seguidos.',
    icon: CalendarIcon,
    isSecret: false,
    condition: (_history, stats) => stats.currentStreak >= 7,
  },
  // --- Specialization ---
   {
    id: 'CHEST_SPECIALIST',
    title: 'Peito de Aço',
    description: "Concluiu 10 treinos com foco em Peito.",
    icon: ZapIcon,
    isSecret: false,
    condition: (history) => history.filter(w => w.focus.toLowerCase().includes('peito') || w.focus.toLowerCase().includes('chest')).length >= 10,
  },
   {
    id: 'LEGS_SPECIALIST',
    title: 'Não Pula Pernas',
    description: "Concluiu 10 treinos com foco em Pernas.",
    icon: ZapIcon,
    isSecret: false,
    condition: (history) => history.filter(w => w.focus.toLowerCase().includes('pernas') || w.focus.toLowerCase().includes('legs')).length >= 10,
  },
  {
    id: 'BACK_SPECIALIST',
    title: 'Costas de Aço',
    description: "Concluiu 10 treinos com foco em Costas.",
    icon: ZapIcon,
    isSecret: false,
    condition: (history) => history.filter(w => w.focus.toLowerCase().includes('costas') || w.focus.toLowerCase().includes('back')).length >= 10,
  },
  {
    id: 'FULL_BODY_WORKOUT',
    title: 'Corpo Blindado',
    description: "Concluiu um treino 'Corpo Inteiro'.",
    icon: BrainCircuitIcon,
    isSecret: false,
    condition: (history) => history.some(w => w.focus.toLowerCase().includes('corpo inteiro')),
  },
  // --- Secret Feats of Strength ---
  {
    id: 'SECRET_BENCH_100KG',
    title: 'Clube dos 100kg',
    description: 'Segredo: ???',
    icon: SparklesIcon,
    isSecret: true,
    condition: (_h, _s, prs) => (prs['Supino Reto com Barra'] || prs['Supino Reto'] || 0) >= 100,
  },
  {
    id: 'SECRET_SQUAT_140KG',
    title: 'Agachamento Monstro',
    description: 'Segredo: ???',
    icon: SparklesIcon,
    isSecret: true,
    condition: (_h, _s, prs) => (prs['Agachamento Livre'] || prs['Agachamento'] || 0) >= 140,
  },
  {
    id: 'SECRET_DEADLIFT_180KG',
    title: 'Força da Terra',
    description: 'Segredo: ???',
    icon: SparklesIcon,
    isSecret: true,
    condition: (_h, _s, prs) => (prs['Levantamento Terra'] || 0) >= 180,
  }
];