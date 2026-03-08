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
        title: 'Perdelerinizi Görselleştirin',
        content:
          'Oda görselleştiricimiz ile farklı perde stillerini ve renklerini mekanınızda önizleyin. Karar vermeyi kolaylaştırın.',
        link: '/visualizer',
        linkText: 'Hemen Deneyin',
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
        key: 'testimonials',
        type: 'text',
        title: 'Huzur hikayeleri',
        content:
          'Ana sayfada ziyaretci yorumlari yer alir. Bu alan su an kod icinde statik testimonial kartlari olarak gosteriliyor.',
      },
      {
        key: 'contact-cta',
        type: 'cta',
        title: 'Huzur mekanınızı yaratın',
        content:
          'Keten, dokuma ve özel ölçü perde çözümleri için bizimle iletişime geçin.',
        link: '#iletisim',
        linkText: 'Yolculuğunuza Başlayın',
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
        type: 'text',
        title: 'Bir tutku hikayesi',
        content:
          'ÖzTelevi, 1998 yılında Ayşe Özdemir’in tekstil sanatına olan tutkusundan doğdu. Wabi-sabi felsefesi ile İskandinav minimalizmini birleştirerek küçük bir atölyeden Türkiye’nin önde gelen ev tekstili markalarından birine dönüştü.',
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
        content: 'Canlı sayfada ekip kartları ve kısa biyografiler gösterilir.',
        items: [
          'Ayşe Özdemir - Kurucu ve Kreatif Direktör',
          'Mehmet Kaya - Üretim Direktörü',
          'Elif Yılmaz - Tasarım Lideri',
          'Can Demir - Müşteri Deneyimi',
        ],
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
        content: 'Fallback veri içinde görünen örnek soru başlıkları.',
        items: [
          'Ürünleriniz hangi malzemelerden üretilmektedir?',
          'Perde ölçüsü nasıl alınır?',
          'Siparişimi nasıl verebilirim?',
          'Teslimat süresi ne kadardır?',
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
    source: 'Kod tabanli canli visualizer sayfasi',
    description:
      'Bu referans, mevcut oda gorsellestirici deneyimindeki hero, secim panelleri, adimlar ve teklif CTA bolumlerinden cikarildi.',
    title: 'Visualizer',
    seoTitle: 'ÖzTelevi Visualizer | Perdelerinizi Görselleştirin',
    seoDescription:
      'Farklı oda türleri, perde stilleri ve renklerle perde tasarımlarını mekanınızda önizleyin.',
    heroTitle: 'Perdelerinizi Görselleştirin',
    heroSubtitle:
      'Mekanınıza en uygun perdeyi seçin. Farklı oda türleri, stiller ve renklerle tasarımınızı önizleyin.',
    heroImage: '/images/scene-bedroom.png',
    heroCtaText: 'Ürünleri İncele',
    heroCtaLink: '/#koleksiyon',
    htmlContent: '',
    schemaJson: '',
    sections: [
      {
        key: 'visualizer-rooms',
        type: 'gallery',
        title: 'Oda Seçenekleri',
        content: 'Canlı sayfada seçilebilen ana oda sahneleri.',
        items: ['/images/scene-bedroom.png', '/images/hero.png', '/images/scene-bedroom.png'],
      },
      {
        key: 'visualizer-styles',
        type: 'features',
        title: 'Perde Stilleri',
        content: 'Görselleştiricide seçilebilen perde stilleri.',
        items: ['Keten - Doğal, ışık süzen', 'Tül - Yarı şeffaf, yumuşak', 'Blackout - Tam karartma'],
      },
      {
        key: 'visualizer-colors',
        type: 'features',
        title: 'Renk Seçenekleri',
        content: 'Canlı sayfada kartlar halinde gösterilen perde renkleri.',
        items: ['Doğal Bej', 'Krem', 'Kum', 'Taş', 'Beyaz', 'Yosun', 'Kil', 'Kömür'],
      },
      {
        key: 'visualizer-steps',
        type: 'features',
        title: '3 Basit Adımda',
        content: 'Sayfanın alt kısmında yer alan kullanım akışı.',
        items: [
          '1. Oda Seçin - Yatak odası, salon veya çalışma odası seçerek başlayın.',
          '2. Stil Belirleyin - Keten, tül veya blackout perde stilini seçin.',
          '3. Renk Tercih Edin - Mekanınıza uygun rengi seçin ve teklif alın.',
        ],
      },
      {
        key: 'visualizer-cta',
        type: 'cta',
        title: 'Uzmanlarımızla Paylaşın',
        content:
          'Tasarım danışmanlarımız, seçtiğiniz perde kombinasyonunu referans alarak mekanınıza özel teklif hazırlayacaktır.',
        link: '/#iletisim',
        linkText: 'Bu Tasarım İçin Teklif Al',
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
