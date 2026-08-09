function deriveToolPresentation(tool, state) {
  if (state.availability !== 'available') {
    return {
      state: 'unavailable',
      message: tool.messages?.unavailable || `${tool.label} INDISPONÍVEL NESTA VERSÃO.`,
      buttonHidden: true,
      buttonText: ''
    };
  }
  if (state.applicability !== 'applicable') {
    return {
      state: 'available',
      message: tool.messages?.notApplicable
        || `${tool.label} DISPONÍVEL PARA O CENÁRIO — AINDA NÃO PERTINENTE NESTE CASO.`,
      buttonHidden: true,
      buttonText: ''
    };
  }
  if (state.calculability !== 'calculable') {
    return {
      state: 'incomplete',
      message: state.message
        || tool.messages?.incomplete
        || `${tool.label} NÃO CALCULADO — COMPLETE AS VARIÁVEIS OBRIGATÓRIAS.`,
      buttonHidden: true,
      buttonText: ''
    };
  }
  return {
    state: 'complete',
    message: `${tool.label}: ${state.score} ${state.score === 1 ? 'PONTO' : 'PONTOS'} — ${state.interpretation}${state.applied ? ' · INCLUÍDO NO REGISTRO' : ' · AINDA NÃO INCLUÍDO NO REGISTRO'}`,
    buttonHidden: false,
    buttonText: state.applied ? `Remover ${tool.label} do registro` : `Incluir ${tool.label} no registro`
  };
}

export { deriveToolPresentation };
