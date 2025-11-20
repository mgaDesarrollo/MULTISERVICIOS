"use client"

export function BrandLogo({ onClick }: { onClick?: () => void }) {
  return (
    <div className="flex items-center group cursor-pointer" onClick={onClick}>
      <div className="relative">
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden group-hover:scale-105 transition-all duration-300 ease-out shadow-lg">
          {/* Main gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600" />
          {/* Secondary gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 via-transparent to-emerald-400/40" />
          {/* Subtle border */}
          <div className="absolute inset-0 rounded-2xl border border-emerald-300/30" />
          
          {/* Logo content */}
          <div className="absolute inset-[2px] rounded-xl bg-white/95 dark:bg-slate-900/95 flex items-center justify-center backdrop-blur-sm">
            <div className="relative text-2xl font-black select-none">
              <span className="relative z-10 bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-600 bg-clip-text text-transparent">
                M
              </span>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 blur-sm rounded" />
            </div>
          </div>
          
          {/* Corner accents */}
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-80" />
          <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-blue-500 rounded-full opacity-80" />
          
          {/* Hover glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-blue-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </div>
      </div>
      
      <div className="ml-3">
        <span className="text-xl font-black bg-gradient-to-r from-foreground via-emerald-600 to-blue-600 bg-clip-text text-transparent">
          MULTISERVICIOS
        </span>
        <div className="text-xs text-muted-foreground font-medium tracking-wider">
          Apoyamos el crecimiento de tu negocio
        </div>
      </div>
    </div>
  )
}
