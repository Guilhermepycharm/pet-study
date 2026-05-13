export interface Module {
  id: string;
  subject: string;
  title: string;
  items: string[];
}

export const MODULES: Module[] = [
  // FILOSOFIA
  {
    id: "filo-1",
    subject: "Filosofia",
    title: "Filosofia Antiga e Medieval",
    items: [
      "Introdução à Filosofia", "Mitologia e Filosofia", "Filosofia Pré-socrática", 
      "Sofistas", "Método socrático", "Platão: Teoria das ideias", "Política platônica", 
      "Metafísica de Aristóteles", "Política aristotélica", "Período Helenista", 
      "Patrística", "Escolástica"
    ]
  },
  {
    id: "filo-2",
    subject: "Filosofia",
    title: "Filosofia Moderna e Política",
    items: [
      "Revolução Científica", "Descartes e o racionalismo", "Empirismo inglês: John Locke", 
      "David Hume", "Síntese kantiana", "Moralidade kantiana", "As ideias de Maquiavel", 
      "Teoria contratualista: Thomas Hobbes", "Teoria contratualista: John Locke", 
      "Teoria Contratualista: J. J. Rousseau", "Montesquieu: a divisão dos três poderes", 
      "Adam Smith e a economia"
    ]
  },
  {
    id: "filo-3",
    subject: "Filosofia",
    title: "Filosofia Contemporânea e Ética",
    items: [
      "Utilitarismo de Bentham", "Schopenhauer", "Nietzsche: construção do pensamento", 
      "Nietzsche: niilismo", "Sartre e o existencialismo", "Simone de Beauvoir", 
      "Hannah Arendt", "Foucault: arqueologia, genealogia e ética", "Foucault: microfísica do poder", 
      "Bauman", "John Rawls e a justiça", "Habermas e o direito", "Ética e Bioética", 
      "Estética", "Epistemologia"
    ]
  },

  // GEOGRAFIA
  {
    id: "geo-1",
    subject: "Geografia",
    title: "Geografia Humana e Econômica",
    items: [
      "Espaço geográfico brasileiro", "Conceitos Geográficos", "Revoluções industriais", 
      "Modelos produtivos: Fordismo, Toyotismo", "Globalização e neoliberalismo", 
      "Blocos econômicos", "Economias emergentes (BRICS)", "Transportes e comércio mundial"
    ]
  },
  {
    id: "geo-2",
    subject: "Geografia",
    title: "Geopolítica e População",
    items: [
      "Geopolítica: Velha e Nova Ordem Mundial", "Guerra Fria", "Conflitos mundiais", 
      "Oriente Médio: Israel x Palestina", "Guerra da Rússia e Ucrânia", "Energia mundial", 
      "Crescimento e estrutura da população", "Pirâmides etárias e PEA", "Migrações", 
      "Refugiados", "Urbanização e conceitos", "Urbanização brasileira"
    ]
  },
  {
    id: "geo-3",
    subject: "Geografia",
    title: "Geografia Agrária e Ambiental",
    items: [
      "Rede e Hierarquia Urbana", "Agricultura e Modelos de Produção", "Revolução Verde", 
      "Reforma Agrária", "Conflitos no campo", "Espaço amazônico", "Impactos ambientais urbanos", 
      "Conferências ambientais", "Sustentabilidade"
    ]
  },
  {
    id: "geo-4",
    subject: "Geografia",
    title: "Geografia Física",
    items: [
      "Cartografia", "Coordenadas e Fusos Horários", "Processos geomorfológicos", 
      "Agentes internos e externos", "Formação e tipos de solo", "Relevo brasileiro", 
      "Estrutura geológica", "Clima e Dinâmica atmosférica", "Fenômenos climáticos (El Niño)", 
      "Mudanças climáticas", "Vegetação mundial", "Biomas brasileiros", "Recursos hídricos"
    ]
  },

  // LITERATURA
  {
    id: "lit-1",
    subject: "Literatura",
    title: "Teoria e Literatura Colonial",
    items: [
      "Arte e Literatura: conceitos", "Gêneros literários", "Quinhentismo", 
      "Barroco", "Arcadismo"
    ]
  },
  {
    id: "lit-2",
    subject: "Literatura",
    title: "Século XIX: Romantismo ao Simbolismo",
    items: [
      "Romantismo: Poesia e Prosa", "Realismo e Naturalismo", "Machado de Assis", 
      "Parnasianismo", "Simbolismo"
    ]
  },
  {
    id: "lit-3",
    subject: "Literatura",
    title: "Modernismo e Contemporânea",
    items: [
      "Pré-modernismo", "Vanguardas europeias", "Semana de Arte Moderna", 
      "Modernismo: 1ª, 2ª e 3ª fases", "Drummond e João Cabral", "Clarice Lispector", 
      "Guimarães Rosa", "Literatura negra e feminina", "Tropicalismo e Poesia Marginal", 
      "Arte contemporânea"
    ]
  },

  // PORTUGUÊS
  {
    id: "port-1",
    subject: "Português",
    title: "Gramática: Morfologia",
    items: [
      "Substantivo e artigo", "Adjetivo e numeral", "Advérbio", "Preposição", 
      "Conjunções", "Pronomes", "Verbos: tempos e vozes"
    ]
  },
  {
    id: "port-2",
    subject: "Português",
    title: "Gramática: Sintaxe e Norma",
    items: [
      "Sujeito e Predicado", "Complementos verbais e nominais", "Orações coordenadas", 
      "Orações subordinadas", "Pontuação", "Crase", "Concordância verbal e nominal", 
      "Regência verbal e nominal"
    ]
  },
  {
    id: "port-3",
    subject: "Português",
    title: "Interpretação e Linguística",
    items: [
      "Coesão e Coerência", "Tipos e Gêneros Textuais", "Funções da linguagem", 
      "Figuras de linguagem", "Variações linguísticas", "Níveis de linguagem", 
      "Análise de questões ENEM"
    ]
  },

  // SOCIOLOGIA
  {
    id: "soc-1",
    subject: "Sociologia",
    title: "Clássicos e Teoria Social",
    items: [
      "Auguste Comte", "Émile Durkheim", "Max Weber", "Karl Marx", 
      "Escola de Frankfurt", "Indústria Cultural"
    ]
  },
  {
    id: "soc-2",
    subject: "Sociologia",
    title: "Política, Trabalho e Cultura",
    items: [
      "Trabalho e modelos de organização", "Cultura e Antropologia", "Linguagem e comunicação", 
      "Estratificação e mobilidade social", "Bourdieu e Castells", "Globalização e consumo", 
      "Democracia e Eleições", "Cidadania e Direitos"
    ]
  },
  {
    id: "soc-3",
    subject: "Sociologia",
    title: "Sociedade Brasileira e Movimentos",
    items: [
      "Desigualdade social", "Angela Davis, Lélia Gonzales, Sueli Carneiro", 
      "Movimentos sociais", "Questões de gênero", "Sociologia no Brasil", 
      "Culturas indígenas", "Políticas afirmativas", "Questão ambiental"
    ]
  },

  // HISTÓRIA
  {
    id: "hist-1",
    subject: "História",
    title: "História Antiga e Medieval",
    items: [
      "Antiguidade Oriental", "Grécia Antiga", "Roma Antiga", "Alta e Baixa Idade Média", 
      "Renascimento", "Antigo Regime", "Reformas religiosas"
    ]
  },
  {
    id: "hist-2",
    subject: "História",
    title: "História Moderna e Colonial",
    items: [
      "Expansão Marítima", "América Colonial e Espanhola", "América Portuguesa", 
      "Escravidão no Brasil", "Ciclo do Açúcar", "União Ibérica", "Revoluções Inglesas", 
      "Revolução Industrial", "Iluminismo"
    ]
  },
  {
    id: "hist-3",
    subject: "História",
    title: "Século XIX e Brasil Império",
    items: [
      "Independência das 13 colônias", "Revolução Francesa", "Era Napoleônica", 
      "Independência da América Espanhola", "Período Joanino e Independência do Brasil", 
      "Primeiro e Segundo Reinado", "Abolicionismo", "Imperialismo"
    ]
  },
  {
    id: "hist-4",
    subject: "História",
    title: "Século XX: Guerras e Era Vargas",
    items: [
      "Primeira Guerra Mundial", "Revoluções Russas", "Crise de 29 e Fascismos", 
      "Era Vargas", "Segunda Guerra Mundial", "Guerra Fria", "Lutas de libertação"
    ]
  },
  {
    id: "hist-5",
    subject: "História",
    title: "Brasil República e Contemporânea",
    items: [
      "República Oligárquica", "Governos Populistas (Dutra a Goulart)", "Ditadura Militar", 
      "Nova República", "América Latina no séc XX", "Revolução Cubana", "Fim da URSS", 
      "Brasil Contemporâneo"
    ]
  },

  // REDAÇÃO
  {
    id: "red-1",
    subject: "Redação",
    title: "Teoria e Estrutura",
    items: [
      "Conceito de texto", "Dissertação argumentativa", "Competências do ENEM", 
      "Introdução, Desenvolvimento e Conclusão", "Proposta de intervenção", 
      "Métodos de raciocínio", "Coesão e Coerência"
    ]
  },
  {
    id: "red-2",
    subject: "Redação",
    title: "Eixos Temáticos e Prática",
    items: [
      "Comunicação e Tecnologia", "Cultura e Sociedade", "Política e Direitos", 
      "Saúde e Juventude", "Meio Ambiente e Educação", "Análise de temas anteriores"
    ]
  },

  // BIOLOGIA
  {
    id: "bio-1",
    subject: "Biologia",
    title: "Ecologia e Meio Ambiente",
    items: [
      "Cadeias e Teias alimentares", "Relações ecológicas", "Sucessão ecológica", 
      "Ciclos Biogeoquímicos", "Desequilíbrio ambiental", "Biomas e Biociclos"
    ]
  },
  {
    id: "bio-2",
    subject: "Biologia",
    title: "Bioquímica e Citologia",
    items: [
      "Água e Sais Minerais", "Carboidratos e Lipídios", "Proteínas e Enzimas", 
      "Vitaminas", "Ácidos Nucleicos", "Membrana e Transporte", "Citoplasma e Organelas", 
      "Respiração e Fotossíntese"
    ]
  },
  {
    id: "bio-3",
    subject: "Biologia",
    title: "Genética e Evolução",
    items: [
      "Núcleo e Divisão Celular", "Embriologia", "Genética Mendeliana", "Polialelia", 
      "Mutações", "Engenharia Genética", "Origem da Vida", "Teorias Evolutivas"
    ]
  },
  {
    id: "bio-4",
    subject: "Biologia",
    title: "Seres Vivos e Fisiologia",
    items: [
      "Taxonomia", "Vírus, Monera, Protoctistas e Fungos", "Tecidos Animais", 
      "Fisiologia Humana: Digestão, Respiração, Circulação, Excreção, Coordenação, Sentidos", 
      "Reprodução Humana"
    ]
  },

  // FÍSICA
  {
    id: "fis-1",
    subject: "Física",
    title: "Mecânica I: Cinemática",
    items: [
      "Unidades e Vetores", "Movimento Uniforme e MUV", "Lançamentos", "MCU"
    ]
  },
  {
    id: "fis-2",
    subject: "Física",
    title: "Mecânica II: Dinâmica e Energia",
    items: [
      "Leis de Newton", "Forças de Atrito e Plano Inclinado", "Trabalho e Energia", 
      "Impulso e Colisões", "Gravitação Universal", "Estática e Equilíbrio"
    ]
  },
  {
    id: "fis-3",
    subject: "Física",
    title: "Termologia e Fluidos",
    items: [
      "Termometria e Dilatação", "Calorimetria", "Gases e Termodinâmica", "Hidrostática"
    ]
  },
  {
    id: "fis-4",
    subject: "Física",
    title: "Eletricidade e Magnetismo",
    items: [
      "Eletrização e Cargas", "Campo e Potencial Elétrico", "Corrente e Resistores", 
      "Capacitores e Geradores", "Magnetismo e Indução"
    ]
  },
  {
    id: "fis-5",
    subject: "Física",
    title: "Ondulatória e Óptica",
    items: [
      "Óptica Geométrica", "Espelhos e Lentes", "Ondas e Som", "Fenômenos Ondulatórios", 
      "MHS"
    ]
  },

  // QUÍMICA
  {
    id: "qui-1",
    subject: "Química",
    title: "Química Geral: Átomo e Ligações",
    items: [
      "Matéria e Misturas", "Modelos Atômicos", "Tabela Periódica", "Ligações Químicas", 
      "Geometria e Polaridade", "Nox"
    ]
  },
  {
    id: "qui-2",
    subject: "Química",
    title: "Química Geral: Funções e Estequiometria",
    items: [
      "Funções Inorgânicas", "Reações Químicas", "Estequiometria", "Leis Ponderais"
    ]
  },
  {
    id: "qui-3",
    subject: "Química",
    title: "Química Orgânica",
    items: [
      "Cadeias Carbônicas", "Hidrocarbonetos", "Funções Orgânicas", "Isomeria", 
      "Reações Orgânicas"
    ]
  },
  {
    id: "qui-4",
    subject: "Química",
    title: "Físico-Química",
    items: [
      "Soluções", "Termoquímica", "Cinética", "Equilíbrio Químico", "Eletroquímica", 
      "Radioatividade", "Polímeros e Ambiental"
    ]
  },

  // MATEMÁTICA
  {
    id: "mat-1",
    subject: "Matemática",
    title: "Matemática Básica",
    items: [
      "Conjuntos e Números", "MDC e MMC", "Razão, Proporção e Escala", 
      "Regra de Três", "Porcentagem e Juros"
    ]
  },
  {
    id: "mat-2",
    subject: "Matemática",
    title: "Geometria Plana e Espacial",
    items: [
      "Triângulos e Polígonos", "Trigonometria", "Áreas de figuras planas", 
      "Geometria Espacial (Prismas, Pirâmides, Esferas)", "Projeção Ortogonal"
    ]
  },
  {
    id: "mat-3",
    subject: "Matemática",
    title: "Funções e Álgebra",
    items: [
      "Função Afim e Quadrática", "Exponencial e Logaritmos", "Sistemas e Matrizes", 
      "Polinômios e Complexos"
    ]
  },
  {
    id: "mat-4",
    subject: "Matemática",
    title: "Estatística e Combinatória",
    items: [
      "Gráficos e Tabelas", "Medidas de Centralidade e Dispersão", 
      "Análise Combinatória", "Probabilidade"
    ]
  }
];
