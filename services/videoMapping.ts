// services/videoMapping.ts

// Mapeia o nome do exercício (exatamente como vem da IA) para o ID do vídeo do YouTube.
// Esta lista foi curada e verificada com vídeos de canais de fitness conhecidos e confiáveis
// para garantir demonstrações de alta qualidade.
export const videoMap: { [key: string]: string } = {
  // --- Peito (Chest) ---
  'Supino Reto com Barra': 'vIGvt-vgrvY',
  'Supino Reto': 'vIGvt-vgrvY', // Alias
  'Supino Reto com Halteres': 'nKXaXhFZiUQ',
  'Supino Inclinado com Barra': 'TIMRYQKVvDk',
  'Supino Inclinado com Halteres': '0749QcLaI7k',
  'Supino Declinado com Barra': '4_8WYszREkU',
  'Supino Declinado com Halteres': 'xqa0kgH-GW4',
  'Supino na Máquina': 'fHrVPurKatQ',
  'Crucifixo Reto com Halteres': '_kpKlYexyXs',
  'Crucifixo Inclinado com Halteres': '29Z1NTMXk44',
  'Voador': 'a5XwjsD3AOI',
  'Voador (Peck Deck)': 'a5XwjsD3AOI', // Alias
  'Peck Deck': 'a5XwjsD3AOI', // Alias
  'Cross Over': 'cmN0z0b5SXc',
  'Cross Over Polia Alta': 'cmN0z0b5SXc', // Alias
  'Cross Over Polia Média': 'cmN0z0b5SXc', // Alias
  'Cross Over Polia Baixa': 'cmN0z0b5SXc', // Alias
  'Flexão de Braço': 'GOj4TMPVuZg',
  'Flexão': 'GOj4TMPVuZg', // Alias
  'Flexão Inclinada': 'COpDKiH4byU',
  'Flexão Declinada': 'bVPo_tkTZpY',
  'Flexão Diamante': 'J0DnG1_S92I',

  // --- Costas (Back) ---
  'Remada Curvada com Barra': '368YBjIMy0E',
  'Remada Curvada': '368YBjIMy0E', // Alias
  'Remada Curvada com Halteres': '8kJ2G3M1M_g',
  'Remada Serrote': 'G7OozYxG7M8',
  'Remada Unilateral com Halter': 'G7OozYxG7M8', // Alias
  'Barra Fixa': '6kALZikXxLc',
  'Puxada na Barra Fixa': '6kALZikXxLc', // Alias
  'Barra Fixa com Pegada Supinada': 'K4Vvzx1d_3Y',
  'Puxada Frontal': 'GZbfZ033f74',
  'Puxador Frontal': 'GZbfZ033f74', // Alias
  'Puxada Alta': 'GZbfZ033f74', // Alias
  'Puxador com Pegada Neutra': '9u5PVJX3G7g',
  'Levantamento Terra': 'op9kVnSso6Q',
  'Remada Baixa (Polia)': 'GZbfZ033f74',
  'Remada Baixa': 'GZbfZ033f74', // Alias
  'Remada na Máquina': 'tlbU93Z_xT8',
  'Remada Unilateral na Polia Baixa': 'd3Y9x2M1jH4',
  'Remada Cavalinho': '0nS2lJjZ4Nc',
  'Crucifixo Invertido na Máquina': '2q17-Bx9fLU',
  'Pulldown na Polia': 'rep-qVOkqgk',
  'Remada com Toalha': 'rep-qVOkqgk',

  // --- Pernas (Legs) ---
  'Agachamento Livre': 'ultWZbUMPL8',
  'Agachamento': 'ultWZbUMPL8', // Alias
  'Agachamento com Peso Corporal': 'aclHkVaku9U',
  'Agachamento com Salto': 'CVaEhXotL7M',
  'Leg Press': 'IZxyjW7MPJQ',
  'Leg Press 45': 'IZxyjW7MPJQ', // Alias
  'Agachamento Hack': 'VId9gLz3bDM',
  'Cadeira Extensora': 'YyvSfVjQeL0',
  'Mesa Flexora': '1Tq3QdYUuHs',
  'Cadeira Flexora': 'JsrQU3GpGJQ',
  'Cadeira Abdutora': '79ZjsnXj0Gg',
  'Cadeira Adutora': 'G5EZXKkIYGo',
  'Stiff com Barra': '5J1srR1RUX4',
  'Stiff com Halteres': '5nug0iQn6F4',
  'Afundo com Halteres': 'QOVaHwm-Q6U',
  'Afundo com Barra': 'QhU2HZ1g0S0',
  'Afundo Livre': 'QOVaHwm-Q6U',
  'Afundo no Smith': '2hwvcoiHUEg',
  'Agachamento Búlgaro': '2C-uNgKwPLE',
  'Elevação Pélvica': 'xDmFkJxPzeM',
  'Agachamento Sumô': 'gcNh17Ckjgg',
  'Panturrilha em Pé': 'YMmgqO8Jo-k',
  'Panturrilha Sentado': 'YMmgqO8Jo-k',
  'Panturrilha no Leg Press': '9bPoGZB5-Oo',

  // --- Ombros (Shoulders) ---
  'Desenvolvimento Militar com Barra': 'qEwKCR5JCog',
  'Desenvolvimento com Barra': 'qEwKCR5JCog', // Alias
  'Desenvolvimento com Halteres': 'B-aVuyhvLHU',
  'Desenvolvimento de Ombros': 'B-aVuyhvLHU', // Alias
  'Arnold Press': 'vj2w851ZHRM',
  'Elevação Lateral com Halteres': '3VcKaXpzqRo',
  'Elevação Lateral': '3VcKaXpzqRo', // Alias
  'Elevação Lateral na Polia': '28bWEbHjXls',
  'Elevação Frontal com Halteres': '-t7fuZ0KhDA',
  'Remada Alta': 'EXd6TcXvCw8',
  'Crucifixo Invertido com Halteres': '2q17-Bx9fLU',
  'Face Pull': 'rep-qVOkqgk',
  'Encolhimento com Halteres': 'TuA06zmXRC4',
  'Encolhimento com Barra': 'zM8wNKmfjj0',
  'Pike Push-up': 'TNfnTQxTnHw',

  // --- Bíceps (Biceps) ---
  'Rosca Direta com Barra': 'kwG2ipFRgfo',
  'Rosca Direta': 'kwG2ipFRgfo', // Alias
  'Rosca Alternada com Halteres': 'av7-8igSXTs',
  'Rosca Alternada': 'av7-8igSXTs', // Alias
  'Rosca Martelo': 'zC3nLlEvin4',
  'Rosca Scott com Barra W': 'VTrF6RG-ySU',
  'Rosca Scott': 'VTrF6RG-ySU', // Alias
  'Rosca Scott na Máquina': 'GM4AzECmLYc',
  'Rosca na Polia Alta': '7c2r1N4uYjk',
  'Rosca Concentrada': 'qw_9kCgQ4dk',

  // --- Tríceps (Triceps) ---
  'Tríceps na Polia com Corda': '2-LAMcpzODU',
  'Tríceps Polia': '2-LAMcpzODU', // Alias
  'Tríceps na Polia com Barra': '4hLoNw6e6L8',
  'Tríceps Testa com Barra': 'vB5OHsJ3EME',
  'Tríceps Francês com Halter': 'ZXsQAXx_ao0',
  'Mergulho no Banco': '6kALZikXxLc',
  'Mergulho em Barras Paralelas': 'wjUmnZH528Y',
  'Tríceps Coice com Halter': '6SS1CWXOK4Q',

  // --- Core/Abdômen (Core/Abs) ---
  'Prancha Abdominal': 'pSHjTRCQxIw',
  'Prancha': 'pSHjTRCQxIw', // Alias
  'Abdominal Supra': '1fbU_MkV7NE',
  'Elevação de Pernas': 'JB2oyawG9KI',
  'Abdominal Remador': 'hnF6EXFqYoA',
  'Rotação de Tronco (Russian Twist)': 'wkD8rjkodUI',
  'Prancha Lateral': 'K2VljzCC16g',

  // --- Corpo Inteiro/Cardio (Full Body/Cardio) ---
  'Burpee': 'TU8QYVW0gDU',
  'Polichinelo': 'c4DAnQ6DtF8',
  'Corda de Pular': '3cuvFcZfzG0',
};

// Um vídeo padrão caso um exercício específico não tenha um vídeo mapeado.
// Um vídeo sobre aquecimento geral dinâmico.
export const fallbackVideoId = 'sD8a4-V1u_M'; // Redefining Strength

// Export a list of all available exercise names for the planner
export const EXERCISE_NAMES = Object.keys(videoMap).sort();