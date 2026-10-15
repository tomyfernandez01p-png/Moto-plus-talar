-- YA APLICADA a la base (15/10/2026). Reemplaza los servicios sueltos por los 6 services del flyer oficial.
-- Los servicios anteriores se desactivan (no se borran) para no perder el historial de solicitudes.
update servicios_mecanica set activo=false, updated_at=now() where activo=true;
insert into servicios_mecanica (nombre, descripcion, orden, activo) values
('Service Básico Express', E'Cambio de aceite\nCambio de filtro de aceite\nMantenimiento de transmisión\nRevisión rápida de frenos\nAjuste básico de tornillería', 1, true),
('Service Plus', E'Cambio de aceite\nCambio de filtro de aceite\nTensado y lubricado de cadena', 2, true),
('Service Completo Premium', E'Mantenimiento de transmisión\nCambio de aceite y filtro\nLimpieza / reemplazo de filtro de aire\nVerificación de bujía(s)\nMantenimiento de ambos frenos\nAjuste de tornillería\nLubricación de cables\nRegulación de válvulas', 3, true),
('Service Neumáticos', E'Cambio de cubiertas\nReparación de pinchaduras\nControl de presión\nRevisión de desgaste', 4, true),
('Service Eléctrico', E'Diagnóstico\nRevisión de batería y sistema de carga\nVerificación de estator y regulador\nCambio de lámparas\nRevisión de luces', 5, true),
('Suspensión y Transmisión', E'Revisión y mantenimiento de suspensión\nCambio de transmisión\nAjustes y puesta a punto', 6, true);
