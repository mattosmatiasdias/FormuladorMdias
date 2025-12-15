export interface Ingrediente {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  n: number;
  p: number;
  k: number;
  s: number;
  ca: number;
  mg: number;
  zn: number;
  b: number;
  mn: number;
  cu: number;
  fe: number;
  mo: number;
  custo_por_ton: number;
  densidade: number | null;
  solubilidade: string | null;
  disponivel: boolean;
  categoria: string | null;
  tags: string[] | null;
  criado_em: string;
  atualizado_em: string;
  usuario_id: string | null;
}

export interface Formulacao {
  id: number;
  codigo: string;
  nome: string;
  descricao: string | null;
  n_alvo: number | null;
  p_alvo: number | null;
  k_alvo: number | null;
  s_alvo: number | null;
  ca_alvo: number | null;
  cultura: string | null;
  fase_crescimento: string | null;
  solo_tipo: string | null;
  regiao: string | null;
  status: string;
  publica: boolean;
  custo_total: number | null;
  peso_total: number;
  criado_em: string;
  atualizado_em: string;
  usuario_id: string;
}

export interface FormulacaoItem {
  id: number;
  formulacao_id: number;
  ingrediente_id: number;
  quantidade_kg: number;
  porcentagem: number;
  custo_unitario: number | null;
  custo_total: number | null;
  ordem_mistura: number | null;
  ingrediente?: Ingrediente;
}

export interface Profile {
  id: string;
  email: string;
  nome: string;
  empresa: string | null;
  cargo: string | null;
  ativo: boolean;
  criado_em: string;
  ultimo_login: string | null;
}

export interface CalculoResultado {
  ingredientes: {
    ingrediente: Ingrediente;
    quantidade_kg: number;
    porcentagem: number;
    custo_total: number;
  }[];
  composicao_obtida: {
    n: number;
    p: number;
    k: number;
    s: number;
    ca: number;
  };
  custo_total: number;
  peso_total: number;
}

export interface ComposicaoAlvo {
  n: number | null;
  p: number | null;
  k: number | null;
  s: number | null;
  ca: number | null;
}