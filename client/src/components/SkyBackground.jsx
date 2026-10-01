function SkyBackground({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky via-sky-200 to-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/70 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-8 pt-5">
        {children}
      </div>
    </div>
  )
}

export default SkyBackground
