import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Ingrediente } from '@/types/database';
import { toast } from 'sonner';

export function useIngredientes() {
  return useQuery({
    queryKey: ['ingredientes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredientes')
        .select('*')
        .order('nome');

      if (error) throw error;
      return data as Ingrediente[];
    },
  });
}

export function useCreateIngrediente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ingrediente: Omit<Ingrediente, 'id' | 'criado_em' | 'atualizado_em'>) => {
      const { data, error } = await supabase
        .from('ingredientes')
        .insert(ingrediente)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
      toast.success('Ingrediente criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar ingrediente: ${error.message}`);
    },
  });
}

export function useUpdateIngrediente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...ingrediente }: Partial<Ingrediente> & { id: number }) => {
      const { data, error } = await supabase
        .from('ingredientes')
        .update(ingrediente)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
      toast.success('Ingrediente atualizado!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
}

export function useDeleteIngrediente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('ingredientes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredientes'] });
      toast.success('Ingrediente excluído!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });
}