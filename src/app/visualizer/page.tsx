'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { OzTeleviLogo } from '@/components/OzTeleviLogo'

// ============================================
// Types
// ============================================
interface Room {
  id: string
  name: string
  nameEn: string
  image: string
  description: string
}

interface CurtainStyle {
  id: string
  name: string
  image: string
  opacity: number
  blendMode: string
}

interface CurtainColor {
  id: string
  name: string
  hex: string
  texture?: string
}

// ============================================
// Data
// ============================================
const rooms: Room[] = [
  {
    id: 'bedroom',
    name: 'Yatak Odası',
    nameEn: 'Bedroom',
    image: '/images/scene-bedroom.png',
    description: 'Huzurlu uyku için ideal perdeler',
  },
  {
    id: 'living-room',
    name: 'Salon',
    nameEn: 'Living Room',
    image: '/images/hero.png',
    description: 'Misafirlerinizi etkileyin',
  },
  {
    id: 'study',
    name: 'Çalışma Odası',
    nameEn: 'Study',
    image: '/images/scene-bedroom.png',
    description: 'Odaklanmak için mükemmel aydınlatma',
  },
]

const curtainStyles: CurtainStyle[] = [
  {
    id: 'linen',
    name: 'Keten',
    image: '/images/product-curtain.png',
    opacity: 0.85,
    blendMode: 'normal',
  },
  {
    id: 'sheer',
    name: 'Tül',
    image: '/images/product-curtain.png',
    opacity: 0.5,
    blendMode: 'soft-light',
  },
  {
    id: 'blackout',
    name: 'Blackout',
    image: '/images/product-curtain.png',
    opacity: 1,
    blendMode: 'normal',
  },
]

const curtainColors: CurtainColor[] = [
  { id: 'natural', name: 'Doğal Bej', hex: '#E8DFD0' },
  { id: 'cream', name: 'Krem', hex: '#F5F0E6' },
  { id: 'sand', name: 'Kum', hex: '#D4C4A8' },
  { id: 'stone', name: 'Taş', hex: '#9B9B8E' },
  { id: 'white', name: 'Beyaz', hex: '#FAFAF8' },
  { id: 'moss', name: 'Yosun', hex: '#8B9A7D' },
  { id: 'clay', name: 'Kil', hex: '#B89B7A' },
  { id: 'charcoal', name: 'Kömür', hex: '#4A4A48' },
]

