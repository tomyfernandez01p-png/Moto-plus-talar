-- Datos de referencia reales del negocio (categorías y marcas indicadas en el
-- brief). Esto NO es "producto demo": son las categorías/marcas con las que
-- el admin va a empezar a cargar productos reales desde /admin.

insert into categorias (nombre, slug, orden) values
  ('Aceites y lubricantes', 'aceites-y-lubricantes', 1),
  ('Cubiertas', 'cubiertas', 2),
  ('Kits de transmisión', 'kits-de-transmision', 3),
  ('Espejos', 'espejos', 4),
  ('Accesorios', 'accesorios', 5),
  ('Baterías', 'baterias', 6),
  ('Lámparas', 'lamparas', 7)
on conflict (slug) do nothing;

insert into marcas (nombre, slug, orden) values
  ('Motul', 'motul', 1),
  ('AMA', 'ama', 2),
  ('Castrol', 'castrol', 3),
  ('Yamalube', 'yamalube', 4),
  ('HGO', 'hgo', 5),
  ('DTSI', 'dtsi', 6),
  ('Valvoline', 'valvoline', 7),
  ('Gulf', 'gulf', 8),
  ('WStandard', 'wstandard', 9),
  ('DID', 'did', 10),
  ('Riffel', 'riffel', 11),
  ('Choho', 'choho', 12),
  ('Catiimoto', 'catiimoto', 13),
  ('Nitro', 'nitro', 14),
  ('Pirelli', 'pirelli', 15),
  ('Metzeler', 'metzeler', 16),
  ('Technic', 'technic', 17),
  ('Protork', 'protork', 18),
  ('Wirtz', 'wirtz', 19),
  ('ProTaper', 'protaper', 20),
  ('Yuasa', 'yuasa', 21),
  ('Towo', 'towo', 22),
  ('Kemparts', 'kemparts', 23),
  ('Bosch', 'bosch', 24)
on conflict (nombre) do nothing;
