import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/app/supabaseClient';

export const useRealtimeCategories = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('b-categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'b_categories',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['b-categories'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}; 