// ============================================
// Component
// ============================================
export default function VisualizerPage() {
  const [selectedRoom, setSelectedRoom] = useState<Room>(rooms[0])
  const [selectedStyle, setSelectedStyle] = useState<CurtainStyle>(curtainStyles[0])
  const [selectedColor, setSelectedColor] = useState<CurtainColor>(curtainColors[0])
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedImage, setSavedImage] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/#felsefe', label: 'Felsefemiz' },
    { href: '/#koleksiyon', label: 'Koleksiyon' },
    { href: '/#zanaat', label: 'Zanaat' },
    { href: '/#mekanlar', label: 'Mekanlar' },
  ]

  const handleSaveImage = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSavedImage('saved')
    setTimeout(() => setSavedImage(null), 3000)
    setIsSaving(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <OzTeleviLogo />

            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm tracking-wide text-muted-foreground hover:text-foreground transition-all duration-500"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/visualizer"
                className="px-4 py-2 text-sm tracking-wide text-foreground border border-foreground/30 rounded-full transition-all duration-500 hover:border-foreground/50"
              >
                3D Görselleştirici
              </Link>
              <a
                href="/#iletisim"
                className="px-6 py-2.5 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90 hover:shadow-lg"
              >
                Bize Ulaşın
              </a>
            </div>

            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-foreground"
                aria-label="Menüyü aç/kapat"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-6 h-6"
                >
                  {isMobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div
            className={`md:hidden overflow-hidden transition-all duration-500 ${
              isMobileMenuOpen ? 'max-h-80 pb-6' : 'max-h-0'
            }`}
          >
            <div className="flex flex-col gap-4 pt-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300 py-2"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/visualizer"
                className="text-foreground font-medium"
              >
                3D Görselleştirici
              </Link>
              <a
                href="/#iletisim"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 px-6 py-3 bg-foreground text-background text-center text-sm tracking-wide rounded-full"
              >
                Bize Ulaşın
              </a>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-sand-50 to-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Oda Görselleştirici
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground mb-4">
              Perdelerinizi Görselleştirin
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Mekanınıza en uygun perdeyi seçin. Farklı oda türleri, stiller ve renklerle
              tasarımınızı önizleyin.
            </p>
          </div>
        </section>

        {/* Visualizer Section */}
        <section className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Preview Panel */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                <div className="sticky top-28">
                  {/* Room Preview */}
                  <div className="relative aspect-[4/3] md:aspect-[16/10] rounded-2xl overflow-hidden bg-sand-100 shadow-xl">
                    {/* Base Room Image */}
                    <Image
                      src={selectedRoom.image}
                      alt={selectedRoom.name}
                      fill
                      className="object-cover"
                      priority
                    />
                    
                    {/* Curtain Overlay */}
                    <div 
                      className="absolute inset-0 transition-all duration-700"
                      style={{
                        backgroundColor: selectedColor.hex,
                        opacity: selectedStyle.opacity * 0.7,
                        mixBlendMode: selectedStyle.blendMode as 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity',
                      }}
                    />

                    {/* Curtain Pattern Overlay */}
                    <div 
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      }}
                    />

                    {/* Window Frame Effect */}
                    <div className="absolute inset-x-0 top-0 h-1/3 pointer-events-none">
                      <div className="absolute left-[10%] top-[15%] w-[35%] h-[70%] border-4 border-white/30 rounded-t-lg" />
                      <div className="absolute right-[10%] top-[15%] w-[35%] h-[70%] border-4 border-white/30 rounded-t-lg" />
                    </div>

                    {/* Room Label */}
                    <div className="absolute bottom-4 left-4 px-4 py-2 bg-background/90 backdrop-blur-sm rounded-lg">
                      <p className="text-sm font-medium text-foreground">{selectedRoom.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedStyle.name} · {selectedColor.name}</p>
                    </div>

                    {/* Fullscreen Button */}
                    <button
                      className="absolute top-4 right-4 p-3 bg-background/90 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                      aria-label="Tam ekran"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-foreground">
                        <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <button
                      onClick={handleSaveImage}
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                          Kaydediliyor...
                        </>
                      ) : savedImage ? (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                          Kaydedildi!
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Tasarımı Kaydet
                        </>
                      )}
                    </button>
                    <Link
                      href={`/#koleksiyon`}
                      className="flex-1 px-6 py-3 border border-foreground/30 text-foreground text-sm tracking-wide rounded-full transition-all duration-500 hover:border-foreground/50 hover:bg-foreground/5 text-center flex items-center justify-center gap-2"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <path d="M3 6h18" />
                        <path d="M16 10a4 4 0 01-8 0" />
                      </svg>
                      Ürünleri İncele
                    </Link>
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="p-4 bg-sand-50 rounded-xl text-center">
                      <p className="text-2xl font-light text-foreground">3</p>
                      <p className="text-xs text-muted-foreground">Oda Tipi</p>
                    </div>
                    <div className="p-4 bg-sand-50 rounded-xl text-center">
                      <p className="text-2xl font-light text-foreground">3</p>
                      <p className="text-xs text-muted-foreground">Perde Stili</p>
                    </div>
                    <div className="p-4 bg-sand-50 rounded-xl text-center">
                      <p className="text-2xl font-light text-foreground">8</p>
                      <p className="text-xs text-muted-foreground">Renk Seçeneği</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selection Panel */}
              <div className="order-1 lg:order-2 space-y-8">
                
                {/* Room Selection */}
                <div>
                  <h3 className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
                    Oda Seçin
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {rooms.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 ${
                          selectedRoom.id === room.id
                            ? 'ring-2 ring-foreground ring-offset-2'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={room.image}
                          alt={room.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <p className="absolute bottom-2 left-2 right-2 text-xs text-white font-medium truncate">
                          {room.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Curtain Style Selection */}
                <div>
                  <h3 className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
                    Perde Stili
                  </h3>
                  <div className="space-y-2">
                    {curtainStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4 ${
                          selectedStyle.id === style.id
                            ? 'bg-foreground text-background'
                            : 'bg-sand-50 text-foreground hover:bg-sand-100'
                        }`}
                      >
                        <div 
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            selectedStyle.id === style.id ? 'bg-background/10' : 'bg-white'
                          }`}
                        >
                          {style.id === 'linen' && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-6 h-6 ${selectedStyle.id === style.id ? 'text-background' : 'text-foreground'}`}>
                              <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                          )}
                          {style.id === 'sheer' && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-6 h-6 ${selectedStyle.id === style.id ? 'text-background' : 'text-foreground'}`}>
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                          {style.id === 'blackout' && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-6 h-6 ${selectedStyle.id === style.id ? 'text-background' : 'text-foreground'}`}>
                              <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{style.name}</p>
                          <p className={`text-xs ${selectedStyle.id === style.id ? 'text-background/70' : 'text-muted-foreground'}`}>
                            {style.id === 'linen' && 'Doğal, ışık süzen'}
                            {style.id === 'sheer' && 'Yarı şeffaf, yumuşak'}
                            {style.id === 'blackout' && 'Tam karartma'}
                          </p>
                        </div>
                        {selectedStyle.id === style.id && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <h3 className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
                    Renk Seçin
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {curtainColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color)}
                        className={`group relative aspect-square rounded-xl transition-all duration-300 ${
                          selectedColor.id === color.id
                            ? 'ring-2 ring-foreground ring-offset-2'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {selectedColor.id === color.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke={color.id === 'charcoal' ? '#fff' : '#000'} 
                              strokeWidth="2.5" 
                              className="w-5 h-5"
                            >
                              <path d="M5 12l5 5L20 7" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          <span className={`text-xs px-2 py-1 rounded bg-foreground text-background`}>
                            {color.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Summary */}
                <div className="p-4 bg-wood-50 rounded-xl">
                  <h4 className="text-sm font-medium text-foreground mb-2">Seçiminiz</h4>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-foreground font-medium">{selectedRoom.name}</span> için{' '}
                    <span className="text-foreground font-medium">{selectedColor.name}</span> renginde{' '}
                    <span className="text-foreground font-medium">{selectedStyle.name}</span> perde
                  </p>
                  <Link
                    href={`/#iletisim`}
                    className="mt-4 block w-full py-2 text-center text-sm text-foreground border border-foreground/30 rounded-lg hover:bg-foreground/5 transition-colors"
                  >
                    Bu Tasarım İçin Teklif Al
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-sand-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
                Nasıl Çalışır?
              </p>
              <h2 className="text-2xl md:text-3xl font-light text-foreground">
                3 Basit Adımda
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-foreground rounded-full flex items-center justify-center text-background text-xl font-light">
                  1
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Oda Seçin</h3>
                <p className="text-sm text-muted-foreground">
                  Yatak odası, salon veya çalışma odası seçerek başlayın
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-foreground rounded-full flex items-center justify-center text-background text-xl font-light">
                  2
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Stil Belirleyin</h3>
                <p className="text-sm text-muted-foreground">
                  Keten, tül veya blackout perde stilini seçin
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-foreground rounded-full flex items-center justify-center text-background text-xl font-light">
                  3
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Renk Tercih Edin</h3>
                <p className="text-sm text-muted-foreground">
                  Mekanınıza uygun rengi seçin ve teklif alın
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-foreground text-background">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            <p className="text-sm tracking-[0.3em] uppercase text-background/70 mb-4">
              Tasarımınızı Beğendiniz mi?
            </p>
            <h2 className="text-2xl md:text-3xl font-light mb-6">
              Uzmanlarımızla Paylaşın
            </h2>
            <p className="text-background/80 leading-relaxed mb-8">
              Tasarım danışmanlarımız, seçtiğiniz perde kombinasyonunu referans alarak
              mekanınıza özel teklif hazırlayacaktır.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/#iletisim"
                className="px-8 py-4 bg-background text-foreground text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-background/90 hover:shadow-xl"
              >
                Teklif Al
              </a>
              <a
                href="tel:+902125550123"
                className="px-8 py-4 border border-background/30 text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:border-background/50 flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Hemen Arayın
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-wood-900 text-background py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <OzTeleviLogo />
              <p className="text-sm text-background/70 mt-2">
                Japon estetiği × İskandinav sadeliği
              </p>
            </div>
            <div className="flex gap-6">
              <a href="/#felsefe" className="text-sm text-background/70 hover:text-background transition-colors">
                Felsefemiz
              </a>
              <a href="/#koleksiyon" className="text-sm text-background/70 hover:text-background transition-colors">
                Koleksiyon
              </a>
              <Link href="/visualizer" className="text-sm text-background hover:text-background transition-colors font-medium">
                Görselleştirici
              </Link>
            </div>
          </div>
          <div className="border-t border-background/10 mt-8 pt-8 text-center">
            <p className="text-sm text-background/50">
              © 2024 ÖzTelevi. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
