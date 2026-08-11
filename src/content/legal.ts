import type { LocalizedText } from "./services";

/**
 * KVKK / data protection notice.
 *
 * The booking form collects name, email, phone and free-text notes, which under
 * KVKK (Law 6698) makes the practice a data controller with a disclosure duty.
 * This is a working starting point, not legal advice — TODO(doctor): have it
 * reviewed and add the registered data-controller identity before launch.
 */

export type LegalSection = {
  heading: LocalizedText;
  body: LocalizedText[];
};

export const KVKK_TITLE: LocalizedText = {
  tr: "KVKK Aydınlatma Metni",
  en: "Data Protection Notice",
};

export const KVKK_INTRO: LocalizedText = {
  tr: "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, bu web sitesi üzerinden randevu oluşturduğunuzda kişisel verilerinizin nasıl işlendiğini açıklar.",
  en: "This notice explains how your personal data is processed when you book an appointment through this website, under Turkish Law 6698 on the Protection of Personal Data.",
};

export const KVKK_SECTIONS: LegalSection[] = [
  {
    heading: {
      tr: "İşlenen veriler",
      en: "What data is processed",
    },
    body: [
      {
        tr: "Randevu oluştururken yalnızca şu veriler alınır: ad soyad, e-posta adresi, telefon numarası (isteğe bağlı) ve varsa eklemek istediğiniz not.",
        en: "Booking collects only the following: your name, email address, phone number (optional) and any note you choose to add.",
      },
      {
        tr: "Bu site üzerinde sağlık verisi toplanmaz. Lütfen not alanına teşhis, tedavi geçmişi veya diğer sağlık bilgilerinizi yazmayınız; bu bilgiler muayenede sözlü olarak alınır.",
        en: "No health data is collected on this website. Please do not enter diagnoses, treatment history or other health information in the notes field — that is taken verbally during consultation.",
      },
    ],
  },
  {
    heading: {
      tr: "İşleme amacı ve hukuki sebep",
      en: "Purpose and legal basis",
    },
    body: [
      {
        tr: "Verileriniz yalnızca randevunuzun oluşturulması, size onay e-postası gönderilmesi ve randevu değişikliği hâlinde sizinle iletişime geçilmesi amacıyla işlenir.",
        en: "Your data is processed solely to create your appointment, send you a confirmation email, and contact you if the appointment changes.",
      },
      {
        tr: "Hukuki sebep, randevu talebinizin yerine getirilmesi için verinin gerekli olmasıdır. Onayınızı randevu formundaki kutucuk aracılığıyla verirsiniz.",
        en: "The legal basis is that the data is necessary to fulfil your booking request. You give consent via the checkbox on the booking form.",
      },
    ],
  },
  {
    heading: {
      tr: "Aktarım",
      en: "Sharing",
    },
    body: [
      {
        tr: "Verileriniz üçüncü kişilere pazarlama amacıyla aktarılmaz ve satılmaz. Yalnızca hizmetin sağlanabilmesi için kullanılan altyapı sağlayıcıları (veritabanı barındırma ve e-posta gönderimi) verilere teknik olarak erişebilir.",
        en: "Your data is never sold or shared with third parties for marketing. Only the infrastructure providers required to deliver the service — database hosting and email delivery — have technical access.",
      },
    ],
  },
  {
    heading: {
      tr: "Saklama süresi",
      en: "Retention",
    },
    body: [
      {
        tr: "Randevu kayıtları, ilgili mevzuatta öngörülen saklama süreleri boyunca tutulur; bu sürenin sonunda silinir veya anonim hâle getirilir.",
        en: "Appointment records are kept for the retention period required by applicable regulation, after which they are deleted or anonymised.",
      },
    ],
  },
  {
    heading: {
      tr: "Haklarınız",
      en: "Your rights",
    },
    body: [
      {
        tr: "Kanunun 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme ve işlemeye itiraz etme haklarına sahipsiniz.",
        en: "Under Article 11 of the law you have the right to learn whether your data is processed, to request its correction or deletion, and to object to processing.",
      },
      {
        tr: "Randevunuzu, onay e-postanızdaki bağlantı ile hesap açmadan istediğiniz zaman iptal edebilirsiniz. Taleplerinizi iletişim sayfasındaki telefon numarasından iletebilirsiniz.",
        en: "You can cancel your appointment at any time using the link in your confirmation email, without an account. Requests can be made using the phone number on the contact page.",
      },
    ],
  },
];
