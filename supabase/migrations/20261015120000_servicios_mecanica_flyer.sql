-- YA APLICADA a la base (15/10/2026). Servicios individuales del flyer del taller (las 6 secciones se
-- arman en el formulario). Los servicios anteriores se desactivan, no se borran, para conservar el historial.
-- (Se aplicó con SQL directo; este archivo es solo el registro.)
update servicios_mecanica set activo=false, updated_at=now() where activo=true;
-- luego se insertaron/reactivaron los 25 servicios: ver nombres en src/app/mecanica/MecanicaForm.tsx (SECCIONES)
