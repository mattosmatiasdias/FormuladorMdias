import { Ingrediente, ComposicaoAlvo, CalculoResultado } from '@/types/database';

interface IngredienteSelecionado {
  ingrediente: Ingrediente;
  quantidade_kg: number;
}

export function calcularComposicao(
  ingredientes: IngredienteSelecionado[]
): { n: number; p: number; k: number; s: number; ca: number } {
  const pesoTotal = ingredientes.reduce((sum, i) => sum + i.quantidade_kg, 0);
  
  if (pesoTotal === 0) {
    return { n: 0, p: 0, k: 0, s: 0, ca: 0 };
  }

  const composicao = { n: 0, p: 0, k: 0, s: 0, ca: 0 };

  ingredientes.forEach(({ ingrediente, quantidade_kg }) => {
    const fator = quantidade_kg / pesoTotal;
    composicao.n += Number(ingrediente.n) * fator;
    composicao.p += Number(ingrediente.p) * fator;
    composicao.k += Number(ingrediente.k) * fator;
    composicao.s += Number(ingrediente.s) * fator;
    composicao.ca += Number(ingrediente.ca) * fator;
  });

  return {
    n: Math.round(composicao.n * 100) / 100,
    p: Math.round(composicao.p * 100) / 100,
    k: Math.round(composicao.k * 100) / 100,
    s: Math.round(composicao.s * 100) / 100,
    ca: Math.round(composicao.ca * 100) / 100,
  };
}

export function calcularCustoTotal(ingredientes: IngredienteSelecionado[]): number {
  return ingredientes.reduce((total, { ingrediente, quantidade_kg }) => {
    const custoKg = Number(ingrediente.custo_por_ton) / 1000;
    return total + custoKg * quantidade_kg;
  }, 0);
}

export function otimizarFormulacao(
  ingredientesDisponiveis: Ingrediente[],
  alvo: ComposicaoAlvo,
  pesoTotal: number = 1000
): CalculoResultado | null {
  // Simple greedy algorithm for optimization
  // In a real application, you'd use linear programming (simplex method)
  
  const ingredientesSelecionados: IngredienteSelecionado[] = [];
  let pesoRestante = pesoTotal;
  
  // Filter ingredients that contribute to the target composition
  const ingredientesRelevantes = ingredientesDisponiveis.filter(i => {
    if (alvo.n && Number(i.n) > 0) return true;
    if (alvo.p && Number(i.p) > 0) return true;
    if (alvo.k && Number(i.k) > 0) return true;
    if (alvo.s && Number(i.s) > 0) return true;
    if (alvo.ca && Number(i.ca) > 0) return true;
    return false;
  });

  // Sort by cost efficiency (cost per unit of nutrient)
  const ordenados = [...ingredientesRelevantes].sort((a, b) => 
    Number(a.custo_por_ton) - Number(b.custo_por_ton)
  );

  // Simple allocation based on target
  for (const ingrediente of ordenados) {
    if (pesoRestante <= 0) break;
    
    const quantidade = Math.min(pesoRestante * 0.4, pesoRestante);
    if (quantidade > 0) {
      ingredientesSelecionados.push({ ingrediente, quantidade_kg: quantidade });
      pesoRestante -= quantidade;
    }
  }

  // Adjust to meet weight requirement
  if (pesoRestante > 0 && ingredientesSelecionados.length > 0) {
    ingredientesSelecionados[0].quantidade_kg += pesoRestante;
  }

  if (ingredientesSelecionados.length === 0) {
    return null;
  }

  const composicaoObtida = calcularComposicao(ingredientesSelecionados);
  const custoTotal = calcularCustoTotal(ingredientesSelecionados);
  const pesoTotalCalculado = ingredientesSelecionados.reduce((sum, i) => sum + i.quantidade_kg, 0);

  return {
    ingredientes: ingredientesSelecionados.map((item, index) => ({
      ingrediente: item.ingrediente,
      quantidade_kg: item.quantidade_kg,
      porcentagem: (item.quantidade_kg / pesoTotalCalculado) * 100,
      custo_total: (Number(item.ingrediente.custo_por_ton) / 1000) * item.quantidade_kg,
    })),
    composicao_obtida: composicaoObtida,
    custo_total: custoTotal,
    peso_total: pesoTotalCalculado,
  };
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function formatarPorcentagem(valor: number): string {
  return `${valor.toFixed(2)}%`;
}

export function formatarPeso(valor: number): string {
  return `${valor.toFixed(2)} kg`;
}