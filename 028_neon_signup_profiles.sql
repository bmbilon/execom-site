-- Keep UUID foreign keys and the original new-account profile defaults.
BEGIN;
CREATE FUNCTION portal_auth.create_legacy_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  INSERT INTO auth.users(id,email,aud,role,raw_user_meta_data,raw_app_meta_data,created_at,updated_at)
  VALUES (NEW.id,NEW.email,'authenticated','authenticated',jsonb_build_object('full_name',NEW.name),'{"provider":"email","providers":["email"]}',NEW."createdAt",NEW."updatedAt")
  ON CONFLICT(id) DO NOTHING;
  INSERT INTO public.profiles(id,email,full_name,role,is_execom_staff,is_super_admin)
  VALUES (NEW.id,NEW.email,NEW.name,'owner',false,false)
  ON CONFLICT(id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION portal_auth.create_legacy_profile() FROM PUBLIC;
CREATE TRIGGER create_legacy_profile AFTER INSERT ON portal_auth."user" FOR EACH ROW EXECUTE FUNCTION portal_auth.create_legacy_profile();
COMMIT;
