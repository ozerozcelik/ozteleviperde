export type PageEditorSection = {
  key?: string
  type: 'text' | 'image' | 'cta' | 'features' | 'gallery'
  title?: string
  content?: string
  image?: string
  items?: string[]
  link?: string
  linkText?: string
}

export type PageEditorPreset = {
  slug: string
  source: string
  description: string
  title: string
  seoTitle: string
  seoDescription: string
  heroTitle: string
  heroSubtitle: string
  heroImage: string
  heroCtaText: string
  heroCtaLink: string
  htmlContent: string
  schemaJson: string
  sections: PageEditorSection[]
}

function createPreset(preset: PageEditorPreset): PageEditorPreset {
  return preset
}

const PAGE_EDITOR_PRESETS: Record<string, PageEditorPreset> = {
  'site-ayarlari': createPreset({
    slug: 'site-ayarlari',
    source: 'Merkezi site ayarlari',
    description:
      'Bu admin-ozel sayfa; iletisim bilgileri, sosyal medya linkleri, calisma saatleri ve yasal linkler gibi tum sitede tekrar eden ayarlari yonetmek icin kullanilir.',
    title: 'Genel Site Ayarlari',
    seoTitle: '',
    seoDescription: '',
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    heroCtaText: '',
    heroCtaLink: '',
    htmlContent: '',
    schemaJson: '',
    sections: [
      {
        key: 'contact-details',
        type: 'features',
        title: 'Iletisim Bilgileri',
        content: 'Tum sayfalardaki telefon, e-posta, adres ve WhatsApp cagrilari bu veriyi kullanir.',
        items: [
          'E-posta - info@oztelevi.com',
          'Telefon - +90 (212) 555 0123',
          'Adres - Teşvikiye Mah., Bağdar Caddesi No:42, Şişli, İstanbul',
        ],
      },
      {
        key: 'social-links',
        type: 'features',
        title: 'Sosyal Medya Linkleri',
        content: 'Footer, JSON-LD ve sosyal butonlarda gorunen baglantilar.',
        items: [
          'Instagram - https://instagram.com/oztelevi',
          'Facebook - https://facebook.com/oztelevi',
          'Pinterest - https://pinterest.com/oztelevi',
          'YouTube - https://youtube.com/@oztelevi',
        ],
      },
      {
        key: 'business-hours',
        type: 'features',
        title: 'Calisma Saatleri',
        content: 'Structured data ve SSS fallback metinlerinde kullanilir.',
        items: [
          'Hafta Ici Acilis - 09:00',
          'Hafta Ici Kapanis - 18:00',
          'Cumartesi Acilis - 10:00',
          'Cumartesi Kapanis - 16:00',
        ],
      },
      {
        key: 'legal-links',
        type: 'features',
        title: 'Yasal Linkler',
        content: 'Footer ve uyelik formlarinda kullanilan baglantilar.',
        items: [
          'Gizlilik - #',
          'Kullanim Sartlari - #',
          'Cerezler - #',
        ],
      },
    ],
  }),
  anasayfa: createPreset({
    slug: 'anasayfa',
    source: 'Kod tabanli canli anasayfa',
    description:
      'Bu referans, su anda sitede yayinlanan kodlanmis anasayfadan cikarildi. Bos alanlar bu icerikle doldurulur; dilersen ayni icerigi tek tikla editor formuna da aktarabilirsin.',
    title: 'Ana Sayfa',
    seoTitle: 'ÖzTelevi - Ev Tekstili ve Perdeleri | Işığın Huzurla Buluştuğu Yer',
    seoDescription:
      'Japon estetiğinin sade güzelliği ve İskandinav sadeliğinden ilham alan, el işçiliği tekstiller ve perdeler. Keten perdeler, organik pamuk tekstiller, yatak örtüleri ve özel tasarım çözümler.',
    heroTitle: 'Işığın Huzurla\nBuluştuğu Yer',
    heroSubtitle:
      'Japon estetiğinin sade güzelliği ve İskandinav sadeliğinden ilham alan, el işçiliği tekstiller ve perdeler. Her parça, yaşam alanınıza huzur, doğal ışık ve zamansız bir zarafet davetiyesidir.',
    heroImage: '/images/hero.png',
    heroCtaText: 'Koleksiyonu Keşfet',
    heroCtaLink: '#koleksiyon',
    htmlContent: '',
    schemaJson: '',
    sections: [
      {
        key: 'visualizer',
        type: 'cta',
        title: 'Perde Seçim Asistanı',
        content:
          'Kısa bir yönlendirme akışıyla mekanınıza en uygun perde yaklaşımını bulun. Işık, mahremiyet ve stil dengesini daha hızlı netleştirin.',
        link: '/visualizer',
        linkText: 'Asistanı Aç',
      },
      {
        key: 'philosophy',
        type: 'features',
        title: 'Daha az, ama anlamlı daha iyi',
        content:
          'Komorebi kavramindan ilham alarak, evleri siginaga donusturen tekstiller olusturuyoruz.',
        items: [
          'Sadelik - Gereksiz olandan arınır, sadece huzur ve mutluluk getireni bırakırız.',
          'Doğal Malzemeler - Keten, organik pamuk ve sürdürülebilir lifler temel malzemelerimizdir.',
          'Zamansız Tasarım - Trendlerden bagimsiz, uzun omurlu mekanlar icin uretiyoruz.',
          'Farkında Yaşam - Yavaslamak ve gunluk anlarin guzelligini hissetmek icin uretiriz.',
        ],
      },
      {
        key: 'collection',
        type: 'text',
        title: 'Farkında yaşama uygun tasarım',
        content:
          'Koleksiyonumuzdaki her parça, yaşam alanlarınıza uyum, sıcaklık ve doğal güzellik getirmek için tasarlanmıştır. Ana sayfada bu alan dinamik ürün kartları ile gösterilir.',
      },
      {
        key: 'craftsmanship',
        type: 'features',
        title: 'Niyetle üretildi',
        content:
          'Her OzTelevi tekstilinin arkasinda ozveri, hassasiyet ve zanaata derin saygi hikayesi yatar.',
        items: [
          'Usta Ortaklar - Japonya ve İskandinavya ilhamli zanaatkarlarla calisiyoruz.',
          'Zamanin Test Ettigi Teknikler - Geleneksel dokuma yontemleriyle dayaniklilik sagliyoruz.',
          'Sürdürülebilir Kaynak - Etik kaynakli, izlenebilir malzemeler kullaniyoruz.',
          'Kalite Güvencesi - Her urun titiz kalite kontrol surecinden gecer.',
        ],
      },
      {
        key: 'living-spaces',
        type: 'gallery',
        title: 'Sığınağınızı dönüştürün',
        content:
          'OzTelevi tekstillerinin huzur ve baglanti ilham eden, isik dolu mekanlar nasil yarattigini gorun.',
        items: ['/images/hero.png', '/images/scene-bedroom.png'],
      },
      {
        key: 'signature-quote',
        type: 'text',
        title:
          'Işığın bir mekan boyunca hareket etme biçimi, orada nasıl hissettiğimizi tanımlar. Perdelerimiz bu ilişkiye saygı duymak için tasarlandı.',
        content: 'Ayşe Özdemir | Kurucu',
      },
      {
        key: 'testimonials',
        type: 'features',
        title: 'Huzur hikayeleri',
        content:
          'Ziyaretçi yorumları. Her satir su formatta olmali: Isim | Sehir | Yorum',
        items: [
          'Selin A. | İstanbul | Bu perdeler ev ofisimi huzurlu bir sığınağa dönüştürdü. Kalite mükemmel ve ışığı süzme şekli basitçe güzel.',
          'Mehmet K. | Ankara | Bu kadar yumuşak ve nefes alabilen bir yatak örtüsüyle hiç karşılaşmamıştım. Bulutun üzerinde uyumak gibi. Doğal renkler minimalist estetiğimle mükemmel uyum sağlıyor.',
          'Elif Y. | İzmir | ÖzTelevi’den her parça niyetli hissettiriyor. İşçilik her ayrıntıda belli. Bu, ev için yavaş moda.',
        ],
      },
      {
        key: 'contact-cta',
        type: 'cta',
        title: 'Huzur mekanınızı yaratın',
        content:
          'Keten, dokuma ve özel ölçü perde çözümleri için bizimle iletişime geçin.',
        items: [
          'info@oztelevi.com',
          '+90 (212) 555 0123',
          'Teşvikiye Mah., Bağdar Caddesi No:42, Şişli, İstanbul',
        ],
        link: '#iletisim',
        linkText: 'Yolculuğunuza Başlayın',
      },
      {
        key: 'footer-collection-links',
        type: 'features',
        title: 'Footer Koleksiyon Linkleri',
        content: 'Her satir su formatta olmali: Etiket | Link',
        items: [
          'Perdeler | /galeri',
          'Yatak Örtüleri | /galeri',
          'Atkılar | /galeri',
          'Minderler | /galeri',
        ],
      },
      {
        key: 'footer-company-links',
        type: 'features',
        title: 'Footer Şirket Linkleri',
        content: 'Her satir su formatta olmali: Etiket | Link',
        items: [
          'Hikayemiz | /hakkimizda',
          'Ustalarımız | /hakkimizda',
          'Sürdürülebilirlik | /hakkimizda',
          'Basın | /blog',
        ],
      },
      {
        key: 'footer-support-links',
        type: 'features',
        title: 'Footer Destek Linkleri',
        content: 'Her satir su formatta olmali: Etiket | Link',
        items: [
          'İletişim | /#iletisim',
          'SSS | /sikca-sorulan-sorular',
          'Kargo | /sikca-sorulan-sorular',
          'İadeler | /sikca-sorulan-sorular',
        ],
      },
    ],
  }),
  galeri: createPreset({
    slug: 'galeri',
    source: 'Kod tabanli canli galeri sayfasi',
    description:
      'Bu referans, su anda kullanicinin gordugu galeri sayfasindaki statik basliklar, kategoriler ve ornek gorsellerden olusturuldu.',
    title: 'Galeri',
    seoTitle: 'ÖzTelevi Galeri | İlham Veren Yaşam Alanları',
    seoDescription:
      'ÖzTelevi galerisinde perde, tekstil ve yaşam alanı uygulamalarını keşfedin. İlham veren mekanlar ve seçkin ürün görselleri burada.',
    heroTitle: 'Galeri',
    heroSubtitle: 'Yaşam alanlarınızı ilham verin',
    heroImage: '/images/hero.png',
    heroCtaText: 'Koleksiyonları Gör',
    heroCtaLink: '/koleksiyonlar',
    htmlContent: '',
    schemaJson: '',
    sections: [
      {
        key: 'gallery-categories',
        type: 'features',
        title: 'Galeri Kategorileri',
        content: 'Mevcut galeride filtre sekmeleriyle dolaşılabilen ana kategoriler.',
        items: ['Perdeler', 'Tekstiller', 'Yatak Odası', 'Aksesuarlar'],
      },
      {
        key: 'gallery-showcase',
        type: 'gallery',
        title: 'Örnek Görseller',
        content: 'Canlı galeride ürünlerden ve fallback görsellerden oluşan bir grid gösterilir.',
        items: [
          '/images/hero.png',
          '/images/product-curtain.png',
          '/images/product-textile.png',
          '/images/scene-bedroom.png',
        ],
      },
      {
        key: 'gallery-notes',
        type: 'text',
        title: 'Dinamik Galeri Akışı',
        content:
          'Bu sayfa normalde ürün verisini API üzerinden çeker, stok ve sepete ekleme aksiyonlarını galeri kartları içinde gösterir. Admin yayını alındığında bu yapı ManagedPage bloklarına dönüşür.',
      },
      {
        key: 'gallery-cta',
        type: 'cta',
        title: 'Mekanınız için uygun ürünü bulun',
        content: 'Özel ölçü, kumaş ve uygulama seçenekleri için koleksiyonları inceleyin veya bizimle iletişime geçin.',
        link: '/#iletisim',
        linkText: 'Bize Ulaşın',
      },
    ],
  }),
  hakkimizda: createPreset({
    slug: 'hakkimizda',
    source: 'Kod tabanli canli hakkimizda sayfasi',
    description:
      'Bu referans, mevcut hakkimizda sayfasindaki hikaye, degerler, ekip ve CTA bolumlerinden cikarildi.',
    title: 'Hakkımızda',
    seoTitle: 'ÖzTelevi Hakkımızda | Hikayemiz, Değerlerimiz ve Ekibimiz',
    seoDescription:
      'ÖzTelevi’nin hikayesini, değerlerini, ekibini ve Japandi estetiğine yaklaşımını keşfedin.',
    heroTitle: 'Işığın Huzurla Buluştuğu Yer',
    heroSubtitle:
      '1998 yılından bu yana, evleri sığınağa dönüştüren tekstiller yaratıyoruz. Japon estetiğinin sade güzelliği ve İskandinav sadeliğinden ilham alarak, yaşam alanlarınıza huzur, doğal ışık ve zamansız bir zarafet davetiyesidir.',
    heroImage: '/images/hero.png',
    heroCtaText: 'Bize Ulaşın',
    heroCtaLink: '/#iletisim',
    htmlContent: '',
    schemaJson: '',
    sections: [
      {
        key: 'about-story',
        type: 'features',
        title: 'Bir tutku hikayesi',
        content:
          'ÖzTelevi, 1998 yılında Ayşe Özdemir’in tekstil sanatına olan tutkusundan doğdu. Wabi-sabi felsefesi ile İskandinav minimalizmini birleştirerek küçük bir atölyeden Türkiye’nin önde gelen ev tekstili markalarından birine dönüştü.',
        image: '/images/scene-bedroom.png',
        items: [
          'İlk atölyemiz, İstanbul’un kalbinde, Teşvikiye’de küçük bir bodrum katında açıldı. El dokuması perdelerimiz ve organik tekstillerimiz, kısa sürede sadelik ve kalite arayan müşterilerimizin beğenisini kazandı.',
          'Bugün, üç kuşaktır süren zanaat geleneğimizi modern tasarım anlayışıyla birleştirerek, Türkiye’nin önde gelen ev tekstili markalarından biri olarak yolculuğumuza devam ediyoruz.',
        ],
      },
      {
        key: 'about-mission-vision',
        type: 'features',
        title: 'Misyon ve Vizyon',
        content: 'Markanın bugünkü yaklaşımını tanımlayan iki temel eksen.',
        items: [
          'Misyonumuz - Doğal malzemelerden üretilmiş, el işçiliği tekstiller ve perdelerle yaşam alanlarına huzur, sıcaklık ve zamansız güzellik katmak.',
          'Vizyonumuz - Türkiye’nin en güvenilen ve sürdürülebilir ev tekstili markası olmak; Japandi estetiğini daha fazla yaşam alanına taşımak.',
        ],
      },
      {
        key: 'about-values',
        type: 'features',
        title: 'Değerlerimiz',
        content: 'Hakkımızda sayfasında kartlar halinde gösterilen marka değerleri.',
        items: [
          'Sadakat - Kaliteye ve müşteri memnuniyetine olan sarsılmaz bağlılık.',
          'Sürdürülebilirlik - Doğaya saygı, çevre dostu üretim ve etik kaynak kullanımı.',
          'Tutku - Her dokunuşta hissedilen zanaata olan derin sevgi.',
          'Dürüstlük - Şeffaflık ve güven üzerine kurulu ilişkiler.',
        ],
      },
      {
        key: 'about-team',
        type: 'features',
        title: 'Ekibimiz',
        content: 'Her biri alanında uzman, zanaata ve kaliteye adamış ekibimizle tanışın.',
        items: [
          'Ayşe Özdemir | Kurucu & Kreatif Direktör | 20 yılı aşkın tekstil deneyimiyle Japandi felsefesini Türkiye’ye taşıyor. | /images/hero.png',
          'Mehmet Kaya | Üretim Direktörü | El dokuma tekniklerinde uzman, sürdürülebilir üretimin mimarı. | /images/product-curtain.png',
          'Elif Yılmaz | Tasarım Lideri | İskandinav ve Japon estetiğini buluşturan tasarımlar yaratıyor. | /images/product-textile.png',
          'Can Demir | Müşteri Deneyimi | Her müşterinin hikayesini anlayan, kişisel çözümler sunuyor. | /images/scene-bedroom.png',
        ],
      },
      {
        key: 'about-quote',
        type: 'cta',
        title:
          'Işığın bir mekan boyunca hareket etme biçimi, orada nasıl hissettiğimizi tanımlar. Perdelerimiz bu ilişkiye saygı duymak için tasarlandı.',
        content: 'Ayşe Özdemir | Kurucu',
        image: '/images/hero.png',
      },
      {
        key: 'about-cta',
        type: 'cta',
        title: 'Hikayemizin bir parçası olun',
        content:
          'Showroom’umuzu ziyaret edin, koleksiyonumuzu keşfedin ve yaşam alanınızı dönüştürmeye başlayın.',
        link: '/koleksiyonlar',
        linkText: 'Koleksiyonları Gör',
      },
    ],
  }),
  koleksiyonlar: createPreset({
    slug: 'koleksiyonlar',
    source: 'Kod tabanli canli koleksiyonlar sayfasi',
    description:
      'Bu referans, mevcut koleksiyonlar sayfasindaki hero, one cikan koleksiyonlar, diger koleksiyonlar ve CTA alanlarindan olusturuldu.',
    title: 'Koleksiyonlar',
    seoTitle: 'ÖzTelevi Koleksiyonlar | Zamansız Tasarımlar',
    seoDescription:
      'ÖzTelevi koleksiyonlarını keşfedin. Japandi estetiğiyle tasarlanmış perde, tekstil ve yatak odası ürünleri tek bir sayfada.',
    heroTitle: 'Zamansız tasarımlar',
    heroSubtitle:
      'Her koleksiyonumuz, yaşam alanlarınıza huzur ve zarafet katmak için özenle tasarlanmıştır. Japandi estetiğinin en güzel örneklerini keşfedin.',
    heroImage: '/images/hero.png',
    heroCtaText: 'Teklif Alın',
    heroCtaLink: '/#iletisim',
    htmlContent: '',
    schemaJson: '',
    sections: [
      {
        key: 'collections-featured',
        type: 'features',
        title: 'Seçkin koleksiyonlar',
        content: 'Canlı sayfada öne çıkan olarak listelenen koleksiyonlar.',
        items: ['Aira Koleksiyonu', 'Moku Serisi', 'Sora Paneller'],
      },
      {
        key: 'collections-all',
        type: 'features',
        title: 'Diğer koleksiyonlar',
        content: 'Canlı sayfada öne çıkanlar dışında kalan koleksiyonlar.',
        items: ['Nami Yatak Odası', 'Kumo Tekstiller', 'Yuki Kış Koleksiyonu'],
      },
      {
        key: 'collections-gallery',
        type: 'gallery',
        title: 'Koleksiyon Görselleri',
        content: 'Fallback koleksiyonlardan gelen örnek ürün görselleri.',
        items: [
          '/images/hero.png',
          '/images/product-textile.png',
          '/images/product-curtain.png',
          '/images/scene-bedroom.png',
        ],
      },
      {
        key: 'collections-cta',
        type: 'cta',
        title: 'Özel tasarım mı arıyorsunuz?',
        content: 'Özel ölçü ve tasarım talepleriniz için uzman ekibimizle görüşün. Size özel çözümler üretelim.',
        link: '/#iletisim',
        linkText: 'Teklif Alın',
      },
    ],
  }),
  'sikca-sorulan-sorular': createPreset({
    slug: 'sikca-sorulan-sorular',
    source: 'Kod tabanli canli SSS sayfasi',
    description:
      'Bu referans, destek hero alani, kategori sekmeleri, akordiyon soru yapisi ve iletisim CTA bolumlerinden olusturuldu.',
    title: 'Sıkça Sorulan Sorular',
    seoTitle: 'ÖzTelevi SSS | Sıkça Sorulan Sorular',
    seoDescription:
      'Sipariş, teslimat, ürün, iade ve showroom süreçleriyle ilgili en sık sorulan soruların yanıtlarını bulun.',
    heroTitle: 'Sıkça Sorulan Sorular',
    heroSubtitle:
      'Merak ettiğiniz soruların cevaplarını burada bulabilirsiniz. Başka sorularınız için bizimle iletişime geçmekten çekinmeyin.',
    heroImage: '/images/hero.png',
    heroCtaText: 'Bize Ulaşın',
    heroCtaLink: '/#iletisim',
    htmlContent: '',
    schemaJson: '',
    sections: [
      {
        key: 'faq-categories',
        type: 'features',
        title: 'SSS Kategorileri',
        content: 'Canlı sayfada soru filtresi olarak kullanılan ana destek kategorileri.',
        items: ['Genel', 'Ürünler', 'Sipariş', 'Teslimat', 'İade'],
      },
      {
        key: 'faq-sample-questions',
        type: 'features',
        title: 'Örnek Sorular',
        content: 'Fallback veri içinde görünen soru-cevap çiftleri.',
        items: [
          '{"question":"Ürünleriniz hangi malzemelerden üretilmektedir?","answer":"Tüm ürünlerimiz %100 doğal malzemelerden üretilmektedir. Keten, organik pamuk, bambu ve sürdürülebilir lifler koleksiyonumuzun temelini oluşturur. Her malzeme etik kaynaklıdır ve çevre dostu üretim süreçleri kullanılır.","category":"urunler"}',
          '{"question":"Perde ölçüsü nasıl alınır?","answer":"Perde ölçüsü alırken, pencere genişliğine 20-30 cm eklemenizi öneririz. Yükseklik için tavan veya tavan süsünden zemine kadar ölçüm yapın. Ücretsiz ölçü hizmetimiz için bizimle iletişime geçebilirsiniz.","category":"urunler"}',
          '{"question":"Siparişimi nasıl verebilirim?","answer":"Web sitemiz üzerinden, telefonla veya showroomlarımızda sipariş verebilirsiniz. Özel ölçü ve tasarım talepleriniz için uzman ekibimizle görüşmenizi öneririz.","category":"siparis"}',
          '{"question":"Teslimat süresi ne kadardır?","answer":"Standart ürünler için 3-5 iş günü, özel ölçü perdeler için 2-4 hafta teslimat süresi bulunmaktadır. İstanbul içi ücretsiz montaj hizmeti sunuyoruz.","category":"teslimat"}',
        ],
      },
      {
        key: 'faq-layout-note',
        type: 'text',
        title: 'Akordiyon Yapısı',
        content:
          'Canlı sayfada sorular akordiyon olarak açılıp kapanır. Admin üzerinden yayına alınan içerik ManagedPage blok düzenine geçer; bu referans mevcut davranışı hatırlatmak için burada tutulur.',
      },
      {
        key: 'faq-cta',
        type: 'cta',
        title: 'Sorunuzun cevabını bulamadınız mı?',
        content: 'Ekibimiz sorularınızı yanıtlamaktan mutluluk duyar.',
        link: '/#iletisim',
        linkText: 'Bize Ulaşın',
      },
    ],
  }),
  visualizer: createPreset({
    slug: 'visualizer',
    source: 'Kod tabanli canli perde secim asistani sayfasi',
    description:
      'Bu referans, perde secim asistani deneyimindeki hero, karar adimlari ve teklif CTA bolumlerinden cikarildi.',
    title: 'Perde Seçim Asistanı',
    seoTitle: 'ÖzTelevi Perde Seçim Asistanı | Doğru Perdeyi Bulun',
    seoDescription:
      'Oda tipi, ışık ihtiyacı ve mahremiyet tercihlerinize göre size en uygun perde yönünü belirleyin.',
    heroTitle: 'Perde Seçim Asistanı',
    heroSubtitle:
      'Birkaç kısa seçimle mekanınıza en uygun perde yaklaşımını bulun. Kumaş, mahremiyet ve ışık kontrolü için net bir başlangıç önerisi alın.',
    heroImage: '/images/scene-bedroom.png',
    heroCtaText: 'Akıllı Yönlendirme',
    heroCtaLink: '/#iletisim',
    htmlContent: '',
    schemaJson: '',
    sections: [
      {
        type: 'features',
        key: 'visualizer-steps',
        title: 'Nasıl Çalışır?',
        content: 'Asistanın karar akışı üç kısa adım halinde sunulur.',
        items: [
          '1. Mekan Tipi - Mekanınızı seçin ve kullanım bağlamını belirleyin.',
          '2. Işık ve Mahremiyet - Gün ışığı ve görünürlük beklentinizi seçin.',
          '3. Stil Yönü - Size uygun perde yaklaşımı ve teklif yönlendirmesi alın.',
        ],
      },
      {
        key: 'visualizer-cta',
        type: 'cta',
        title: 'Uzmanlarımızla Netleştirin',
        content:
          'Asistan size başlangıç yönü verir. Ölçü, kumaş ve katman kararını birlikte netleştirmek için ekibimizle iletişime geçin.',
        link: '#teklif-formu',
        linkText: 'Teklif Al',
      },
    ],
  }),
  giris: createPreset({
    slug: 'giris',
    source: 'Kod tabanli canli giris sayfasi',
    description:
      'Bu referans, mevcut giris ve kayit ekranindaki karsilama mesaji, form sekmeleri ve ana yonlendirmelerden olusturuldu.',
    title: 'Giriş',
    seoTitle: 'ÖzTelevi Giriş | Hesabınıza Giriş Yapın',
    seoDescription:
      'ÖzTelevi hesabınıza giriş yapın veya yeni hesap oluşturun. Siparişlerinizi, favorilerinizi ve teklif taleplerinizi yönetin.',
    heroTitle: 'Hoş Geldiniz',
    heroSubtitle: 'Hesabınıza giriş yapın veya ÖzTelevi ailesine katılın.',
    heroImage: '/images/hero.png',
    heroCtaText: 'Ana Sayfaya Dön',
    heroCtaLink: '/',
    htmlContent: '',
    schemaJson: '',
    sections: [
      {
        key: 'login-brand-message',
        type: 'text',
        title: 'Karşılama Mesajı',
        content:
          'ÖzTelevi ailesine katılın ve yaşam alanlarınıza huzur getiren özel koleksiyonlardan haberdar olun.',
      },
      {
        key: 'login-tabs',
        type: 'features',
        title: 'Form Sekmeleri',
        content: 'Canlı sayfada sekmeler ile iki farklı akış gösterilir.',
        items: ['Giriş Yap - Mevcut hesabınıza erişin', 'Kayıt Ol - Yeni kullanıcı hesabı oluşturun'],
      },
      {
        key: 'login-note',
        type: 'text',
        title: 'Kimlik Doğrulama Akışı',
        content:
          'Canlı sayfada NextAuth tabanlı giriş, hata gösterimi ve başarılı kayıt sonrası yönlendirme akışı çalışır. Admin yayını alındığında bu yapı ManagedPage görünümüne döner.',
      },
    ],
  }),
  blog: createPreset({
    slug: 'blog',
    source: 'Kod tabanli canli blog sayfasi',
    description:
      'Bu referans, mevcut blog liste sayfasindaki hero alani, kategori sekmeleri, one cikan yazi mantigi ve grid/pagination akisini temsil eder.',
    title: 'Blog',
    seoTitle: 'ÖzTelevi Blog | İlham ve Yaşam',
    seoDescription:
      'Ev dekorasyonu, trendler ve yaşam tarzı hakkında ilham verici yazılar. Japandi felsefesini yaşam alanlarınıza taşıyan içerikler.',
    heroTitle: 'İlham ve Yaşam',
    heroSubtitle:
      'Ev dekorasyonu, trendler ve yaşam tarzı hakkında ilham verici yazılar. Japandi felsefesini yaşam alanlarınıza taşıyın.',
    heroImage: '/images/hero.png',
    heroCtaText: 'Bize Ulaşın',
    heroCtaLink: '/#iletisim',
    htmlContent: '',
    schemaJson: '',
    sections: [
      {
        key: 'blog-categories',
        type: 'features',
        title: 'Blog Kategorileri',
        content: 'Canlı sayfadaki kategori filtreleri.',
        items: ['Dekorasyon', 'Trendler', 'İpuçları'],
      },
      {
        key: 'blog-featured',
        type: 'text',
        title: 'Öne Çıkan Yazılar',
        content:
          'Kategori tümü seçiliyken ilk iki featured yazı geniş kartlar halinde öne çıkarılır. Görsel, kategori, özet ve yayın tarihi birlikte gösterilir.',
      },
      {
        key: 'blog-grid',
        type: 'text',
        title: 'Yazı Listesi ve Sayfalama',
        content:
          'Diğer blog yazıları kart grid yapısında listelenir. Sayfa sonunda çoklu sayfa varsa pagination görünür. İçerik API üzerinden gelir.',
      },
      {
        key: 'blog-gallery',
        type: 'gallery',
        title: 'Örnek Blog Görselleri',
        content: 'Blog kartlarında kullanılan varsayılan görsel örnekleri.',
        items: ['/images/hero.png', '/images/product-curtain.png', '/images/product-textile.png'],
      },
    ],
  }),
  favoriler: createPreset({
    slug: 'favoriler',
    source: 'Kod tabanli canli favoriler sayfasi',
    description:
      'Bu referans, mevcut favoriler ekranindaki hero alani, bos durum ve urun kart yapisini hatirlatmak icin olusturuldu.',
    title: 'Favoriler',
    seoTitle: 'ÖzTelevi Favoriler | Beğendiğiniz Ürünler',
    seoDescription:
      'Beğendiğiniz ÖzTelevi ürünlerini favorilerinizde saklayın ve daha sonra kolayca yeniden inceleyin.',
    heroTitle: 'Beğendiğiniz Ürünler',
    heroSubtitle: 'Kalbinizi kazanan ürünleri burada bulabilirsiniz.',
    heroImage: '/images/product-textile.png',
    heroCtaText: 'Galeriyi Keşfet',
    heroCtaLink: '/galeri',
    htmlContent: '',
    schemaJson: '',
    sections: [
      {
        key: 'favorites-note',
        type: 'text',
        title: 'Favori Ürün Listesi',
        content:
          'Canlı sayfada favori ürünler kullanıcı state’inden gelir. Kartlarda ürün görseli, fiyatı, kategori bilgisi ve favoriden çıkarma aksiyonu yer alır.',
      },
      {
        key: 'favorites-categories',
        type: 'features',
        title: 'Kategori Etiketleri',
        content: 'Favori ürün kartlarında görünen ana ürün kategorileri.',
        items: ['Perdeler', 'Tekstiller', 'Yatak Odası', 'Aksesuarlar'],
      },
      {
        key: 'favorites-empty-state',
        type: 'cta',
        title: 'Henüz favori ürününüz yok',
        content:
          'Boş durumda kullanıcı galeriye yönlendirilir ve beğendiği ürünleri favorilere eklemesi beklenir.',
        link: '/galeri',
        linkText: 'Galeriyi Keşfet',
      },
    ],
  }),
  sepet: createPreset({
    slug: 'sepet',
    source: 'Kod tabanli canli sepet sayfasi',
    description:
      'Bu referans, mevcut sepet ekranindaki baslik, bos durum, urun listesi ve kupon/ozet alanlarini temsil eder.',
    title: 'Sepet',
    seoTitle: 'ÖzTelevi Sepet | Siparişinizi Tamamlayın',
    seoDescription:
      'Sepetinizdeki ürünleri gözden geçirin, kupon uygulayın ve siparişinizi tamamlamaya hazırlanın.',
    heroTitle: 'Sepetim',
    heroSubtitle: 'Sepetinizdeki ürünler ve sipariş özetiniz burada yer alır.',
    heroImage: '/images/product-curtain.png',
    heroCtaText: 'Alışverişe Başla',
    heroCtaLink: '/galeri',
    htmlContent: '',
    schemaJson: '',
    sections: [
      {
        key: 'cart-items',
        type: 'text',
        title: 'Ürünler',
        content:
          'Canlı sayfada sepetteki ürünler liste halinde görünür. Her satırda miktar, fiyat ve silme aksiyonları yer alır.',
      },
      {
        key: 'cart-summary',
        type: 'text',
        title: 'Sipariş Özeti',
        content:
          'Sepetin sağ tarafında ara toplam, indirim, kupon bilgisi ve toplam tutar gösterilir.',
      },
      {
        key: 'cart-coupon',
        type: 'features',
        title: 'Kupon ve İşlemler',
        content: 'Canlı sepet deneyimindeki temel etkileşimler.',
        items: ['Kupon uygula', 'Kupon kaldır', 'Sepeti temizle', 'Ödeme akışına ilerle'],
      },
      {
        key: 'cart-empty-state',
        type: 'cta',
        title: 'Sepetiniz boş',
        content:
          'Boş durumda kullanıcıya koleksiyonu keşfetmesi ve alışverişe başlaması önerilir.',
        link: '/galeri',
        linkText: 'Alışverişe Başla',
      },
    ],
  }),
}

export function getPageEditorPreset(slug: string): PageEditorPreset | null {
  return PAGE_EDITOR_PRESETS[slug] || null
}
