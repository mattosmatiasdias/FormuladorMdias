import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useIngredientes, useCreateIngrediente, useDeleteIngrediente } from '@/hooks/useIngredientes';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Trash2, FlaskConical } from 'lucide-react';
import { formatarMoeda } from '@/lib/calculadora';
import { toast } from 'sonner';

export default function IngredientesPage() {
  const { user } = useAuth();
  const { data: ingredientes, isLoading } = useIngredientes();
  const createIngrediente = useCreateIngrediente();
  const deleteIngrediente = useDeleteIngrediente();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredIngredientes = ingredientes?.filter(i =>
    i.nome.toLowerCase().includes(search.toLowerCase()) ||
    i.codigo.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    
    await createIngrediente.mutateAsync({
      codigo: form.get('codigo') as string,
      nome: form.get('nome') as string,
      descricao: form.get('descricao') as string || null,
      n: Number(form.get('n')) || 0,
      p: Number(form.get('p')) || 0,
      k: Number(form.get('k')) || 0,
      s: Number(form.get('s')) || 0,
      ca: Number(form.get('ca')) || 0,
      mg: 0, zn: 0, b: 0, mn: 0, cu: 0, fe: 0, mo: 0,
      custo_por_ton: Number(form.get('custo')) || 0,
      densidade: null,
      solubilidade: null,
      disponivel: true,
      categoria: form.get('categoria') as string || null,
      tags: null,
      usuario_id: user?.id || null,
    });
    setDialogOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Ingredientes</h1>
            <p className="text-muted-foreground">Gerencie os insumos disponíveis</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />Novo Ingrediente</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Novo Ingrediente</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Código</Label><Input name="codigo" required /></div>
                  <div><Label>Categoria</Label><Input name="categoria" placeholder="Ex: Nitrogenados" /></div>
                </div>
                <div><Label>Nome</Label><Input name="nome" required /></div>
                <div><Label>Descrição</Label><Input name="descricao" /></div>
                <div className="grid grid-cols-5 gap-2">
                  <div><Label>N %</Label><Input name="n" type="number" step="0.01" defaultValue="0" /></div>
                  <div><Label>P %</Label><Input name="p" type="number" step="0.01" defaultValue="0" /></div>
                  <div><Label>K %</Label><Input name="k" type="number" step="0.01" defaultValue="0" /></div>
                  <div><Label>S %</Label><Input name="s" type="number" step="0.01" defaultValue="0" /></div>
                  <div><Label>Ca %</Label><Input name="ca" type="number" step="0.01" defaultValue="0" /></div>
                </div>
                <div><Label>Custo por Tonelada (R$)</Label><Input name="custo" type="number" step="0.01" required /></div>
                <Button type="submit" className="w-full" disabled={createIngrediente.isPending}>Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar ingredientes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredIngredientes.map((ing) => (
            <Card key={ing.id} className="card-shadow hover:card-shadow-hover transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FlaskConical className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{ing.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">{ing.codigo}</p>
                    </div>
                  </div>
                  <Badge variant={ing.disponivel ? 'default' : 'secondary'}>
                    {ing.disponivel ? 'Disponível' : 'Indisponível'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 text-center text-sm mb-4">
                  <div className="rounded bg-muted p-2"><span className="block font-bold text-primary">{ing.n}%</span><span className="text-xs text-muted-foreground">N</span></div>
                  <div className="rounded bg-muted p-2"><span className="block font-bold text-primary">{ing.p}%</span><span className="text-xs text-muted-foreground">P</span></div>
                  <div className="rounded bg-muted p-2"><span className="block font-bold text-primary">{ing.k}%</span><span className="text-xs text-muted-foreground">K</span></div>
                  <div className="rounded bg-muted p-2"><span className="block font-bold text-primary">{ing.s}%</span><span className="text-xs text-muted-foreground">S</span></div>
                  <div className="rounded bg-muted p-2"><span className="block font-bold text-primary">{ing.ca}%</span><span className="text-xs text-muted-foreground">Ca</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-accent">{formatarMoeda(Number(ing.custo_por_ton))}/ton</span>
                  <Button variant="ghost" size="icon" onClick={() => deleteIngrediente.mutate(ing.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}