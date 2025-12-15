import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useIngredientes } from '@/hooks/useIngredientes';
import { useCreateFormulacao, useSaveFormulacaoItens } from '@/hooks/useFormulacoes';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, Save, FlaskConical, AlertTriangle, Check } from 'lucide-react';
import { formatarMoeda, formatarPorcentagem } from '@/lib/calculadora';
import { Ingrediente } from '@/types/database';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ResultadoItem {
  ingrediente: Ingrediente;
  quantidade_kg: number;
  porcentagem: number;
  custo_total: number;
}

interface ResultadoCalculo {
  sucesso: boolean;
  mensagem: string;
  itens: ResultadoItem[];
  composicaoObtida: { n: number; p: number; k: number; s: number; ca: number };
  pesoTotal: number;
  custoTotal: number;
}

// Função para resolver sistema linear simples (até 3 equações)
const resolverSistemaLinear = (equacoes: number[][], resultados: number[]): number[] | null => {
  const n = equacoes.length;
  const m = equacoes[0].length;
  
  // Método de eliminação de Gauss-Jordan simplificado
  const A = equacoes.map(row => [...row]);
  const B = [...resultados];
  
  for (let i = 0; i < Math.min(n, m); i++) {
    // Encontrar pivô
    let maxRow = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(A[j][i]) > Math.abs(A[maxRow][i])) {
        maxRow = j;
      }
    }
    
    // Trocar linhas
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    [B[i], B[maxRow]] = [B[maxRow], B[i]];
    
    // Verificar se o pivô é zero (ou muito pequeno)
    if (Math.abs(A[i][i]) < 1e-10) {
      continue;
    }
    
    // Normalizar a linha do pivô
    const pivot = A[i][i];
    for (let j = i; j < m; j++) {
      A[i][j] /= pivot;
    }
    B[i] /= pivot;
    
    // Eliminar outras linhas
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        const factor = A[j][i];
        for (let k = i; k < m; k++) {
          A[j][k] -= factor * A[i][k];
        }
        B[j] -= factor * B[i];
      }
    }
  }
  
  // Verificar solução
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < m; j++) {
      sum += A[i][j] * (B[j] || 0);
    }
    if (Math.abs(sum - B[i]) > 1e-5 && Math.abs(B[i]) > 1e-5) {
      return null; // Sistema inconsistente
    }
  }
  
  return B.slice(0, m);
};

