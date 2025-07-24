export const UI_TEXT = {
    appTitle: "DANTES - Detector de Test Smells",
    placeholder: "Insira seu código de teste aqui...",
    detectButton: "Detectar",
    uploadButton: "Carregar arquivo",
    languageLabel: "Idioma:",
    analysisTitle: "Resultado da análise e refatoração:",
    sortSmell: "Ordenar por Tipo de Smell",
    sortLine: "Ordenar por Posição no Código",
    originalCode: "Código Original:",
    refactoredCode: "Código Refatorado:",
    errorProcessing: "Ocorreu um erro ao processar a entrada. Verifique o console para detalhes.",
    errorNoCode: "Por favor, insira um código Java para analisar.",
    successMessage: "Nenhum test smell encontrado!",
    refactoring: "Refatorando...",
    refactored: "Refatorado!",
    refactorError: "Ocorreu um erro durante a refatoração. Verifique o console para detalhes."
};

export const SMELL_TEXT_RESOURCES = {
    ASSERTION_ROULETTE: {
        displayName: "Roleta de Asserções",
        refactorAction: "Adicionar Explicação",
        description: "Múltiplas asserções sem explicação em um método de teste dificultam a legibilidade, tornando as falhas de teste pouco claras."
    },
    CONSTRUCTOR_INITIALIZATION: {
        displayName: "Inicialização no Construtor",
        refactorAction: "Usar @BeforeEach",
        description: "Suítes de teste devem evitar o uso de construtores; campos devem ser inicializados em um método setUp()/@BeforeEach."
    },
    EMPTY_TEST: {
        displayName: "Teste Vazio",
        refactorAction: "Adicionar Implementação",
        description: "Métodos de teste vazios representam riscos; o JUnit os aprova, podendo mascarar alterações que quebram o comportamento em classes de produção."
    },
    CONDITIONAL_TEST_LOGIC: {
        displayName: "Lógica Condicional em Teste",
        refactorAction: "Extrair 'then' para novo teste",
        description: "Um teste com lógica condicional (if, for, while) pode ocultar bugs. Deve ser dividido em testes mais simples, cada um cobrindo um único caminho de execução."
    },
    DEFAULT: {
        displayName: "Smell Desconhecido",
        refactorAction: "Refatorar",
        description: "Um test smell foi detectado. Veja a documentação para mais detalhes."
    }
};