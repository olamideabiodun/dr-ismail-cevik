-- =============================================================================
-- seed.sql — services, weekly availability and practice settings.
-- Idempotent: safe to run repeatedly (`supabase db reset` runs it automatically).
--
-- Durations below are CONSULTATION lengths, not operating times. Adjust in the
-- admin dashboard once the doctor confirms his real clinic rhythm.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Practice settings (singleton)
-- -----------------------------------------------------------------------------
insert into public.admin_settings (id, slot_interval_min, min_notice_hours, max_advance_days, timezone)
values (true, 30, 12, 60, 'Europe/Istanbul')
on conflict (id) do update
  set slot_interval_min = excluded.slot_interval_min,
      min_notice_hours  = excluded.min_notice_hours,
      max_advance_days  = excluded.max_advance_days,
      timezone          = excluded.timezone,
      updated_at        = now();

-- -----------------------------------------------------------------------------
-- Services — the definitive menu from design.md §9 (his Instagram highlights)
-- -----------------------------------------------------------------------------
insert into public.services (slug, name_tr, name_en, summary_tr, summary_en, duration_min, buffer_min, active, sort)
values
  ('rinoplasti',
   'Rinoplasti (Burun Estetiği)',
   'Rhinoplasty',
   'Burnun estetik görünümünü ve nefes alma işlevini birlikte ele alan cerrahi planlama.',
   'Surgical planning that treats the appearance of the nose and the way you breathe as one problem.',
   45, 15, true, 10),

  ('piezo-rinoplasti',
   'Piezo (Ultrasonik) Rinoplasti',
   'Piezo (Ultrasonic) Rhinoplasty',
   'Kemik dokusunu ultrasonik cihazla şekillendiren, yumuşak dokuyu koruyan teknik.',
   'Ultrasonic instrumentation shapes the bone while surrounding soft tissue is left intact.',
   45, 15, true, 20),

  ('revizyon-rinoplasti',
   'Revizyon Rinoplasti',
   'Revision Rhinoplasty',
   'Daha önce ameliyat edilmiş burunlarda işlev ve görünüm sorunlarının yeniden ele alınması.',
   'Re-treating function and appearance in a nose that has already been operated on.',
   60, 15, true, 30),

  ('endoskopik-sinus-cerrahisi',
   'Endoskopik Sinüs Cerrahisi',
   'Endoscopic Sinus Surgery',
   'Tekrarlayan sinüzitte, ilaçla geçmeyen tıkanıklığın endoskopik olarak açılması.',
   'Endoscopic clearance of recurrent sinus disease that has not responded to medication.',
   45, 15, true, 40),

  ('nazal-polip',
   'Nazal Polip Tedavisi',
   'Nasal Polyp Treatment',
   'Burun tıkanıklığı ve koku kaybına yol açan poliplerin değerlendirilmesi ve tedavisi.',
   'Assessment and treatment of polyps behind nasal obstruction and loss of smell.',
   30, 10, true, 50),

  ('uyku-apnesi-cerrahisi',
   'Uyku Apnesi Cerrahisi',
   'Sleep Apnoea Surgery',
   'Horlama ve tıkayıcı uyku apnesinde üst solunum yolunun cerrahi olarak değerlendirilmesi.',
   'Surgical assessment of the upper airway in snoring and obstructive sleep apnoea.',
   45, 15, true, 60),

  ('ses-teli-ameliyati',
   'Ses Teli Ameliyatı',
   'Vocal Cord Surgery',
   'Ses kısıklığı, nodül ve polip gibi ses teli sorunlarında mikrocerrahi.',
   'Microsurgery for hoarseness, nodules and other vocal cord lesions.',
   30, 10, true, 70),

  ('kepce-kulak',
   'Kepçe Kulak (Otoplasti)',
   'Otoplasty (Prominent Ear)',
   'Kulak kepçesinin açısını ve kıvrımlarını doğal görünüme yaklaştıran cerrahi.',
   'Surgery that brings the angle and folds of the ear back to a natural position.',
   30, 10, true, 80),

  ('goz-estetigi',
   'Göz Estetiği (Blefaroplasti)',
   'Eyelid Surgery (Blepharoplasty)',
   'Üst ve alt göz kapağında fazla deri ve torbalanmanın giderilmesi.',
   'Removal of excess skin and puffiness from the upper and lower eyelids.',
   30, 10, true, 90),

  ('kas-kaldirma',
   'Kaş Kaldırma',
   'Brow Lift',
   'Kaş konumunun yükseltilmesiyle bakışın yorgun ifadesinin azaltılması.',
   'Raising the brow position to lift a tired-looking upper face.',
   30, 10, true, 100),

  ('botox',
   'Botox',
   'Botulinum Toxin',
   'Mimik çizgilerinde ve terleme tedavisinde uygulanan botulinum toksin.',
   'Botulinum toxin for expression lines and for excessive sweating.',
   20, 10, true, 110),

  ('yuzde-kitle',
   'Yüzde Kitle',
   'Facial Mass',
   'Yüz ve boyun bölgesindeki kitlelerin değerlendirilmesi ve cerrahi tedavisi.',
   'Assessment and surgical treatment of masses in the face and neck.',
   30, 10, true, 120),

  ('cocuk-kbb',
   'Çocuk KBB',
   'Paediatric ENT',
   'Geniz eti, bademcik ve tekrarlayan kulak enfeksiyonlarında çocuk hastalara özel yaklaşım.',
   'Adenoids, tonsils and recurrent ear infection, handled for younger patients.',
   30, 10, true, 130)