export default function CalculadoraPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: ingredientes } = useIngredientes();
  const createFormulacao = useCreateFormulacao();
  const saveItens = useSaveFormulacaoItens();

  const [ingredientesSelecionados, setIngredientesSelecionados] = useState<number[]>([]);
  const [alvo, setAlvo] = useState({ n: '', p: '', k: '', s: '', ca: '' });
  const [pesoTotalDesejado, setPesoTotalDesejado] = useState('1000');
  const [nomeFormulacao, setNomeFormulacao] = useState('');
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [calculando, setCalculando] = useState(false);

  const ingredientesDisponiveis = ingredientes?.filter(i => i.disponivel) || [];

  const toggleIngrediente = (id: number) => {
    if (ingredientesSelecionados.includes(id)) {
      setIngredientesSelecionados(ingredientesSelecionados.filter(i => i !== id));
    } else {
      setIngredientesSelecionados([...ingredientesSelecionados, id]);
    }
    setResultado(null);
  };

  const handleCalcular = () => {
    setCalculando(true);
    setResultado(null);

    // Validações
    const alvosDefinidos = {
      n: alvo.n ? Number(alvo.n) : 0,
      p: alvo.p ? Number(alvo.p) : 0,
      k: alvo.k ? Number(alvo.k) : 0,
      s: alvo.s ? Number(alvo.s) : 0,
      ca: alvo.ca ? Number(alvo.ca) : 0,
    };

    const temAlvo = Object.values(alvosDefinidos).some(v => v > 0);
    if (!temAlvo) {
      setResultado({
        sucesso: false,
        mensagem: 'Defina pelo menos um nutriente alvo (N, P, K, S ou Ca) maior que zero.',
        itens: [],
        composicaoObtida: { n: 0, p: 0, k: 0, s: 0, ca: 0 },
        pesoTotal: 0,
        custoTotal: 0,
      });
      setCalculando(false);
      return;
    }

    if (ingredientesSelecionados.length === 0) {
      setResultado({
        sucesso: false,
        mensagem: 'Selecione pelo menos um ingrediente disponível para o cálculo.',
        itens: [],
        composicaoObtida: { n: 0, p: 0, k: 0, s: 0, ca: 0 },
        pesoTotal: 0,
        custoTotal: 0,
      });
      setCalculando(false);
      return;
    }

    const pesoTotal = Number(pesoTotalDesejado) || 1000;
    const ingredientesSel = ingredientesDisponiveis.filter(i => ingredientesSelecionados.includes(i.id));

    // Calcular formulação
    const resultadoCalculo = calcularFormulacaoOtimizada(ingredientesSel, alvosDefinidos, pesoTotal);

    setTimeout(() => {
      setResultado(resultadoCalculo);
      setCalculando(false);
    }, 500);
  };

  const calcularFormulacaoOtimizada = (
    ingredientes: Ingrediente[],
    alvo: { n: number; p: number; k: number; s: number; ca: number },
    pesoTotal: number
  ): ResultadoCalculo => {
    if (ingredientes.length === 0) {
      return {
        sucesso: false,
        mensagem: 'Selecione pelo menos um ingrediente.',
        itens: [],
        composicaoObtida: { n: 0, p: 0, k: 0, s: 0, ca: 0 },
        pesoTotal: 0,
        custoTotal: 0,
      };
    }

    // Identificar nutrientes alvo (> 0)
    const nutrientesAlvo: ('n' | 'p' | 'k' | 's' | 'ca')[] = [];
    if (alvo.n > 0) nutrientesAlvo.push('n');
    if (alvo.p > 0) nutrientesAlvo.push('p');
    if (alvo.k > 0) nutrientesAlvo.push('k');
    if (alvo.s > 0) nutrientesAlvo.push('s');
    if (alvo.ca > 0) nutrientesAlvo.push('ca');

    if (nutrientesAlvo.length === 0) {
      return {
        sucesso: false,
        mensagem: 'Defina pelo menos um nutriente alvo maior que zero.',
        itens: [],
        composicaoObtida: { n: 0, p: 0, k: 0, s: 0, ca: 0 },
        pesoTotal: 0,
        custoTotal: 0,
      };
    }

    // TENTAR RESOLVER COM SISTEMA LINEAR PRIMEIRO
    // Esta abordagem funciona bem para até 3 ingredientes e 2-3 nutrientes
    
    if (ingredientes.length <= 5 && nutrientesAlvo.length <= 3) {
      // Criar sistema de equações
      const numEquacoes = nutrientesAlvo.length + 1; // +1 para soma total
      const numVariaveis = ingredientes.length;
      
      if (numEquacoes <= numVariaveis) {
        const equacoes: number[][] = [];
        const resultados: number[] = [];
        
        // Equação 1: soma das quantidades = pesoTotal
        equacoes.push(new Array(ingredientes.length).fill(1));
        resultados.push(pesoTotal);
        
        // Equações para nutrientes alvo
        for (const nutriente of nutrientesAlvo) {
          const coeficientes = ingredientes.map(i => Number(i[nutriente]) / 100);
          const resultadoAlvo = (alvo[nutriente] / 100) * pesoTotal;
          equacoes.push(coeficientes);
          resultados.push(resultadoAlvo);
        }
        
        // Adicionar equações fictícias se necessário para sistema quadrado
        while (equacoes.length < ingredientes.length) {
          // Adicionar equação que penaliza uso excessivo (minimizar custo)
          const eq = ingredientes.map((_, idx) => idx < equacoes.length ? 0 : 1);
          equacoes.push(eq);
          resultados.push(0);
        }
        
        // Resolver sistema
        const solucao = resolverSistemaLinear(equacoes, resultados);
        
        if (solucao && solucao.every(x => x >= -0.01)) { // Permitir pequenas variações negativas
          const itens: ResultadoItem[] = [];
          let custoTotal = 0;
          let pesoVerificado = 0;
          
          ingredientes.forEach((ing, index) => {
            let qtd = Math.max(0, solucao[index] || 0);
            
            // Arredondar para evitar quantidades muito pequenas
            if (qtd < 0.1) qtd = 0;
            
            if (qtd > 0) {
              const custo = (Number(ing.custo_por_ton) / 1000) * qtd;
              custoTotal += custo;
              pesoVerificado += qtd;
              itens.push({
                ingrediente: ing,
                quantidade_kg: Math.round(qtd * 10) / 10,
                porcentagem: (qtd / pesoTotal) * 100,
                custo_total: custo,
              });
            }
          });
          
          // Se encontrou solução, calcular composição
          if (itens.length > 0) {
            // Ajustar para soma exata se necessário
            const diferenca = pesoTotal - pesoVerificado;
            if (Math.abs(diferenca) > 0.1 && itens.length > 0) {
              // Distribuir diferença proporcionalmente
              const fator = pesoTotal / pesoVerificado;
              itens.forEach(item => {
                item.quantidade_kg *= fator;
                item.quantidade_kg = Math.round(item.quantidade_kg * 10) / 10;
                item.custo_total = (Number(item.ingrediente.custo_por_ton) / 1000) * item.quantidade_kg;
                item.porcentagem = (item.quantidade_kg / pesoTotal) * 100;
              });
              pesoVerificado = pesoTotal;
              
              // Recalcular custo total
              custoTotal = itens.reduce((sum, item) => sum + item.custo_total, 0);
            }
            
            // Calcular composição obtida
            const composicaoObtida = { n: 0, p: 0, k: 0, s: 0, ca: 0 };
            itens.forEach(item => {
              const fator = item.quantidade_kg / pesoVerificado;
              composicaoObtida.n += Number(item.ingrediente.n) * fator;
              composicaoObtida.p += Number(item.ingrediente.p) * fator;
              composicaoObtida.k += Number(item.ingrediente.k) * fator;
              composicaoObtida.s += Number(item.ingrediente.s) * fator;
              composicaoObtida.ca += Number(item.ingrediente.ca) * fator;
            });
            
            // Arredondar
            Object.keys(composicaoObtida).forEach(key => {
              composicaoObtida[key as keyof typeof composicaoObtida] = 
                Math.round(composicaoObtida[key as keyof typeof composicaoObtida] * 100) / 100;
            });
            
            // Verificar precisão
            let precisaMelhorar = false;
            for (const nutriente of nutrientesAlvo) {
              const diff = Math.abs(composicaoObtida[nutriente] - alvo[nutriente]);
              if (diff > 0.5) { // Tolerância de 0.5%
                precisaMelhorar = true;
              }
            }
            
            if (!precisaMelhorar || nutrientesAlvo.length === 1) {
              return {
                sucesso: true,
                mensagem: 'Fórmula calculada com sistema linear',
                itens,
                composicaoObtida,
                pesoTotal: pesoVerificado,
                custoTotal,
              };
            }
          }
        }
      }
    }
    
    // FALLBACK: MÉTODO ITERATIVO SIMPLIFICADO
    // Útil quando o sistema linear não converge ou para muitos ingredientes
    
    console.log('Usando método iterativo como fallback...');
    
    // Encontrar ingredientes principais para cada nutriente alvo
    const ingredientesPorNutriente: Record<string, Ingrediente[]> = {};
    nutrientesAlvo.forEach(n => {
      ingredientesPorNutriente[n] = ingredientes
        .filter(i => Number(i[n]) > 0)
        .sort((a, b) => Number(b[n]) - Number(a[n]));
    });
    
    // Verificar se temos ingredientes para todos os nutrientes
    for (const nutriente of nutrientesAlvo) {
      if (ingredientesPorNutriente[nutriente].length === 0) {
        return {
          sucesso: false,
          mensagem: `Nenhum ingrediente selecionado fornece ${nutriente.toUpperCase()}.`,
          itens: [],
          composicaoObtida: { n: 0, p: 0, k: 0, s: 0, ca: 0 },
          pesoTotal: 0,
          custoTotal: 0,
        };
      }
    }
    
    // Inicializar com valores proporcionais
    const quantidadesIniciais: number[] = new Array(ingredientes.length).fill(pesoTotal / ingredientes.length);
    
    // Otimização iterativa simples
    let melhorSolucao = [...quantidadesIniciais];
    let melhorErro = Infinity;
    const maxIteracoes = 1000;
    
    for (let iter = 0; iter < maxIteracoes; iter++) {
      // Calcular composição atual
      const composicaoAtual = { n: 0, p: 0, k: 0, s: 0, ca: 0 };
      let pesoAtual = 0;
      
      ingredientes.forEach((ing, idx) => {
        const qtd = melhorSolucao[idx];
        pesoAtual += qtd;
        const fator = qtd / pesoTotal;
        composicaoAtual.n += Number(ing.n) * fator;
        composicaoAtual.p += Number(ing.p) * fator;
        composicaoAtual.k += Number(ing.k) * fator;
        composicaoAtual.s += Number(ing.s) * fator;
        composicaoAtual.ca += Number(ing.ca) * fator;
      });
      
      // Calcular erro
      let erro = 0;
      for (const nutriente of nutrientesAlvo) {
        const diff = composicaoAtual[nutriente] - alvo[nutriente];
        erro += diff * diff;
      }
      
      // Normalizar para soma = pesoTotal
      if (Math.abs(pesoAtual - pesoTotal) > 0.01) {
        const fator = pesoTotal / pesoAtual;
        melhorSolucao = melhorSolucao.map(q => q * fator);
        erro += Math.pow(pesoAtual - pesoTotal, 2);
      }
      
      if (erro < melhorErro) {
        melhorErro = erro;
      }
      
      // Ajustar quantidades proporcionalmente ao erro
      if (iter < maxIteracoes - 1) {
        for (let i = 0; i < melhorSolucao.length; i++) {
          // Pequeno ajuste aleatório
          const ajuste = (Math.random() - 0.5) * 0.1 * pesoTotal;
          melhorSolucao[i] = Math.max(0, melhorSolucao[i] + ajuste);
        }
      }
    }
    
    // Construir resultado final
    const itens: ResultadoItem[] = [];
    let custoTotal = 0;
    let pesoFinal = 0;
    
    ingredientes.forEach((ing, idx) => {
      const qtd = Math.max(0, melhorSolucao[idx]);
      if (qtd > 0.1) { // Ignorar quantidades muito pequenas
        const custo = (Number(ing.custo_por_ton) / 1000) * qtd;
        custoTotal += custo;
        pesoFinal += qtd;
        itens.push({
          ingrediente: ing,
          quantidade_kg: Math.round(qtd * 10) / 10,
          porcentagem: (qtd / pesoTotal) * 100,
          custo_total: custo,
        });
      }
    });
    
    // Recalcular com valores finais
    const composicaoFinal = { n: 0, p: 0, k: 0, s: 0, ca: 0 };
    let pesoVerificado = 0;
    
    itens.forEach(item => {
      pesoVerificado += item.quantidade_kg;
      const fator = item.quantidade_kg / pesoTotal;
      composicaoFinal.n += Number(item.ingrediente.n) * fator;
      composicaoFinal.p += Number(item.ingrediente.p) * fator;
      composicaoFinal.k += Number(item.ingrediente.k) * fator;
      composicaoFinal.s += Number(item.ingrediente.s) * fator;
      composicaoFinal.ca += Number(item.ingrediente.ca) * fator;
    });
    
    // Arredondar
    Object.keys(composicaoFinal).forEach(key => {
      composicaoFinal[key as keyof typeof composicaoFinal] = 
        Math.round(composicaoFinal[key as keyof typeof composicaoFinal] * 100) / 100;
    });
    
    // Verificar precisão
    let precisaMelhorar = false;
    for (const nutriente of nutrientesAlvo) {
      const diff = Math.abs(composicaoFinal[nutriente] - alvo[nutriente]);
      if (diff > 1.0) { // Tolerância mais flexível para método iterativo
        precisaMelhorar = true;
      }
    }
    
    if (precisaMelhorar) {
      return {
        sucesso: false,
        mensagem: `Não foi possível atingir precisão suficiente. Diferenças: N:${Math.abs(composicaoFinal.n - alvo.n).toFixed(1)}%, K:${Math.abs(composicaoFinal.k - alvo.k).toFixed(1)}%`,
        itens,
        composicaoObtida: composicaoFinal,
        pesoTotal: pesoVerificado,
        custoTotal,
      };
    }
    
    return {
      sucesso: true,
      mensagem: 'Fórmula calculada com método iterativo',
      itens,
      composicaoObtida: composicaoFinal,
      pesoTotal: pesoVerificado,
      custoTotal,
    };
  };

  const handleSalvar = async () => {
    if (!resultado || !resultado.sucesso) {
      toast.error('Calcule a formulação primeiro');
      return;
    }
    if (!nomeFormulacao.trim()) {
      toast.error('Digite um nome para a formulação');
      return;
    }

    const codigo = `FORM-${Date.now()}`;
    const form = await createFormulacao.mutateAsync({
      codigo,
      nome: nomeFormulacao,
      descricao: null,
      n_alvo: alvo.n ? Number(alvo.n) : null,
      p_alvo: alvo.p ? Number(alvo.p) : null,
      k_alvo: alvo.k ? Number(alvo.k) : null,
      s_alvo: alvo.s ? Number(alvo.s) : null,
      ca_alvo: alvo.ca ? Number(alvo.ca) : null,
      cultura: null,
      fase_crescimento: null,
      solo_tipo: null,
      regiao: null,
      status: 'ativo',
      publica: false,
      custo_total: resultado.custoTotal,
      peso_total: resultado.pesoTotal,
      usuario_id: user!.id,
    });

    await saveItens.mutateAsync({
      formulacaoId: form.id,
      itens: resultado.itens.map((item, index) => ({
        formulacao_id: form.id,
        ingrediente_id: item.ingrediente.id,
        quantidade_kg: item.quantidade_kg,
        porcentagem: item.porcentagem,
        custo_unitario: Number(item.ingrediente.custo_por_ton),
        custo_total: item.custo_total,
        ordem_mistura: index + 1,
      })),
    });

    toast.success('Formulação salva com sucesso!');
    navigate('/formulacoes');
  };

  const limpar = () => {
    setIngredientesSelecionados([]);
    setAlvo({ n: '', p: '', k: '', s: '', ca: '' });
    setPesoTotalDesejado('1000');
    setNomeFormulacao('');
    setResultado(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Calculadora de Formulação</h1>
          <p className="text-muted-foreground">Defina a composição alvo e selecione os ingredientes disponíveis</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Painel Esquerdo - Configuração */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">1. Composição Alvo (%)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {(['n', 'p', 'k', 's', 'ca'] as const).map((key) => (
                  <div key={key}>
                    <Label className="text-xs uppercase text-primary font-semibold">{key}</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      min="0"
                      max="100"
                      placeholder="0" 
                      value={alvo[key]} 
                      onChange={(e) => {
                        setAlvo({ ...alvo, [key]: e.target.value });
                        setResultado(null);
                      }} 
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label className="text-xs">Peso Total (kg)</Label>
                <Input 
                  type="number" 
                  value={pesoTotalDesejado} 
                  onChange={(e) => {
                    setPesoTotalDesejado(e.target.value);
                    setResultado(null);
                  }}
                />
              </div>

              <div className="border-t pt-4">
                <Label className="text-sm font-medium mb-3 block">2. Ingredientes Disponíveis</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {ingredientesDisponiveis.map((ing) => {
                    const isSelected = ingredientesSelecionados.includes(ing.id);
                    return (
                      <div 
                        key={ing.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`} 
                        onClick={() => toggleIngrediente(ing.id)}
                      >
                        <Checkbox checked={isSelected} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{ing.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            N:{ing.n}% P:{ing.p}% K:{ing.k}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1 gap-2" 
                  onClick={handleCalcular}
                  disabled={calculando}
                >
                  <Calculator className="h-4 w-4" />
                  {calculando ? 'Calculando...' : 'Calcular'}
                </Button>
                <Button variant="outline" onClick={limpar}>Limpar</Button>
              </div>
            </CardContent>
          </Card>

          {/* Painel Direito - Resultados */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Resultado da Formulação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!resultado && (
                <div className="text-center py-12 text-muted-foreground">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Defina a composição alvo, selecione os ingredientes e clique em "Calcular"</p>
                  <p className="text-sm mt-2">Exemplo para 20-0-20: Use Cloreto, Ureia e Sulfato</p>
                </div>
              )}

              {resultado && !resultado.sucesso && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Não foi possível calcular</AlertTitle>
                  <AlertDescription>{resultado.mensagem}</AlertDescription>
                </Alert>
              )}

              {resultado && resultado.sucesso && (
                <>
                  <Alert className="border-green-500 bg-green-500/10">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-700">Fórmula Calculada</AlertTitle>
                    <AlertDescription className="text-green-600">{resultado.mensagem}</AlertDescription>
                  </Alert>

                  {/* Tabela de Ingredientes */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Ingrediente</th>
                          <th className="text-right p-3 font-medium">Quantidade</th>
                          <th className="text-right p-3 font-medium">%</th>
                          <th className="text-right p-3 font-medium">Custo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultado.itens.map((item) => (
                          <tr key={item.ingrediente.id} className="border-t">
                            <td className="p-3 font-medium">{item.ingrediente.nome}</td>
                            <td className="p-3 text-right">{item.quantidade_kg.toFixed(1)} kg</td>
                            <td className="p-3 text-right">{item.porcentagem.toFixed(1)}%</td>
                            <td className="p-3 text-right text-accent">{formatarMoeda(item.custo_total)}</td>
                          </tr>
                        ))}
                        <tr className="border-t bg-muted/30 font-bold">
                          <td className="p-3">TOTAL</td>
                          <td className="p-3 text-right">{resultado.pesoTotal.toFixed(0)} kg</td>
                          <td className="p-3 text-right">100%</td>
                          <td className="p-3 text-right text-accent">{formatarMoeda(resultado.custoTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Composição Obtida vs Alvo */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Composição Obtida vs Alvo</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {(['n', 'p', 'k', 's', 'ca'] as const).map((key) => {
                        const obtido = resultado.composicaoObtida[key];
                        const alvoVal = Number(alvo[key]) || 0;
                        const diff = alvoVal > 0 ? obtido - alvoVal : 0;
                        const diffAbs = Math.abs(diff);
                        return (
                          <div key={key} className={`rounded-lg p-3 text-center ${alvoVal > 0 ? 'bg-muted/50' : 'bg-muted/20'}`}>
                            <p className="text-xs uppercase text-muted-foreground mb-1">{key}</p>
                            <p className="text-lg font-bold text-primary">{formatarPorcentagem(obtido)}</p>
                            {alvoVal > 0 && (
                              <p className={`text-xs ${diffAbs <= 0.5 ? 'text-green-600' : diffAbs <= 1 ? 'text-yellow-600' : 'text-red-500'}`}>
                                {diff >= 0 ? '+' : ''}{diff.toFixed(2)}%
                                {diffAbs > 0.5 && ' ⚠️'}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      ⚠️ indica diferença maior que 0.5% do alvo
                    </p>
                  </div>

                  {/* Salvar */}
                  <div className="border-t pt-4 space-y-3">
                    <Input 
                      placeholder="Nome da formulação (ex: NPK 20-0-20)" 
                      value={nomeFormulacao} 
                      onChange={(e) => setNomeFormulacao(e.target.value)} 
                    />
                    <Button 
                      className="w-full gap-2" 
                      onClick={handleSalvar} 
                      disabled={createFormulacao.isPending || !nomeFormulacao.trim()}
                    >
                      <Save className="h-4 w-4" />
                      Salvar Formulação
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}