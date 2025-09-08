"use client"

export function BrandLogo({ onClick }: { onClick?: () => void }) {
  return (
    <div className="flex items-center group cursor-pointer" onClick={onClick}>
      <div className="relative">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden group-hover:scale-110 transition-all duration-500 ease-out">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-orange-400 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-ping opacity-75" />
          <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-border" />
          <div className="absolute inset-[2px] rounded-lg bg-black/90 flex items-center justify-center">
            <div className="relative text-3xl font-black select-none">
              <span className="relative z-10 bg-gradient-to-b from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent filter drop-shadow-lg">
                M
              </span>
              <span className="absolute inset-0 text-cyan-400 blur-sm opacity-60 animate-pulse">M</span>
              <span className="absolute inset-0 text-purple-400 blur-md opacity-40 animate-pulse delay-75">M</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent h-full w-full animate-pulse opacity-60" />
          </div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-purple-500 rounded-full animate-ping delay-150" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse group-hover:animate-ping" />
        </div>
        <div className="absolute -top-2 -right-2 w-1 h-1 bg-cyan-400 rounded-full animate-bounce" />
        <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-purple-500 rounded-full animate-bounce delay-300" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-600/20 to-pink-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500 -z-10" />
      </div>
      <div className="ml-3">
        <span className="text-xl font-black bg-gradient-to-r from-foreground via-cyan-400 to-purple-500 bg-clip-text text-transparent">
          MULTISERVICIOS
        </span>
        <div className="text-xs text-muted-foreground font-medium tracking-wider">FINANCIERA</div>
      </div>
    </div>
  )
}
