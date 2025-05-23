
-- Create function to send team request
CREATE OR REPLACE FUNCTION public.send_team_request(
  seller_id_param UUID,
  seller_name_param TEXT,
  owner_id_param UUID,
  message_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO team_requests (seller_id, seller_name, owner_id, message, status)
  VALUES (seller_id_param, seller_name_param, owner_id_param, message_param, 'pending');
END;
$$;

-- Create function to get team members for an owner
CREATE OR REPLACE FUNCTION public.get_team_members(owner_id_param UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  avatar_url TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.role,
    p.created_at,
    p.avatar_url
  FROM 
    team_members tm
  JOIN 
    profiles p ON tm.seller_id = p.id
  WHERE 
    tm.owner_id = owner_id_param;
END;
$$;

-- Create function to get team requests for an owner
CREATE OR REPLACE FUNCTION public.get_team_requests(owner_id_param UUID)
RETURNS TABLE (
  id UUID,
  seller_id UUID,
  seller_name TEXT,
  seller_email TEXT,
  owner_id UUID,
  message TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tr.id,
    tr.seller_id,
    tr.seller_name,
    p.email AS seller_email,
    tr.owner_id,
    tr.message,
    tr.status,
    tr.created_at
  FROM 
    team_requests tr
  LEFT JOIN 
    profiles p ON tr.seller_id = p.id
  WHERE 
    tr.owner_id = owner_id_param
    AND tr.status = 'pending';
END;
$$;

-- Create function to get owner information for a seller
CREATE OR REPLACE FUNCTION public.get_seller_team(seller_id_param UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  created_at TIMESTAMPTZ,
  avatar_url TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.email,
    p.role,
    p.created_at,
    p.avatar_url
  FROM 
    team_members tm
  JOIN 
    profiles p ON tm.owner_id = p.id
  WHERE 
    tm.seller_id = seller_id_param;
END;
$$;

-- Create function to update team request status
CREATE OR REPLACE FUNCTION public.update_team_request(request_id_param UUID, status_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE team_requests
  SET status = status_param
  WHERE id = request_id_param;
END;
$$;

-- Create function to add a team member
CREATE OR REPLACE FUNCTION public.add_team_member(owner_id_param UUID, seller_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO team_members (owner_id, seller_id)
  VALUES (owner_id_param, seller_id_param)
  ON CONFLICT (owner_id, seller_id) DO NOTHING;
END;
$$;

-- Create function to send a direct message
CREATE OR REPLACE FUNCTION public.send_direct_message(
  sender_id_param UUID,
  sender_name_param TEXT,
  receiver_id_param UUID,
  message_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO direct_messages (sender_id, sender_name, receiver_id, message, read)
  VALUES (sender_id_param, sender_name_param, receiver_id_param, message_param, false);
END;
$$;

-- Create function to get user messages
CREATE OR REPLACE FUNCTION public.get_user_messages(user_id_param UUID)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  sender_name TEXT,
  receiver_id UUID,
  message TEXT,
  read BOOLEAN,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dm.id,
    dm.sender_id,
    dm.sender_name,
    dm.receiver_id,
    dm.message,
    dm.read,
    dm.created_at
  FROM 
    direct_messages dm
  WHERE 
    dm.receiver_id = user_id_param
  ORDER BY 
    dm.created_at DESC;
END;
$$;

-- Create function to mark a message as read
CREATE OR REPLACE FUNCTION public.mark_message_as_read(message_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE direct_messages
  SET read = true
  WHERE id = message_id_param;
END;
$$;
