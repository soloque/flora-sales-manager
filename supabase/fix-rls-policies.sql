
-- Fix RLS policies with proper type casting
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sales" ON public.sales;
CREATE POLICY "Users can view their own sales" ON public.sales
  FOR SELECT USING (
    seller_id::uuid = auth.uid() OR 
    seller_id::uuid IN (
      SELECT tm.seller_id FROM team_members tm WHERE tm.owner_id = auth.uid()
    ) OR
    seller_id::uuid IN (
      SELECT vs.id FROM virtual_sellers vs WHERE vs.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own sales" ON public.sales;
CREATE POLICY "Users can insert their own sales" ON public.sales
  FOR INSERT WITH CHECK (
    seller_id::uuid = auth.uid() OR 
    seller_id::uuid IN (
      SELECT tm.seller_id FROM team_members tm WHERE tm.owner_id = auth.uid()
    ) OR
    seller_id::uuid IN (
      SELECT vs.id FROM virtual_sellers vs WHERE vs.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own sales" ON public.sales;
CREATE POLICY "Users can update their own sales" ON public.sales
  FOR UPDATE USING (
    seller_id::uuid = auth.uid() OR 
    seller_id::uuid IN (
      SELECT tm.seller_id FROM team_members tm WHERE tm.owner_id = auth.uid()
    ) OR
    seller_id::uuid IN (
      SELECT vs.id FROM virtual_sellers vs WHERE vs.owner_id = auth.uid()
    )
  );

-- Add RLS policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Add RLS policies for virtual_sellers table
ALTER TABLE public.virtual_sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage their virtual sellers" ON public.virtual_sellers;
CREATE POLICY "Owners can manage their virtual sellers" ON public.virtual_sellers
  FOR ALL USING (auth.uid() = owner_id);
