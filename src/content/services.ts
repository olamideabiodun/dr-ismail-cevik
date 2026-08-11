import type { Locale } from "@/i18n/routing";

/**
 * Marketing copy for each treatment — design.md §9, adapted from his Instagram
 * highlights and captions.
 *
 * This file is the source of truth for COPY and ORDERING. The `services` table
 * in Supabase is the source of truth for BOOKING (duration, buffer, active).
 * Keeping them apart means the whole marketing site renders statically without
 * a database, and the two are joined only in the booking flow — matched on
 * `slug`, which must stay identical to supabase/seed.sql.
 *
 * Tone is deliberately non-promissory: Turkish medical advertising rules do not
 * permit outcome guarantees, and design.md §10 flags this explicitly.
 */

export type LocalizedText = Record<Locale, string>;
export type LocalizedList = Record<Locale, string[]>;

export type ServiceIcon =
  | "nose"
  | "wave"
  | "sinus"
  | "sleep"
  | "voice"
  | "ear"
  | "eye"
  | "face"
  | "child";

export type ServiceContent = {
  slug: string;
  icon: ServiceIcon;
  featured: boolean;
  name: LocalizedText;
  summary: LocalizedText;
  intro: LocalizedText;
  who: LocalizedList;
  process: LocalizedList;
  recovery: LocalizedText;
  /** Path under /public — see public/assets/README.md */
  image: string;
  imageAlt: LocalizedText;
};

