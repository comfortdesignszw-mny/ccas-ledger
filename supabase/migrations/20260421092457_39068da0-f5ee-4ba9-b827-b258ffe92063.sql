-- Create storage bucket for church logos
INSERT INTO storage.buckets (id, name, public) VALUES ('church-logos', 'church-logos', true);

-- Public read access
CREATE POLICY "Church logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'church-logos');

-- Admins can upload logos
CREATE POLICY "Admins can upload church logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'church-logos' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update logos
CREATE POLICY "Admins can update church logos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'church-logos' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete logos
CREATE POLICY "Admins can delete church logos"
ON storage.objects FOR DELETE
USING (bucket_id = 'church-logos' AND public.has_role(auth.uid(), 'admin'));