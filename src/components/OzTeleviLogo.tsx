interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function OzTeleviLogo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
  }

  return (
    <a href="#" className={`flex items-center gap-3 group ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizes[size].icon} relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer circle - soft frame */}
          <circle
            cx="24"
            cy="24"
            r="23"
            stroke="currentColor"
            strokeWidth="1"
            className="text-foreground/10 group-hover:text-foreground/20 transition-colors duration-500"
            fill="none"
          />
          
          {/* House/roof shape - minimal triangular form */}
          <path
            d="M24 8L10 20V38C10 39.1046 10.8954 40 12 40H36C37.1046 40 38 39.1046 38 38V20L24 8Z"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-foreground/40 group-hover:text-foreground/60 transition-colors duration-500"
            fill="none"
          />
          
          {/* Flowing curtain lines - representing textile */}
          <path
            d="M16 40V28C16 26 18 24 20 24C22 24 24 26 24 28V40"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-foreground/70 group-hover:text-foreground transition-colors duration-500"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M24 40V26C24 24 26 22 28 22C30 22 32 24 32 26V40"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-foreground/70 group-hover:text-foreground transition-colors duration-500"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Sun/light element at top */}
          <circle
            cx="24"
            cy="14"
            r="2"
            fill="currentColor"
            className="text-wood-400 group-hover:text-wood-500 transition-colors duration-500"
          />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <span className={`${sizes[size].text} font-medium tracking-wide text-foreground`}>
          ÖzTelevi
        </span>
      )}
    </a>
  )
}

// Alternative simpler logo for dark backgrounds
export function OzTeleviLogoLight({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-10 h-10', text: 'text-xl' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl' },
  }

  return (
    <a href="#" className={`flex items-center gap-3 group ${className}`}>
      <div className={`${sizes[size].icon} relative flex items-center justify-center`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer circle */}
          <circle
            cx="24"
            cy="24"
            r="23"
            stroke="currentColor"
            strokeWidth="1"
            className="text-background/20 group-hover:text-background/30 transition-colors duration-500"
            fill="none"
          />
          
          {/* House shape */}
          <path
            d="M24 8L10 20V38C10 39.1046 10.8954 40 12 40H36C37.1046 40 38 39.1046 38 38V20L24 8Z"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-background/60 group-hover:text-background/80 transition-colors duration-500"
            fill="none"
          />
          
          {/* Flowing curtains */}
          <path
            d="M16 40V28C16 26 18 24 20 24C22 24 24 26 24 28V40"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-background group-hover:text-white transition-colors duration-500"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M24 40V26C24 24 26 22 28 22C30 22 32 24 32 26V40"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-background group-hover:text-white transition-colors duration-500"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Sun element */}
          <circle
            cx="24"
            cy="14"
            r="2"
            fill="currentColor"
            className="text-wood-300 group-hover:text-wood-200 transition-colors duration-500"
          />
        </svg>
      </div>

      {showText && (
        <span className={`${sizes[size].text} font-medium tracking-wide text-background`}>
          ÖzTelevi
        </span>
      )}
    </a>
  )
}
