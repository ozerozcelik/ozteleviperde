import { cn } from '@/lib/utils'

interface SocialMediaButtonsProps {
  variant?: 'default' | 'light'
  size?: 'sm' | 'md'
  direction?: 'horizontal' | 'vertical'
  showYouTube?: boolean
  className?: string
}

interface SocialLink {
  name: string
  href: string
  icon: React.ReactNode
}

// Instagram SVG Icon
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="12"
        cy="12"
        r="4.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="18"
        cy="6"
        r="1"
        fill="currentColor"
      />
    </svg>
  )
}

// Facebook SVG Icon
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// WhatsApp SVG Icon
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 14.17 2.73 16.17 3.95 17.74L2.05 22L6.47 20.13C7.99 21.01 9.92 21.54 12 21.54C17.52 21.54 22 17.06 22 11.54C22 6.02 17.52 2 12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 14.38C16.2 14.68 14.97 15.73 14.67 15.88C14.37 16.03 13.97 16.13 13.52 15.88C13.07 15.63 12.17 15.23 11.02 14.23C10.12 13.48 9.42 12.48 9.17 12.03C8.92 11.58 9.07 11.18 9.22 10.98C9.37 10.78 9.57 10.48 9.72 10.28C9.87 10.08 9.92 9.88 9.97 9.68C10.02 9.48 9.92 9.18 9.77 8.93C9.62 8.68 8.92 6.93 8.62 6.23C8.42 5.73 8.12 5.68 7.87 5.68C7.62 5.68 7.32 5.68 7.02 5.68C6.72 5.68 6.22 5.78 5.77 6.28C5.32 6.78 4.07 7.93 4.07 10.18C4.07 12.43 5.77 14.58 6.02 14.88C6.27 15.18 9.22 18.53 13.47 20.03C14.72 20.48 15.72 20.78 16.47 20.93C17.72 21.18 18.87 21.03 19.77 20.53C20.72 19.98 21.42 18.93 21.62 17.88C21.82 16.83 21.57 16.28 21.27 15.98C20.97 15.68 20.57 15.53 20.27 15.38C19.97 15.23 18.97 14.78 18.57 14.58C18.17 14.38 17.82 14.38 17.52 14.68L16.5 14.38Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Pinterest SVG Icon
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 16.25 4.67 19.9 8.44 21.26C8.34 20.4 8.24 19.14 8.44 18.24C8.64 17.44 9.64 13.24 9.64 13.24C9.64 13.24 9.34 12.64 9.34 11.74C9.34 10.34 10.14 9.24 11.14 9.24C11.94 9.24 12.34 9.84 12.34 10.54C12.34 11.34 11.84 12.54 11.54 13.64C11.34 14.54 12.04 15.34 12.94 15.34C14.64 15.34 15.94 13.54 15.94 10.94C15.94 8.64 14.34 7.04 12.04 7.04C9.44 7.04 7.84 9.04 7.84 11.14C7.84 11.94 8.14 12.84 8.54 13.34C8.64 13.44 8.64 13.54 8.64 13.64L8.34 14.74C8.24 14.94 8.14 14.94 7.94 14.84C6.74 14.24 6.04 12.64 6.04 11.04C6.04 8.04 8.24 5.24 12.24 5.24C15.44 5.24 17.94 7.54 17.94 10.84C17.94 14.04 15.94 16.64 13.14 16.64C12.14 16.64 11.24 16.14 10.94 15.44L10.34 17.64C10.04 18.64 9.34 19.94 8.84 20.74C9.84 21.04 10.84 21.24 12.04 21.24C17.56 21.24 22.04 16.76 22.04 11.24C21.94 6.48 17.52 2 12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// YouTube SVG Icon
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M22.54 6.42C22.42 5.94 22.18 5.5 21.84 5.16C21.5 4.82 21.06 4.58 20.58 4.46C18.74 4 12 4 12 4C12 4 5.26 4 3.42 4.46C2.94 4.58 2.5 4.82 2.16 5.16C1.82 5.5 1.58 5.94 1.46 6.42C1 8.26 1 12 1 12C1 12 1 15.74 1.46 17.58C1.58 18.06 1.82 18.5 2.16 18.84C2.5 19.18 2.94 19.42 3.42 19.54C5.26 20 12 20 12 20C12 20 18.74 20 20.58 19.54C21.06 19.42 21.5 19.18 21.84 18.84C22.18 18.5 22.42 18.06 22.54 17.58C23 15.74 23 12 23 12C23 12 23 8.26 22.54 6.42Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.75 15.02L15.5 12L9.75 8.98V15.02Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SocialMediaButtons({
  variant = 'default',
  size = 'md',
  direction = 'horizontal',
  showYouTube = false,
  className,
}: SocialMediaButtonsProps) {
  const socialLinks: SocialLink[] = [
    {
      name: 'Instagram',
      href: 'https://instagram.com/oztelevi',
      icon: <InstagramIcon className="w-full h-full" />,
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com/oztelevi',
      icon: <FacebookIcon className="w-full h-full" />,
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/905551234567',
      icon: <WhatsAppIcon className="w-full h-full" />,
    },
    {
      name: 'Pinterest',
      href: 'https://pinterest.com/oztelevi',
      icon: <PinterestIcon className="w-full h-full" />,
    },
  ]

  if (showYouTube) {
    socialLinks.push({
      name: 'YouTube',
      href: 'https://youtube.com/@oztelevi',
      icon: <YouTubeIcon className="w-full h-full" />,
    })
  }

  // Size configurations
  const sizes = {
    sm: {
      container: 'gap-2',
      icon: 'w-4 h-4',
      button: 'p-2',
    },
    md: {
      container: 'gap-3',
      icon: 'w-5 h-5',
      button: 'p-2.5',
    },
  }

  // Variant configurations - Japandi warm tones
  const variants = {
    default: {
      container: '',
      button: 'text-sand-700 hover:text-sand-900 hover:bg-sand-100/80',
      icon: '',
    },
    light: {
      container: '',
      button: 'text-sand-200 hover:text-white hover:bg-white/10',
      icon: '',
    },
  }

  return (
    <div
      className={cn(
        'flex',
        direction === 'horizontal' ? 'flex-row' : 'flex-col',
        sizes[size].container,
        className
      )}
      role="navigation"
      aria-label="Social media links"
    >
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Follow us on ${link.name}`}
          className={cn(
            'rounded-full transition-all duration-300 ease-out',
            'hover:scale-110 active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            variant === 'default' 
              ? 'focus-visible:ring-sand-400 focus-visible:ring-offset-sand-50'
              : 'focus-visible:ring-sand-300 focus-visible:ring-offset-transparent',
            sizes[size].button,
            variants[variant].button
          )}
        >
          <div className={sizes[size].icon}>
            {link.icon}
          </div>
        </a>
      ))}
    </div>
  )
}

export default SocialMediaButtons
