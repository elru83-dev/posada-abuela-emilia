-- Habilitar un usuario como administrador del panel.
-- 1) Supabase > Authentication > Users > Add user (email + contraseña, marcar "Auto Confirm User")
-- 2) Cambiar el email de abajo y correr esto en SQL Editor:
insert into public.admins (user_id)
select id from auth.users where email = 'cambiar@email.com'
on conflict do nothing;
