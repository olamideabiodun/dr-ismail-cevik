import type { Locale } from "@/i18n/routing";
import type { LocalizedText } from "./services";

/**
 * Editorial content that is not a treatment: the About page, the results
 * gallery and patient quotes.
 *
 * Anything the doctor must confirm personally is marked TODO(doctor) rather
 * than invented — see README "Before launch".
 */

/* -------------------------------------------------------------------------- */
/* Practice stats                                                             */
/* -------------------------------------------------------------------------- */

/**
 * ⚠️ The "265+ ameliyat" figure in the original brief does not hold up.
 *
 * Checking instagram.com/drismailcevik directly: the profile reads
 * "265 posts · 7,579 followers". 265 is his POST COUNT, not an operation count.
 * The number was almost certainly transcribed from the wrong line of the
 * profile, and publishing it as a surgical volume would be an unverified
 * clinical claim — exactly the kind Turkish medical advertising rules prohibit.
 *
 * So nothing here is displayed until it is confirmed. The hero renders only
 * stats marked `verified: true`, and ships with none. Flip a flag on once the
 * doctor gives you the real figure; the row reappears on its own.
 */
export type PracticeStat = {
  key: "operations" | "experience" | "satisfaction";
  value: number;
  /** Set to true ONLY once the doctor has confirmed the number. */
  verified: boolean;
};

export const PRACTICE_STATS: PracticeStat[] = [
  // TODO(doctor): real number of operations. 265 was the Instagram post count.
  { key: "operations", value: 265, verified: false },
  // TODO(doctor): years since specialist qualification.
  { key: "experience", value: 10, verified: false },
  // TODO(doctor): needs a real, documented source, or delete this stat.
  { key: "satisfaction", value: 98, verified: false },
];

/**
 * Focus areas exactly as he lists them in his own Instagram bio. Verified
 * first-party content, unlike the numbers above.
 *
 * Note "Yüz germe" (facelift) — he advertises it, but there is no matching
 * entry in src/content/services.ts. See README "Before launch".
 */
export const BIO_FOCUS: LocalizedText[] = [
  { tr: "Rinoplasti (burun estetiği)", en: "Rhinoplasty" },
  { tr: "Endoskopik sinüs cerrahisi", en: "Endoscopic sinus surgery" },
  { tr: "Yüz germe", en: "Facelift" },
  { tr: "Çocuk KBB hastalıkları", en: "Paediatric ENT" },
];

/* -------------------------------------------------------------------------- */
/* About                                                                      */
/* -------------------------------------------------------------------------- */

export type TimelineEntry = {
  year: string;
  label: LocalizedText;
};

/**
 * TODO(doctor): replace these with the real institutions and years. They are
 * placeholders with a deliberately obvious marker so they cannot ship unnoticed.
 */
export const EDUCATION: TimelineEntry[] = [
  {
    year: "TODO",
    label: {
      tr: "Tıp Fakültesi — [üniversite adı]",
      en: "Faculty of Medicine — [university]",
    },
  },
  {
    year: "TODO",
    label: {
      tr: "Kulak Burun Boğaz Hastalıkları İhtisası — [kurum adı]",
      en: "Residency in Otorhinolaryngology — [institution]",
    },
  },
  {
    year: "TODO",
    label: {
      tr: "Rinoplasti ileri eğitim / kurs — [kurum adı]",
      en: "Advanced rhinoplasty training — [institution]",
    },
  },
];

export const MEMBERSHIPS: LocalizedText[] = [
  {
    tr: "Türk Kulak Burun Boğaz ve Baş Boyun Cerrahisi Derneği — TODO(doctor): doğrula",
    en: "Turkish Society of Otorhinolaryngology and Head & Neck Surgery — TODO(doctor): confirm",
  },
  {
    tr: "Rinoloji Derneği — TODO(doctor): doğrula",
    en: "Turkish Rhinologic Society — TODO(doctor): confirm",
  },
];

/* -------------------------------------------------------------------------- */
/* Results gallery — design.md §10                                            */
/* -------------------------------------------------------------------------- */

export type ResultCase = {
  id: string;
  serviceSlug: string;
  beforeImage: string;
  afterImage: string;
  caption: LocalizedText;
  alt: LocalizedText;
};

