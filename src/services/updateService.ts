
import { supabase } from '@/integrations/supabase/client';
import { Update } from '@/types';

// Get all updates
export const getAllUpdates = async (): Promise<Update[]> => {
  const { data, error } = await supabase
    .from('updates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching updates:', error);
    throw error;
  }

  if (!data) return [];

  return data.map((update) => ({
    id: update.id,
    title: update.title,
    content: update.content,
    createdAt: new Date(update.created_at),
    authorId: update.author_id || '',
    authorName: update.author_name || '',
    isHighlighted: update.is_highlighted || false,
    images: update.images || []
  }));
};

// Get recent updates (limit by count)
export const getRecentUpdates = async (count: number = 3): Promise<Update[]> => {
  const { data, error } = await supabase
    .from('updates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(count);

  if (error) {
    console.error('Error fetching recent updates:', error);
    throw error;
  }

  if (!data) return [];

  return data.map((update) => ({
    id: update.id,
    title: update.title,
    content: update.content,
    createdAt: new Date(update.created_at),
    authorId: update.author_id || '',
    authorName: update.author_name || '',
    isHighlighted: update.is_highlighted || false,
    images: update.images || []
  }));
};

// Create a new update
export const createUpdate = async (update: Omit<Update, 'id' | 'createdAt'>): Promise<Update> => {
  const { data, error } = await supabase
    .from('updates')
    .insert([
      {
        title: update.title,
        content: update.content,
        author_id: update.authorId,
        author_name: update.authorName,
        is_highlighted: update.isHighlighted,
        images: update.images || []
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating update:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    createdAt: new Date(data.created_at),
    authorId: data.author_id || '',
    authorName: data.author_name || '',
    isHighlighted: data.is_highlighted || false,
    images: data.images || []
  };
};

// Update an existing update
export const updateExistingUpdate = async (id: string, update: Partial<Omit<Update, 'id' | 'createdAt'>>): Promise<Update> => {
  const updatePayload: Record<string, any> = {};
  
  if (update.title) updatePayload.title = update.title;
  if (update.content) updatePayload.content = update.content;
  if (update.isHighlighted !== undefined) updatePayload.is_highlighted = update.isHighlighted;
  if (update.images) updatePayload.images = update.images;

  const { data, error } = await supabase
    .from('updates')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating update:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    createdAt: new Date(data.created_at),
    authorId: data.author_id || '',
    authorName: data.author_name || '',
    isHighlighted: data.is_highlighted || false,
    images: data.images || []
  };
};

// Delete an update
export const deleteUpdate = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('updates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting update:', error);
    throw error;
  }
};