export const SERVICES: ServiceContent[] = [
  {
    slug: "rinoplasti",
    icon: "nose",
    featured: true,
    name: { tr: "Rinoplasti (Burun Estetiği)", en: "Rhinoplasty" },
    summary: {
      tr: "Burnun görünümünü ve nefes alma işlevini tek bir planda ele alan cerrahi.",
      en: "Surgery that treats how the nose looks and how it breathes as one plan.",
    },
    intro: {
      tr: "Rinoplasti, yalnızca burnun dışını değiştiren bir işlem değildir. Burun aynı zamanda solunum yolunun ilk basamağıdır; dışarıdan yapılan her değişiklik içerideki hava akımını da etkiler. Bu yüzden planlama, kemik ve kıkırdak yapısının yanı sıra septum, konkalar ve cilt kalınlığı birlikte değerlendirilerek yapılır.",
      en: "Rhinoplasty is not simply a change to the outside of the nose. The nose is the first step of the airway, and every external change alters the airflow inside it. Planning therefore looks at the septum, the turbinates and skin thickness alongside the bone and cartilage.",
    },
    who: {
      tr: [
        "Burun sırtındaki kemik veya kıkırdak çıkıntıdan rahatsız olanlar",
        "Burun ucu düşüklüğü ya da genişliği tarif edenler",
        "Estetik beklentisinin yanında burun tıkanıklığı da yaşayanlar",
        "Yüz oranlarıyla burun boyutunun uyumsuz olduğunu düşünenler",
      ],
      en: [
        "A bony or cartilaginous hump on the bridge",
        "A drooping or wide nasal tip",
        "Nasal obstruction alongside an aesthetic concern",
        "A nose that sits out of proportion with the rest of the face",
      ],
    },
    process: {
      tr: [
        "Muayenede burun içi endoskopik olarak değerlendirilir, fotoğraf analizi yapılır.",
        "Beklentiler ve anatominin izin verdiği sınırlar açıkça konuşulur.",
        "Ameliyat genel anestezi altında yapılır; süre yaklaşık 2–3 saattir.",
        "Gerekli görülürse septum ve konkalara aynı seansta müdahale edilir.",
      ],
      en: [
        "Endoscopic examination of the inside of the nose, plus photographic analysis.",
        "An open conversation about expectations and what the anatomy allows.",
        "Surgery under general anaesthesia, typically two to three hours.",
        "Septum and turbinates addressed in the same session where indicated.",
      ],
    },
    recovery: {
      tr: "İlk hafta içinde atel çıkarılır. Morluk ve şişlik genellikle 10–14 günde belirgin şekilde azalır. Burnun son hâlini alması aylar sürer; ödemin büyük bölümü 3. ayda çözülür, ince değişiklikler bir yıl boyunca devam edebilir.",
      en: "The splint comes off within the first week. Bruising and swelling settle noticeably over 10–14 days. The final shape takes months: most swelling resolves by the third month, with subtle changes continuing for up to a year.",
    },
    image: "/assets/services/rinoplasti.jpg",
    imageAlt: {
      tr: "Rinoplasti muayenesinde burun analizi",
      en: "Nasal analysis during a rhinoplasty consultation",
    },
  },
  {
    slug: "piezo-rinoplasti",
    icon: "wave",
    featured: true,
    name: {
      tr: "Piezo (Ultrasonik) Rinoplasti",
      en: "Piezo (Ultrasonic) Rhinoplasty",
    },
    summary: {
      tr: "Kemiği ultrasonik titreşimle şekillendiren, yumuşak dokuyu koruyan teknik.",
      en: "Ultrasonic shaping of bone that leaves the surrounding soft tissue intact.",
    },
    intro: {
      tr: "Piezo cihazı, kemik dokusunu ultrasonik titreşimle keser ve inceltir. Klasik keski ve törpüden farkı, damar, sinir ve mukoza gibi yumuşak dokulara etki etmemesidir. Bu seçicilik sayesinde kemik üzerinde daha kontrollü çalışılır.",
      en: "A piezo device cuts and thins bone with ultrasonic vibration. Unlike a chisel and rasp it does not act on soft tissue — vessels, nerves and mucosa are left alone. That selectivity allows more controlled work on the bone.",
    },
    who: {
      tr: [
        "Burun sırtında belirgin kemik çıkıntısı olanlar",
        "Kemik yapısı geniş veya asimetrik olanlar",
        "Daha sınırlı morarma ve şişlik isteyen hastalar",
      ],
      en: [
        "A prominent bony hump on the bridge",
        "A wide or asymmetric bony vault",
        "Patients who want bruising and swelling kept to a minimum",
      ],
    },
    process: {
      tr: [
        "Planlama klasik rinoplasti ile aynıdır; fark kemiğe uygulanan teknikte ortaya çıkar.",
        "Kemik, ultrasonik uçlarla milimetrik olarak şekillendirilir.",
        "Kırık hatları önceden belirlenir; kontrolsüz kırık riski azalır.",
      ],
      en: [
        "Planning is the same as conventional rhinoplasty; the difference is at the bone.",
        "Bone is shaped millimetre by millimetre with ultrasonic tips.",
        "Fracture lines are defined in advance, reducing the risk of an uncontrolled break.",
      ],
    },
    recovery: {
      tr: "Yumuşak doku travması daha sınırlı olduğu için morarma genellikle daha az olur. Bu, iyileşmenin tamamen sorunsuz geçeceği anlamına gelmez; ödem süreci klasik rinoplastiye benzer şekilde aylar sürer.",
      en: "Because soft-tissue trauma is more limited, bruising tends to be less. That does not mean recovery is trouble-free — the swelling timeline still runs over months, much like conventional rhinoplasty.",
    },
    image: "/assets/services/piezo-rinoplasti.jpg",
    imageAlt: {
      tr: "Piezo ultrasonik rinoplasti cihazı",
      en: "Piezo ultrasonic rhinoplasty instrument",
    },
  },
  {
    slug: "revizyon-rinoplasti",
    icon: "nose",
    featured: false,
    name: { tr: "Revizyon Rinoplasti", en: "Revision Rhinoplasty" },
    summary: {
      tr: "Daha önce ameliyat edilmiş burunlarda görünüm ve işlevin yeniden ele alınması.",
      en: "Revisiting appearance and function in a nose that has already been operated on.",
    },
    intro: {
      tr: "Revizyon cerrahisi, ilk ameliyattan farklı bir problemdir. Doku planları skarlıdır, kıkırdak deposu azalmış olabilir ve destek yapıları zayıflamış olabilir. Bu nedenle karar vermeden önce en az bir yıl beklenmesi ve mevcut durumun ayrıntılı değerlendirilmesi gerekir.",
      en: "Revision surgery is a different problem from a first operation. Tissue planes are scarred, cartilage reserves may be depleted and support structures weakened. For that reason it is usual to wait at least a year and to assess the current state in detail before deciding.",
    },
    who: {
      tr: [
        "Önceki ameliyat sonrası nefes almakta zorlananlar",
        "Burun ucunda ya da sırtta düzensizlik tarif edenler",
        "İlk ameliyattan üzerinden en az bir yıl geçmiş olanlar",
      ],
      en: [
        "Difficulty breathing after a previous operation",
        "Irregularity of the tip or bridge",
        "At least a year since the first operation",
      ],
    },
    process: {
      tr: [
        "Önceki ameliyat notları ve varsa görüntüleme incelenir.",
        "Kıkırdak ihtiyacı için kulak veya kaburga kıkırdağı gerekebilir.",
        "Gerçekçi hedefler belirlenir; her düzensizlik tamamen giderilemeyebilir.",
      ],
      en: [
        "Previous operative notes and any imaging are reviewed.",
        "Ear or rib cartilage may be needed to rebuild support.",
        "Goals are set realistically — not every irregularity can be fully corrected.",
      ],
    },
    recovery: {
      tr: "İyileşme genellikle ilk ameliyattan daha uzun sürer ve ödem daha inatçı olabilir. Kontroller daha sık planlanır.",
      en: "Recovery usually takes longer than a first operation and swelling can be more stubborn. Follow-up appointments are scheduled more frequently.",
    },
    image: "/assets/services/revizyon-rinoplasti.jpg",
    imageAlt: {
      tr: "Revizyon rinoplasti değerlendirmesi",
      en: "Revision rhinoplasty assessment",
    },
  },
  {
    slug: "endoskopik-sinus-cerrahisi",
    icon: "sinus",
    featured: true,
    name: { tr: "Endoskopik Sinüs Cerrahisi", en: "Endoscopic Sinus Surgery" },
    summary: {
      tr: "İlaç tedavisine yanıt vermeyen kronik sinüzitte endoskopik açılım.",
      en: "Endoscopic clearance for chronic sinusitis that has not responded to medication.",
    },
    intro: {
      tr: "Kronik sinüzitin ilk tedavisi cerrahi değildir. Burun spreyleri, yıkama ve gerektiğinde antibiyotik ile yeterli sonuç alınamadığında, sinüs ağızlarının endoskopik olarak açılması gündeme gelir. Amaç sinüsü boşaltmak değil, havalanmasını ve doğal drenajını yeniden mümkün kılmaktır.",
      en: "Surgery is not the first treatment for chronic sinusitis. When sprays, rinses and — where appropriate — antibiotics have not been enough, opening the sinus outflow tracts endoscopically becomes an option. The aim is not to empty the sinus but to restore its ventilation and natural drainage.",
    },
    who: {
      tr: [
        "Yılda birkaç kez tekrarlayan sinüzit atağı geçirenler",
        "Yüz ağrısı, geniz akıntısı ve koku kaybı tarif edenler",
        "İlaç tedavisiyle şikâyetleri geçmeyen hastalar",
      ],
      en: [
        "Several sinusitis episodes a year",
        "Facial pain, post-nasal drip or loss of smell",
        "Symptoms that persist despite medical treatment",
      ],
    },
    process: {
      tr: [
        "Endoskopik muayene ve gerekirse paranazal sinüs tomografisi.",
        "Ameliyat burun deliklerinden endoskopla yapılır; dışarıdan kesi yoktur.",
        "Tıkalı sinüs ağızları açılır, varsa polip dokusu temizlenir.",
      ],
      en: [
        "Endoscopic examination and, where needed, a CT scan of the sinuses.",
        "Surgery is performed through the nostrils with an endoscope — no external incision.",
        "Blocked sinus openings are widened and any polyp tissue is removed.",
      ],
    },
    recovery: {
      tr: "İlk günlerde burun tıkanıklığı ve hafif kanama beklenir. Düzenli burun yıkaması iyileşmenin en belirleyici parçasıdır ve haftalarca sürdürülür. Kontroller endoskopik temizlik için önemlidir.",
      en: "Congestion and light bleeding are expected in the first days. Regular saline rinsing is the single most important part of recovery and continues for weeks. Follow-up visits matter for endoscopic cleaning.",
    },
    image: "/assets/services/endoskopik-sinus.jpg",
    imageAlt: {
      tr: "Endoskopik sinüs cerrahisi görüntüsü",
      en: "Endoscopic sinus surgery view",
    },
  },
  {
    slug: "nazal-polip",
    icon: "sinus",
    featured: false,
    name: { tr: "Nazal Polip Tedavisi", en: "Nasal Polyp Treatment" },
    summary: {
      tr: "Burun tıkanıklığı ve koku kaybının arkasındaki poliplerin tedavisi.",
      en: "Treating the polyps behind nasal obstruction and loss of smell.",
    },
    intro: {
      tr: "Nazal polipler, burun ve sinüs mukozasının uzun süreli iltihabı sonucu gelişen iyi huylu, üzüm salkımı görünümünde oluşumlardır. Tek başına ameliyat çoğu zaman yeterli değildir: polip zemininde bir iltihap süreci vardır ve bu süreç ameliyat sonrası da tedavi edilmezse polipler tekrarlayabilir.",
      en: "Nasal polyps are benign, grape-like swellings that develop from long-standing inflammation of the nasal and sinus lining. Surgery alone is often not enough: there is an underlying inflammatory process, and if it is not treated afterwards the polyps can return.",
    },
    who: {
      tr: [
        "Sürekli burun tıkanıklığı ve ağızdan nefes alma",
        "Koku ve tat duyusunda azalma ya da kayıp",
        "Astım veya alerjik rinit eşlik eden hastalar",
      ],
      en: [
        "Persistent nasal blockage and mouth breathing",
        "Reduced or absent sense of smell and taste",
        "Coexisting asthma or allergic rhinitis",
      ],
    },
    process: {
      tr: [
        "Endoskopik muayene ile poliplerin yaygınlığı belirlenir.",
        "Öncelikle burun içi kortikosteroid ve yıkama düzeni kurulur.",
        "Yeterli yanıt alınamazsa endoskopik cerrahi planlanır.",
      ],
      en: [
        "Endoscopic examination establishes how extensive the polyps are.",
        "Topical steroid and a rinsing routine are established first.",
        "If the response is insufficient, endoscopic surgery is planned.",
      ],
    },
    recovery: {
      tr: "Ameliyat sonrası ilaç ve yıkama düzenine uyum, tekrarlama riskini belirleyen en önemli etkendir. Uzun süreli takip gerekir.",
      en: "Sticking to the medication and rinsing routine afterwards is the biggest single factor in the risk of recurrence. Long-term follow-up is needed.",
    },
    image: "/assets/services/nazal-polip.jpg",
    imageAlt: {
      tr: "Nazal polip endoskopik görüntüsü",
      en: "Endoscopic view of nasal polyps",
    },
  },
  {
    slug: "uyku-apnesi-cerrahisi",
    icon: "sleep",
    featured: true,
    name: { tr: "Uyku Apnesi Cerrahisi", en: "Sleep Apnoea Surgery" },
    summary: {
      tr: "Horlama ve tıkayıcı uyku apnesinde üst solunum yolunun değerlendirilmesi.",
      en: "Assessing the upper airway in snoring and obstructive sleep apnoea.",
    },
    intro: {
      tr: "Horlama tek başına bir tanı değildir. Tıkayıcı uyku apnesi, uyku sırasında solunumun tekrar tekrar durmasıdır ve kalp-damar sistemi üzerinde uzun vadeli etkileri vardır. Cerrahi karar, uyku testi sonucu ve tıkanıklığın hangi seviyede olduğu belirlenmeden verilmez.",
      en: "Snoring on its own is not a diagnosis. Obstructive sleep apnoea means breathing repeatedly stops during sleep, and it has long-term cardiovascular consequences. No surgical decision is made before a sleep study and before establishing at which level the obstruction occurs.",
    },
    who: {
      tr: [
        "Yüksek sesle horlayan ve uykuda nefes durması tarif edilen kişiler",
        "Gün içinde aşırı uykululuk ve dikkat dağınıklığı yaşayanlar",
        "CPAP cihazını tolere edemeyen hastalar",
      ],
      en: [
        "Loud snoring with witnessed pauses in breathing",
        "Excessive daytime sleepiness and poor concentration",
        "Patients who cannot tolerate CPAP",
      ],
    },
    process: {
      tr: [
        "Uyku testi (polisomnografi) sonucu değerlendirilir.",
        "Endoskopik muayene ile tıkanıklık seviyesi belirlenir.",
        "Burun, damak veya dil kökü seviyesine yönelik cerrahi planlanır.",
      ],
      en: [
        "The sleep study (polysomnography) is reviewed.",
        "Endoscopic examination identifies the level of obstruction.",
        "Surgery is planned for the nose, palate or tongue base as appropriate.",
      ],
    },
    recovery: {
      tr: "Damak cerrahisi sonrası boğaz ağrısı bir-iki hafta sürebilir. Cerrahi her hastada apneyi tamamen ortadan kaldırmaz; kilo yönetimi ve uyku hijyeni tedavinin ayrılmaz parçasıdır.",
      en: "Throat pain after palate surgery can last a week or two. Surgery does not abolish apnoea in every patient — weight management and sleep hygiene remain part of the treatment.",
    },
    image: "/assets/services/uyku-apnesi.jpg",
    imageAlt: {
      tr: "Uyku apnesi değerlendirmesi",
      en: "Sleep apnoea assessment",
    },
  },
  {
    slug: "ses-teli-ameliyati",
    icon: "voice",
    featured: false,
    name: { tr: "Ses Teli Ameliyatı", en: "Vocal Cord Surgery" },
    summary: {
      tr: "Ses kısıklığı, nodül ve poliplerde mikrocerrahi yaklaşım.",
      en: "A microsurgical approach to hoarseness, nodules and polyps.",
    },
    intro: {
      tr: "İki haftadan uzun süren ses kısıklığı mutlaka değerlendirilmelidir. Ses telleri üzerindeki nodül, polip ve kist gibi oluşumlar mikroskop altında, ses teli dokusu korunarak çıkarılır. Ses terapisi çoğu hastada cerrahinin öncesinde ya da sonrasında gerekir.",
      en: "Hoarseness lasting more than two weeks should always be assessed. Nodules, polyps and cysts on the vocal cords are removed under the microscope while preserving the cord tissue itself. Voice therapy is needed before or after surgery in most patients.",
    },
    who: {
      tr: [
        "İki haftadan uzun süren ses kısıklığı olanlar",
        "Sesini mesleki olarak yoğun kullananlar (öğretmen, avukat, ses sanatçısı)",
        "Konuşurken çabuk yorulan, sesi kesilen kişiler",
      ],
      en: [
        "Hoarseness lasting more than two weeks",
        "Professional voice users — teachers, lawyers, singers",
        "Voice that tires quickly or cuts out during speech",
      ],
    },
    process: {
      tr: [
        "Endoskopik larenks muayenesi ve gerekirse stroboskopi.",
        "Mikrolarengeal cerrahi genel anestezi altında yapılır.",
        "Ameliyat sonrası ses istirahati süresi net olarak belirlenir.",
      ],
      en: [
        "Endoscopic examination of the larynx, with stroboscopy where needed.",
        "Microlaryngeal surgery under general anaesthesia.",
        "A clearly defined period of voice rest afterwards.",
      ],
    },
    recovery: {
      tr: "Ameliyat sonrası birkaç gün tam ses istirahati istenir. Sesin oturması haftalar alabilir; bu sürede ses terapisi önerilebilir.",
      en: "Complete voice rest for a few days after surgery. The voice can take weeks to settle, and voice therapy may be recommended during that time.",
    },
    image: "/assets/services/ses-teli.jpg",
    imageAlt: {
      tr: "Larenks endoskopik muayenesi",
      en: "Endoscopic examination of the larynx",
    },
  },
  {
    slug: "kepce-kulak",
    icon: "ear",
    featured: true,
    name: { tr: "Kepçe Kulak (Otoplasti)", en: "Otoplasty (Prominent Ear)" },
    summary: {
      tr: "Kulak kepçesinin açısını ve kıvrımlarını doğal konuma yaklaştıran cerrahi.",
      en: "Surgery that returns the angle and folds of the ear to a natural position.",
    },
    intro: {
      tr: "Kepçe kulak, kulak kıkırdağındaki kıvrımın yeterince gelişmemesi ya da kulağın başa göre açısının fazla olması sonucu ortaya çıkar. Otoplasti, kıkırdağı yeniden şekillendirerek bu açıyı düzeltir. Çocuklarda kulak gelişimi büyük ölçüde tamamlandıktan sonra, genellikle okul çağında yapılabilir.",
      en: "Prominent ears result from an underdeveloped fold in the ear cartilage or from too wide an angle between ear and head. Otoplasty reshapes the cartilage to correct that angle. In children it can be done once ear growth is largely complete, usually around school age.",
    },
    who: {
      tr: [
        "Kulaklarının başa göre belirgin durduğunu düşünen yetişkinler",
        "Okul çağında bu nedenle rahatsızlık yaşayan çocuklar",
        "Tek taraflı asimetriden rahatsız olanlar",
      ],
      en: [
        "Adults whose ears stand out noticeably from the head",
        "School-age children troubled by it",
        "One-sided asymmetry",
      ],
    },
    process: {
      tr: [
        "Kesi kulak arkasında, saç çizgisinde gizlenir.",
        "Kıkırdak dikişlerle yeniden şekillendirilir.",
        "Yetişkinlerde lokal, çocuklarda genel anestezi tercih edilir.",
      ],
      en: [
        "The incision is hidden behind the ear.",
        "Cartilage is reshaped with sutures.",
        "Local anaesthesia in adults; general anaesthesia in children.",
      ],
    },
    recovery: {
      tr: "İlk hafta baskılı bandaj kullanılır, ardından bir süre gece bandı önerilir. Spor ve temaslı aktivitelere dönüş birkaç hafta sonra planlanır.",
      en: "A pressure dressing for the first week, then a night band for a period. Return to sport and contact activity is planned after a few weeks.",
    },
    image: "/assets/services/kepce-kulak.jpg",
    imageAlt: {
      tr: "Otoplasti öncesi kulak değerlendirmesi",
      en: "Ear assessment before otoplasty",
    },
  },
  {
    slug: "goz-estetigi",
    icon: "eye",
    featured: false,
    name: {
      tr: "Göz Estetiği (Blefaroplasti)",
      en: "Eyelid Surgery (Blepharoplasty)",
    },
    summary: {
      tr: "Göz kapağındaki fazla deri ve torbalanmanın giderilmesi.",
      en: "Removing excess skin and puffiness from the eyelids.",
    },
    intro: {
      tr: "Üst göz kapağındaki deri fazlalığı zamanla görme alanını daraltacak kadar artabilir; alt kapaktaki torbalanma ise yorgun bir ifadeye yol açar. Blefaroplasti bu iki sorunu ayrı ayrı ele alır. Kaş konumu düşükse tek başına kapak cerrahisi yeterli olmayabilir.",
      en: "Excess skin on the upper lid can eventually narrow the field of vision, while puffiness of the lower lid produces a tired look. Blepharoplasty addresses these separately. Where the brow sits low, eyelid surgery alone may not be enough.",
    },
    who: {
      tr: [
        "Üst kapak derisi görüşü kısıtlayacak kadar sarkmış olanlar",
        "Alt kapakta belirgin torbalanma tarif edenler",
        "Sürekli yorgun göründüğü söylenen kişiler",
      ],
      en: [
        "Upper lid skin drooping enough to limit vision",
        "Noticeable lower-lid puffiness",
        "Being told you look permanently tired",
      ],
    },
    process: {
      tr: [
        "Kaş konumu ve kapak açıklığı birlikte değerlendirilir.",
        "Kesi üst kapakta doğal kıvrıma, alt kapakta kirpik altına gizlenir.",
        "Çoğu hastada lokal anestezi yeterlidir.",
      ],
      en: [
        "Brow position and lid opening are assessed together.",
        "Incisions hide in the natural upper-lid crease and below the lower lashes.",
        "Local anaesthesia is sufficient for most patients.",
      ],
    },
    recovery: {
      tr: "Morluk ve şişlik ilk 7–10 günde belirgindir. Dikişler bir hafta içinde alınır. Göz kuruluğu geçici olarak artabilir.",
      en: "Bruising and swelling are noticeable for the first 7–10 days. Sutures come out within a week. Dry eye can temporarily increase.",
    },
    image: "/assets/services/goz-estetigi.jpg",
    imageAlt: {
      tr: "Göz kapağı estetiği değerlendirmesi",
      en: "Eyelid surgery assessment",
    },
  },
  {
    slug: "kas-kaldirma",
    icon: "eye",
    featured: false,
    name: { tr: "Kaş Kaldırma", en: "Brow Lift" },
    summary: {
      tr: "Kaş konumunun yükseltilmesiyle üst yüzün dinlenmiş bir ifadeye kavuşması.",
      en: "Raising the brow to give the upper face a rested expression.",
    },
    intro: {
      tr: "Kaş konumu düştüğünde üst göz kapağı olduğundan daha ağır görünür. Bu durumda yalnızca kapak derisi almak sorunu çözmez, hatta ifadeyi daha da ağırlaştırabilir. Kaş kaldırma, kapak cerrahisiyle birlikte ya da tek başına planlanabilir.",
      en: "When the brow descends, the upper lid looks heavier than it is. Removing lid skin alone does not solve that and can make the expression heavier still. A brow lift can be planned alongside eyelid surgery or on its own.",
    },
    who: {
      tr: [
        "Kaş dış ucu düşük olan ve bakışı yorgun görünen kişiler",
        "Alın çizgileri belirginleşmiş olanlar",
        "Göz kapağı cerrahisi planlanan ve kaş desteği gereken hastalar",
      ],
      en: [
        "A low outer brow and a tired-looking gaze",
        "Pronounced forehead lines",
        "Patients planning eyelid surgery who also need brow support",
      ],
    },
    process: {
      tr: [
        "Kaş yüksekliği ve alın kas hareketleri değerlendirilir.",
        "Tekniğe göre kesi saç çizgisi içine ya da kaş üstüne yerleştirilir.",
        "Bazı hastalarda cerrahi yerine botulinum toksin yeterli olabilir.",
      ],
      en: [
        "Brow height and forehead muscle movement are assessed.",
        "Depending on technique, the incision sits within the hairline or above the brow.",
        "In some patients botulinum toxin is enough without surgery.",
      ],
    },
    recovery: {
      tr: "Şişlik ilk günlerde alına ve göz çevresine yayılabilir. Sosyal hayata dönüş genellikle 7–10 gün içinde mümkündür.",
      en: "Swelling can spread across the forehead and around the eyes in the first days. Most patients return to social life within 7–10 days.",
    },
    image: "/assets/services/kas-kaldirma.jpg",
    imageAlt: {
      tr: "Kaş kaldırma değerlendirmesi",
      en: "Brow lift assessment",
    },
  },
  {
    slug: "botox",
    icon: "face",
    featured: false,
    name: { tr: "Botox", en: "Botulinum Toxin" },
    summary: {
      tr: "Mimik çizgilerinde ve aşırı terlemede botulinum toksin uygulaması.",
      en: "Botulinum toxin for expression lines and excessive sweating.",
    },
    intro: {
      tr: "Botulinum toksin, hedeflenen kasın çalışmasını geçici olarak azaltır. Mimik çizgilerinde etkilidir; derin, mimikten bağımsız çizgilerde tek başına yeterli olmaz. Aşırı terleme (hiperhidroz) tedavisinde de kullanılır.",
      en: "Botulinum toxin temporarily reduces the action of a targeted muscle. It works on expression lines; on deep static lines it is not sufficient alone. It is also used to treat excessive sweating (hyperhidrosis).",
    },
    who: {
      tr: [
        "Alın, kaş arası ve göz çevresi mimik çizgilerinden rahatsız olanlar",
        "Koltuk altı veya avuç içi aşırı terleme yaşayanlar",
        "Diş sıkma kaynaklı çene kası büyümesi olanlar",
      ],
      en: [
        "Expression lines on the forehead, between the brows and around the eyes",
        "Excessive sweating of the underarms or palms",
        "Jaw muscle enlargement from clenching",
      ],
    },
    process: {
      tr: [
        "Uygulama muayenehane koşullarında, birkaç dakika içinde yapılır.",
        "Etki 3–7 gün içinde başlar, iki haftada tam olarak yerleşir.",
        "Sonuç kalıcı değildir; genellikle 4–6 ayda tekrarlanması gerekir.",
      ],
      en: [
        "Administered in the clinic in a few minutes.",
        "The effect begins within 3–7 days and settles fully in two weeks.",
        "It is not permanent — repeat treatment is usually needed every 4–6 months.",
      ],
    },
    recovery: {
      tr: "Günlük hayata hemen dönülür. Uygulama sonrası birkaç saat uzanmamak ve bölgeye masaj yapmamak önerilir.",
      en: "You can return to normal activity immediately. Avoid lying down or massaging the area for a few hours afterwards.",
    },
    image: "/assets/services/botox.jpg",
    imageAlt: {
      tr: "Botulinum toksin uygulaması",
      en: "Botulinum toxin treatment",
    },
  },
  {
    slug: "yuzde-kitle",
    icon: "face",
    featured: false,
    name: { tr: "Yüzde Kitle", en: "Facial Mass" },
    summary: {
      tr: "Yüz ve boyundaki kitlelerin değerlendirilmesi ve cerrahi tedavisi.",
      en: "Assessment and surgical treatment of masses in the face and neck.",
    },
    intro: {
      tr: "Yüz ve boyunda fark edilen her kitle değerlendirilmelidir. Tükürük bezi tümörleri, lenf bezi büyümeleri ve deri altı kistleri farklı yaklaşımlar gerektirir. Öncelik, kitlenin niteliğinin doğru belirlenmesidir.",
      en: "Any mass noticed in the face or neck should be assessed. Salivary gland tumours, enlarged lymph nodes and subcutaneous cysts each need a different approach. The priority is establishing what the mass actually is.",
    },
    who: {
      tr: [
        "Boyunda ya da yüzde yeni fark edilen şişlik olanlar",
        "Büyüyen, sertleşen ya da ağrı veren kitlesi olanlar",
        "Tükürük bezi bölgesinde şişlik tarif edenler",
      ],
      en: [
        "A newly noticed swelling in the neck or face",
        "A mass that is growing, hardening or painful",
        "Swelling over a salivary gland",
      ],
    },
    process: {
      tr: [
        "Muayene, ultrason ve gerekirse ince iğne biyopsisi.",
        "Sonuca göre takip ya da cerrahi çıkarım planlanır.",
        "Çıkarılan doku her durumda patolojik incelemeye gönderilir.",
      ],
      en: [
        "Examination, ultrasound and fine-needle biopsy where indicated.",
        "Depending on results, either follow-up or surgical removal.",
        "Removed tissue always goes for pathological examination.",
      ],
    },
    recovery: {
      tr: "İyileşme kitlenin yerine ve büyüklüğüne göre değişir. Patoloji sonucu genellikle bir hafta içinde çıkar ve birlikte değerlendirilir.",
      en: "Recovery depends on the site and size of the mass. Pathology results usually arrive within a week and are reviewed together.",
    },
    image: "/assets/services/yuzde-kitle.jpg",
    imageAlt: {
      tr: "Baş boyun muayenesi",
      en: "Head and neck examination",
    },
  },
  {
    slug: "cocuk-kbb",
    icon: "child",
    featured: true,
    name: { tr: "Çocuk KBB", en: "Paediatric ENT" },
    summary: {
      tr: "Geniz eti, bademcik ve tekrarlayan kulak enfeksiyonlarında çocuklara özel yaklaşım.",
      en: "Adenoids, tonsils and recurrent ear infections, handled for younger patients.",
    },
    intro: {
      tr: "Çocuklarda ağızdan nefes alma, horlama ve tekrarlayan kulak enfeksiyonları çoğu zaman geniz eti ve bademcik büyüklüğüyle ilişkilidir. Her büyük geniz eti ameliyat gerektirmez; karar, çocuğun uykusu, işitmesi ve büyümesi üzerindeki etkiye göre verilir.",
      en: "In children, mouth breathing, snoring and recurrent ear infections are often linked to enlarged adenoids and tonsils. Not every enlarged adenoid needs surgery: the decision rests on the effect on the child's sleep, hearing and growth.",
    },
    who: {
      tr: [
        "Ağzı açık uyuyan, horlayan çocuklar",
        "Sık tekrarlayan kulak iltihabı geçirenler",
        "İşitme azlığı ya da konuşma gecikmesi fark edilen çocuklar",
      ],
      en: [
        "Children who sleep with an open mouth and snore",
        "Frequently recurring middle-ear infection",
        "Noticed hearing loss or delayed speech",
      ],
    },
    process: {
      tr: [
        "Endoskopik muayene ve işitme testi (odyometri, timpanometri).",
        "Gerekirse geniz eti / bademcik ameliyatı ya da kulak tüpü planlanır.",
        "Ameliyat kararı ailenin de dâhil olduğu bir görüşmede verilir.",
      ],
      en: [
        "Endoscopic examination plus hearing tests (audiometry, tympanometry).",
        "Adenoid/tonsil surgery or ear grommets where indicated.",
        "The decision is made in a conversation that includes the family.",
      ],
    },
    recovery: {
      tr: "Bademcik ameliyatı sonrası boğaz ağrısı yaklaşık bir hafta sürer; bol sıvı ve yumuşak gıda önerilir. Çoğu çocuk 7–10 gün içinde okula döner.",
      en: "Throat pain after tonsil surgery lasts about a week; plenty of fluids and soft food are advised. Most children return to school within 7–10 days.",
    },
    image: "/assets/services/cocuk-kbb.jpg",
    imageAlt: {
      tr: "Çocuk KBB muayenesi",
      en: "Paediatric ENT examination",
    },
  },
];

/**
 * Anatomical area, shown in the card meta row.
 *
 * Derived from the icon rather than stored per service, because the icon
 * already encodes exactly this grouping. It is real, scannable information —
 * a patient looking for "my child's ears" can filter visually — rather than a
 * decorative label invented to fill the row.
 */
export const AREA_LABEL: Record<ServiceIcon, LocalizedText> = {
  nose: { tr: "Burun", en: "Nose" },
  wave: { tr: "Burun", en: "Nose" },
  sinus: { tr: "Sinüs", en: "Sinus" },
  sleep: { tr: "Uyku", en: "Sleep" },
  voice: { tr: "Ses", en: "Voice" },
  ear: { tr: "Kulak", en: "Ear" },
  eye: { tr: "Göz çevresi", en: "Eye area" },
  face: { tr: "Yüz", en: "Face" },
  child: { tr: "Çocuk", en: "Paediatric" },
};

export const FEATURED_SERVICES = SERVICES.filter((s) => s.featured);

export function getService(slug: string): ServiceContent | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function serviceName(service: ServiceContent, locale: Locale): string {
  return service.name[locale] ?? service.name.tr;
}
