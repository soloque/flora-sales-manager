
-- Criar bucket para avatares se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatares', true)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas de acesso para o bucket de avatares
CREATE POLICY "Avatar de Usuários são públicos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Usuários podem fazer upload de avatares" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

CREATE POLICY "Usuários podem atualizar seus avatares" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

CREATE POLICY "Usuários podem remover seus avatares" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid() = (storage.foldername(name))[1]::uuid
  );
