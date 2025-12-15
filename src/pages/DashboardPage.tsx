import { useAuth } from '@/contexts/AuthContext';
import { useFormulacoes } from '@/hooks/useFormulacoes';
import { useIngredientes } from '@/hooks/useIngredientes';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  FlaskConical,
  Calculator,
  FileText,
  TrendingUp,
  Package,
  DollarSign,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { formatarMoeda } from '@/lib/calculadora';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { data: formulacoes, isLoading: loadingFormulacoes } = useFormulacoes();
  const { data: ingredientes, isLoading: loadingIngredientes } = useIngredientes();

  const totalFormulacoes = formulacoes?.length || 0;
  const totalIngredientes = ingredientes?.length || 0;
  const custoMedioIngrediente = ingredientes?.length
    ? ingredientes.reduce((sum, i) => sum + Number(i.custo_por_ton), 0) / ingredientes.length
    : 0;

  const ultimasFormulacoes = formulacoes?.slice(0, 5) || [];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Olá, {profile?.nome?.split(' ')[0] || 'Usuário'}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo ao Formulador Inteligente de Fertilizantes
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/calculadora">
              <Button className="gap-2">
                <Calculator className="h-4 w-4" />
                Nova Formulação
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card-shadow hover:card-shadow-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Formulações
              </CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFormulacoes}</div>
              <p className="text-xs text-muted-foreground">formulações salvas</p>
            </CardContent>
          </Card>

          <Card className="card-shadow hover:card-shadow-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ingredientes Disponíveis
              </CardTitle>
              <FlaskConical className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIngredientes}</div>
              <p className="text-xs text-muted-foreground">ingredientes cadastrados</p>
            </CardContent>
          </Card>

          <Card className="card-shadow hover:card-shadow-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Custo Médio
              </CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarMoeda(custoMedioIngrediente)}</div>
              <p className="text-xs text-muted-foreground">por tonelada</p>
            </CardContent>
          </Card>

          <Card className="card-shadow hover:card-shadow-hover transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ingredientes Ativos
              </CardTitle>
              <Package className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ingredientes?.filter(i => i.disponivel).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">disponíveis para uso</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Comece rapidamente com as ações mais comuns
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link to="/calculadora">
                <Button variant="outline" className="w-full justify-between h-auto py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Calcular Formulação</p>
                      <p className="text-sm text-muted-foreground">
                        Crie uma nova fórmula de fertilizante
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              </Link>

              <Link to="/ingredientes">
                <Button variant="outline" className="w-full justify-between h-auto py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <Plus className="h-5 w-5 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Adicionar Ingrediente</p>
                      <p className="text-sm text-muted-foreground">
                        Cadastre novos insumos
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              </Link>

              <Link to="/formulacoes">
                <Button variant="outline" className="w-full justify-between h-auto py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                      <FileText className="h-5 w-5 text-success" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Ver Formulações</p>
                      <p className="text-sm text-muted-foreground">
                        Acesse suas fórmulas salvas
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Formulations */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Últimas Formulações
              </CardTitle>
              <CardDescription>
                Suas formulações mais recentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ultimasFormulacoes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/40" />
                  <p className="mt-4 text-muted-foreground">
                    Nenhuma formulação ainda
                  </p>
                  <Link to="/calculadora">
                    <Button variant="link" className="mt-2">
                      Criar primeira formulação
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {ultimasFormulacoes.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="font-medium">{f.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {f.codigo} • {f.cultura || 'Sem cultura'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">
                          {f.custo_total ? formatarMoeda(f.custo_total) : '-'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(f.criado_em).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}