/**
 * Image files are NOT in the repo — the doctor supplies his own clinical
 * photographs. See public/assets/README.md for the exact filenames expected
 * here and the consent requirements attached to each one.
 */
export const RESULT_CASES: ResultCase[] = [
  {
    id: "case-01",
    serviceSlug: "rinoplasti",
    beforeImage: "/assets/results/case-01-before.jpg",
    afterImage: "/assets/results/case-01-after.jpg",
    caption: {
      tr: "Burun sırtındaki kemik çıkıntının azaltılması ve uç desteğinin güçlendirilmesi. 6. ay.",
      en: "Reduction of the bony hump with reinforced tip support. Six months post-operative.",
    },
    alt: {
      tr: "Rinoplasti öncesi ve sonrası profil karşılaştırması",
      en: "Profile comparison before and after rhinoplasty",
    },
  },
  {
    id: "case-02",
    serviceSlug: "piezo-rinoplasti",
    beforeImage: "/assets/results/case-02-before.jpg",
    afterImage: "/assets/results/case-02-after.jpg",
    caption: {
      tr: "Piezo tekniğiyle kemik çatının daraltılması. 3. ay.",
      en: "Narrowing of the bony vault with the piezo technique. Three months post-operative.",
    },
    alt: {
      tr: "Piezo rinoplasti öncesi ve sonrası önden görünüm",
      en: "Frontal view before and after piezo rhinoplasty",
    },
  },
  {
    id: "case-03",
    serviceSlug: "kepce-kulak",
    beforeImage: "/assets/results/case-03-before.jpg",
    afterImage: "/assets/results/case-03-after.jpg",
    caption: {
      tr: "Otoplasti ile kulak açısının düzeltilmesi. 2. ay.",
      en: "Correction of the ear angle with otoplasty. Two months post-operative.",
    },
    alt: {
      tr: "Kepçe kulak ameliyatı öncesi ve sonrası",
      en: "Before and after otoplasty",
    },
  },
  {
    id: "case-04",
    serviceSlug: "revizyon-rinoplasti",
    beforeImage: "/assets/results/case-04-before.jpg",
    afterImage: "/assets/results/case-04-after.jpg",
    caption: {
      tr: "Revizyon cerrahisiyle burun ucu desteğinin yeniden kurulması. 9. ay.",
      en: "Rebuilding tip support in revision surgery. Nine months post-operative.",
    },
    alt: {
      tr: "Revizyon rinoplasti öncesi ve sonrası profil",
      en: "Profile before and after revision rhinoplasty",
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Testimonials                                                               */
/* -------------------------------------------------------------------------- */

export type Testimonial = {
  id: string;
  /** Initials only — never a full patient name. */
  attribution: string;
  serviceSlug: string;
  quote: LocalizedText;
};

/**
 * TODO(doctor): replace with real, consented patient feedback before launch.
 * These are written as plausible placeholders so the section can be reviewed
 * for layout; publishing invented testimonials would be misleading and is not
 * permitted under Turkish medical advertising rules.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    attribution: "A. K.",
    serviceSlug: "rinoplasti",
    quote: {
      tr: "En çok, ameliyattan önce nelerin değişmeyeceğini de anlatması güven verdi. Sonuç konuştuğumuz şeye benziyordu.",
      en: "What reassured me most was being told what would not change, as well as what would. The result looked like what we discussed.",
    },
  },
  {
    id: "t2",
    attribution: "M. Y.",
    serviceSlug: "endoskopik-sinus-cerrahisi",
    quote: {
      tr: "Yıllardır her kışı antibiyotikle geçiriyordum. Ameliyattan sonra ilk kez bir kışı sorunsuz atlattım.",
      en: "I had spent every winter on antibiotics for years. After surgery I got through a winter without trouble for the first time.",
    },
  },
  {
    id: "t3",
    attribution: "S. D.",
    serviceSlug: "uyku-apnesi-cerrahisi",
    quote: {
      tr: "Uyku testi ve muayene olmadan hiçbir şey söylemedi. Süreç boyunca ne olacağını adım adım biliyordum.",
      en: "He would not say anything before the sleep study and the examination. I knew step by step what would happen throughout.",
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export function pick(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.tr;
}
