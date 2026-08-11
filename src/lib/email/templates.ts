import "server-only";

import { CLINIC, DOCTOR } from "@/lib/constants";
import { formatDateTime } from "@/lib/booking/time";
import type { Locale } from "@/i18n/routing";

/**
 * Transactional email templates.
 *
 * Written as plain strings rather than React Email components on purpose: these
 * are simple, table-free layouts, and every value that reaches the HTML is
 * escaped by hand below. A patient's name and free-text note are untrusted
 * input, and an unescaped `<` in a note would otherwise break the markup — or
 * inject it.
 *
 * Every message ships both an HTML and a plain-text part. Some Turkish mail
 * clients still default to text, and a booking confirmation that arrives blank
 * is worse than no styling at all.
 */

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export type BookingEmailData = {
  patientName: string;
  serviceName: string;
  startsAt: string;
  referenceCode: string;
  manageUrl: string;
  notes?: string | null;
  phone?: string | null;
  locale: Locale;
};

type Copy = {
  subject: string;
  heading: string;
  intro: string;
  labelService: string;
  labelWhen: string;
  labelWhere: string;
  labelReference: string;
  labelPhone: string;
  arriveNote: string;
  manageIntro: string;
  manageCta: string;
  signOff: string;
  disclaimer: string;
};

const COPY: Record<Locale, Copy> = {
  tr: {
    subject: "Randevunuz alındı",
    heading: "Randevunuz alındı",
    intro: "Merhaba {name}, randevunuz aşağıdaki gibi oluşturuldu.",
    labelService: "Tedavi",
    labelWhen: "Tarih ve saat",
    labelWhere: "Klinik",
    labelReference: "Referans kodu",
    labelPhone: "Telefon",
    arriveNote:
      "Randevu saatinden 15 dakika önce klinikte olmanızı rica ederiz.",
    manageIntro:
      "Randevunuzu iptal etmek ya da başka bir saate almak isterseniz:",
    manageCta: "Randevumu yönet",
    signOff: "Görüşmek üzere,",
    disclaimer:
      "Bu e-posta randevu onayı amacıyla gönderilmiştir. İçerik bilgilendirme amaçlıdır ve hekim muayenesinin yerine geçmez.",
  },
  en: {
    subject: "Your appointment is booked",
    heading: "Your appointment is booked",
    intro: "Hello {name}, your appointment has been created as follows.",
    labelService: "Treatment",
    labelWhen: "Date and time",
    labelWhere: "Clinic",
    labelReference: "Reference code",
    labelPhone: "Phone",
    arriveNote:
      "Please arrive at the clinic 15 minutes before your appointment time.",
    manageIntro:
      "If you need to cancel or move your appointment to another time:",
    manageCta: "Manage my appointment",
    signOff: "See you soon,",
    disclaimer:
      "This email was sent to confirm an appointment. Its content is informational and does not replace a medical consultation.",
  },
};

function layout(bodyHtml: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="margin:0;padding:24px;background:#FBFBF9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0E1512;">
    <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E7E9E4;border-radius:20px;overflow:hidden;">
      <div style="height:4px;background:#1F6F5C;"></div>
      <div style="padding:32px;">
        ${bodyHtml}
      </div>
    </div>
  </body>
</html>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #E7E9E4;color:#8A938D;font-size:13px;width:40%;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #E7E9E4;color:#0E1512;font-size:15px;">${value}</td>
  </tr>`;
}

export function bookingConfirmationEmail(data: BookingEmailData) {
  const copy = COPY[data.locale] ?? COPY.tr;
  const when = formatDateTime(data.startsAt, data.locale);
  const intro = copy.intro.replace("{name}", data.patientName);

  const html = layout(`
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#0E1512;">${escapeHtml(copy.heading)}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#48544E;">${escapeHtml(intro)}</p>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${row(copy.labelService, escapeHtml(data.serviceName))}
      ${row(copy.labelWhen, `<strong>${escapeHtml(when)}</strong>`)}
      ${row(copy.labelWhere, `${escapeHtml(CLINIC.name)}<br/>${escapeHtml(CLINIC.addressLocality)} / ${escapeHtml(CLINIC.addressRegion)}`)}
      ${row(copy.labelPhone, `<a href="tel:${escapeHtml(CLINIC.phoneE164)}" style="color:#1F6F5C;text-decoration:none;">${escapeHtml(CLINIC.phoneDisplay)}</a>`)}
      ${row(copy.labelReference, `<strong style="letter-spacing:0.06em;">${escapeHtml(data.referenceCode)}</strong>`)}
    </table>

    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#48544E;">${escapeHtml(copy.arriveNote)}</p>

    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#48544E;">${escapeHtml(copy.manageIntro)}</p>
    <p style="margin:0 0 28px;">
      <a href="${escapeHtml(data.manageUrl)}" style="display:inline-block;background:#1F6F5C;color:#FFFFFF;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px;">${escapeHtml(copy.manageCta)}</a>
    </p>

    <p style="margin:0 0 4px;font-size:14px;color:#48544E;">${escapeHtml(copy.signOff)}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#0E1512;">${escapeHtml(DOCTOR.name)}</p>

    <p style="margin:0;padding-top:20px;border-top:1px solid #E7E9E4;font-size:12px;line-height:1.6;color:#8A938D;">${escapeHtml(copy.disclaimer)}</p>
  `);

  const text = [
    copy.heading,
    "",
    intro,
    "",
    `${copy.labelService}: ${data.serviceName}`,
    `${copy.labelWhen}: ${when}`,
    `${copy.labelWhere}: ${CLINIC.name}, ${CLINIC.addressLocality} / ${CLINIC.addressRegion}`,
    `${copy.labelPhone}: ${CLINIC.phoneDisplay}`,
    `${copy.labelReference}: ${data.referenceCode}`,
    "",
    copy.arriveNote,
    "",
    copy.manageIntro,
    data.manageUrl,
    "",
    copy.signOff,
    DOCTOR.name,
    "",
    copy.disclaimer,
  ].join("\n");

  return { subject: `${copy.subject} — ${data.referenceCode}`, html, text };
}

/**
 * Internal copy for the clinic inbox. Unlike the patient email this one does
 * include the phone number and note, because that is the point of it.
 */
export function internalNotificationEmail(data: BookingEmailData) {
  const when = formatDateTime(data.startsAt, "tr");

  const html = layout(`
    <h1 style="margin:0 0 16px;font-size:20px;color:#0E1512;">Yeni randevu</h1>
    <table style="width:100%;border-collapse:collapse;">
      ${row("Hasta", escapeHtml(data.patientName))}
      ${row("Tedavi", escapeHtml(data.serviceName))}
      ${row("Tarih", `<strong>${escapeHtml(when)}</strong>`)}
      ${row("Telefon", escapeHtml(data.phone || "—"))}
      ${row("Referans", escapeHtml(data.referenceCode))}
      ${row("Not", escapeHtml(data.notes || "—"))}
    </table>
  `);

  const text = [
    "Yeni randevu",
    `Hasta: ${data.patientName}`,
    `Tedavi: ${data.serviceName}`,
    `Tarih: ${when}`,
    `Telefon: ${data.phone || "—"}`,
    `Referans: ${data.referenceCode}`,
    `Not: ${data.notes || "—"}`,
  ].join("\n");

  return {
    subject: `Yeni randevu — ${data.referenceCode} — ${when}`,
    html,
    text,
  };
}
