import { AppLayout } from '@/components/layout/AppLayout';
import { useFormulacoes, useDeleteFormulacao } from '@/hooks/useFormulacoes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { FileText, Trash2, Calculator, Plus } from 'lucide-react';
import { formatarMoeda } from '@/lib/calculadora';

export default function FormulacoesList() {
  const { data: formulacoes, isLoading } = useFormulacoes();
  const deleteFormulacao = useDeleteFormulacao();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Minhas Formulações</h1>
            <p className="text-muted-foreground">Gerencie suas fórmulas salvas</p>
          </div>
          <Link to="/calculadora">
            <Button className="gap-2"><Plus className="h-4 w-4" />Nova Formulação</Button>
          </Link>
        </div>

        {formulacoes?.length === 0 ? (
          <Card className="card-shadow">
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma formulação ainda</h3>
              <p className="text-muted-foreground mt-2">Comece criando sua primeira formulação de fertilizante</p>
              <Link to="/calculadora"><Button className="mt-6 gap-2"><Calculator className="h-4 w-4" />Criar Formulação</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {formulacoes?.map((f) => (
              <Card key={f.id} className="card-shadow hover:card-shadow-hover transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{f.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">{f.codigo}</p>
                    </div>
                    <Badge variant={f.status === 'ativo' ? 'default' : 'secondary'}>{f.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><p className="text-xs text-muted-foreground">Peso Total</p><p className="font-semibold">{f.peso_total} kg</p></div>
                    <div><p className="text-xs text-muted-foreground">Custo Total</p><p className="font-semibold text-accent">{f.custo_total ? formatarMoeda(f.custo_total) : '-'}</p></div>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center text-xs mb-4">
                    <div className="bg-muted rounded p-1"><span className="block font-bold">{f.n_alvo || '-'}</span><span className="text-muted-foreground">N</span></div>
                    <div className="bg-muted rounded p-1"><span className="block font-bold">{f.p_alvo || '-'}</span><span className="text-muted-foreground">P</span></div>
                    <div className="bg-muted rounded p-1"><span className="block font-bold">{f.k_alvo || '-'}</span><span className="text-muted-foreground">K</span></div>
                    <div className="bg-muted rounded p-1"><span className="block font-bold">{f.s_alvo || '-'}</span><span className="text-muted-foreground">S</span></div>
                    <div className="bg-muted rounded p-1"><span className="block font-bold">{f.ca_alvo || '-'}</span><span className="text-muted-foreground">Ca</span></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{new Date(f.criado_em).toLocaleDateString('pt-BR')}</span>
                    <Button variant="ghost" size="icon" onClick={() => deleteFormulacao.mutate(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}