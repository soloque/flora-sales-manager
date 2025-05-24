
import { supabase } from "@/integrations/supabase/client";
import { Update } from "@/types";

// Map database object to frontend type
const mapDatabaseUpdateToUpdate = (dbUpdate: any): Update => {
  return {
    id: dbUpdate.id,
    title: dbUpdate.title || "",
    content: dbUpdate.content || "",
    images: dbUpdate.images || [],
    createdAt: new Date(dbUpdate.created_at),
    authorId: dbUpdate.author_id || "",
    authorName: dbUpdate.author_name || "",
    isHighlighted: dbUpdate.is_highlighted || false
  };
};

// Get all updates
export const getAllUpdates = async (ownerId: string): Promise<Update[]> => {
  try {
    const { data, error } = await supabase
      .from('updates')
      .select('*')
      .eq('author_id', ownerId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data.map(mapDatabaseUpdateToUpdate);
  } catch (error) {
    console.error("Error fetching updates:", error);
    return [];
  }
};

// Get highlighted updates
export const getHighlightedUpdates = async (ownerId: string): Promise<Update[]> => {
  try {
    const { data, error } = await supabase
      .from('updates')
      .select('*')
      .eq('author_id', ownerId)
      .eq('is_highlighted', true)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data.map(mapDatabaseUpdateToUpdate);
  } catch (error) {
    console.error("Error fetching highlighted updates:", error);
    return [];
  }
};

// Create a new update
export const createUpdate = async (update: Omit<Update, 'id' | 'createdAt'>): Promise<Update | null> => {
  try {
    const { data, error } = await supabase
      .from('updates')
      .insert({
        title: update.title,
        content: update.content,
        images: update.images || [],
        author_id: update.authorId,
        author_name: update.authorName,
        is_highlighted: update.isHighlighted
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return mapDatabaseUpdateToUpdate(data);
  } catch (error) {
    console.error("Error creating update:", error);
    return null;
  }
};

// Update an existing update
export const updateUpdate = async (id: string, update: Partial<Omit<Update, 'id' | 'createdAt'>>): Promise<Update | null> => {
  try {
    const updateData: Record<string, any> = {};
    
    if (update.title !== undefined) updateData.title = update.title;
    if (update.content !== undefined) updateData.content = update.content;
    if (update.images !== undefined) updateData.images = update.images;
    if (update.authorId !== undefined) updateData.author_id = update.authorId;
    if (update.authorName !== undefined) updateData.author_name = update.authorName;
    if (update.isHighlighted !== undefined) updateData.is_highlighted = update.isHighlighted;
    
    const { data, error } = await supabase
      .from('updates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return mapDatabaseUpdateToUpdate(data);
  } catch (error) {
    console.error("Error updating update:", error);
    return null;
  }
};

// Delete an update
export const deleteUpdate = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('updates')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting update:", error);
    return false;
  }
};
