import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Formulacao, FormulacaoItem } from '@/types/database';
import { toast } from 'sonner';

export function useFormulacoes() {
  return useQuery({
    queryKey: ['formulacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('formulacoes')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      return data as Formulacao[];
    },
  });
}

export function useFormulacao(id: number | null) {
  return useQuery({
    queryKey: ['formulacao', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('formulacoes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Formulacao;
    },
    enabled: !!id,
  });
}

export function useFormulacaoItens(formulacaoId: number | null) {
  return useQuery({
    queryKey: ['formulacao_itens', formulacaoId],
    queryFn: async () => {
      if (!formulacaoId) return [];
      
      const { data, error } = await supabase
        .from('formulacao_itens')
        .select(`
          *,
          ingrediente:ingredientes(*)
        `)
        .eq('formulacao_id', formulacaoId)
        .order('ordem_mistura');

      if (error) throw error;
      return data as (FormulacaoItem & { ingrediente: any })[];
    },
    enabled: !!formulacaoId,
  });
}

export function useCreateFormulacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formulacao: Omit<Formulacao, 'id' | 'criado_em' | 'atualizado_em'>) => {
      const { data, error } = await supabase
        .from('formulacoes')
        .insert(formulacao)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulacoes'] });
      toast.success('Formulação salva com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar formulação: ${error.message}`);
    },
  });
}

export function useUpdateFormulacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...formulacao }: Partial<Formulacao> & { id: number }) => {
      const { data, error } = await supabase
        .from('formulacoes')
        .update(formulacao)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulacoes'] });
      toast.success('Formulação atualizada!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
}

export function useDeleteFormulacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('formulacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulacoes'] });
      toast.success('Formulação excluída!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });
}

export function useSaveFormulacaoItens() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formulacaoId, itens }: { formulacaoId: number; itens: Omit<FormulacaoItem, 'id'>[] }) => {
      // First, delete existing items
      await supabase
        .from('formulacao_itens')
        .delete()
        .eq('formulacao_id', formulacaoId);

      // Then insert new items
      if (itens.length > 0) {
        const { error } = await supabase
          .from('formulacao_itens')
          .insert(itens);

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['formulacao_itens', variables.formulacaoId] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar itens: ${error.message}`);
    },
  });
}