on conflict (slug) do update
  set name_tr      = excluded.name_tr,
      name_en      = excluded.name_en,
      summary_tr   = excluded.summary_tr,
      summary_en   = excluded.summary_en,
      duration_min = excluded.duration_min,
      buffer_min   = excluded.buffer_min,
      active       = excluded.active,
      sort         = excluded.sort;

-- -----------------------------------------------------------------------------
-- Weekly availability — TODO: replace with the doctor's real clinic hours.
-- weekday follows EXTRACT(DOW): 0 = Sunday ... 6 = Saturday
-- Monday–Friday morning + afternoon blocks, Saturday morning only.
-- -----------------------------------------------------------------------------
insert into public.availability_rules (weekday, start_time, end_time, active)
select v.weekday, v.start_time, v.end_time, true
from (values
  (1, time '09:00', time '12:30'),
  (1, time '14:00', time '17:30'),
  (2, time '09:00', time '12:30'),
  (2, time '14:00', time '17:30'),
  (3, time '09:00', time '12:30'),
  (3, time '14:00', time '17:30'),
  (4, time '09:00', time '12:30'),
  (4, time '14:00', time '17:30'),
  (5, time '09:00', time '12:30'),
  (5, time '14:00', time '17:30'),
  (6, time '10:00', time '13:00')
) as v(weekday, start_time, end_time)
where not exists (
  select 1 from public.availability_rules r
   where r.weekday = v.weekday
     and r.start_time = v.start_time
     and r.end_time = v.end_time
);

-- -----------------------------------------------------------------------------
-- Example of a one-off closure (kept commented; add real ones from the admin UI):
--
--   insert into public.availability_exceptions (date, is_closed, note)
--   values (date '2026-08-30', true, 'Zafer Bayramı');
--
-- Example of a one-off SHORTENED day (these windows replace the weekly rules):
--
--   insert into public.availability_exceptions (date, is_closed, start_time, end_time, note)
--   values (date '2026-09-04', false, time '09:00', time '11:00', 'Kongre — yarım gün');
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- Admin allow-list — cannot be seeded blindly: the auth user must exist first.
-- After creating the doctor's user in Supabase Dashboard > Authentication > Users:
--
--   insert into public.admins (user_id, email)
--   select id, email from auth.users where email = 'doktor@ornek.com'
--   on conflict (user_id) do nothing;
--
-- See README.md ("Create the admin user") for the full walkthrough.
-- -----------------------------------------------------------------------------
