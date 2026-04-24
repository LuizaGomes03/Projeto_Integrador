export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f6] flex items-center justify-center px-4 py-8 text-center text-[#6f6f73]">
      <section className="w-full max-w-[390px] rounded-[40px] bg-[#f7f5f6] relative overflow-hidden">
        <div className="absolute -top-28 -left-28 h-72 w-72 rounded-full border border-[#f4d8dd]" />
        <div className="absolute top-52 -right-40 h-96 w-96 rounded-full border border-[#f4d8dd]" />

        <div className="relative z-10 px-7 pt-8 pb-10">
          <div className="relative mx-auto mb-8 h-[230px] w-[230px]">
            <div className="absolute inset-0 rounded-full border-4 border-[#f33235]" />
            <div className="absolute left-[18px] top-[54px] h-[58px] w-[96px] -rotate-12 bg-[#bdbdbf]" />
            <div className="absolute right-[18px] top-[38px] h-[70px] w-[86px] -rotate-12 rounded-sm bg-[#f33235]" />
            <div className="absolute right-[8px] top-[94px] h-[88px] w-[100px] -rotate-12 rounded-sm bg-[#f33235]" />
            <div className="absolute left-[58px] top-[126px] h-[30px] w-[95px] -rotate-12 bg-[#bdbdbf]" />
            <div className="absolute left-[55px] top-[72px] -rotate-12 text-left leading-none">
              <p className="text-[18px] font-black text-[#6f6f73] tracking-tight">Domino</p>
              <p className="text-[18px] font-black text-[#6f6f73] tracking-tight">Química</p>
            </div>

            <span className="absolute right-[6px] top-[16px] h-4 w-4 rounded-full bg-[#f33235]" />
            <span className="absolute left-[94px] top-[28px] h-7 w-7 rounded-full bg-[#f7f5f6]" />
            <span className="absolute right-[20px] top-[109px] h-7 w-7 rounded-full bg-[#f7f5f6]" />
            <span className="absolute right-[56px] top-[144px] h-7 w-7 rounded-full bg-[#f7f5f6]" />
            <span className="absolute right-[12px] top-[161px] h-7 w-7 rounded-full bg-[#f7f5f6]" />
          </div>

          <h1 className="text-[52px] italic font-semibold leading-tight text-[#6f6f73]">Domino</h1>
          <p className="text-[56px] font-extrabold leading-[0.95] text-[#f33235]">Químico</p>
          <div className="mx-auto mt-4 mb-7 h-1 w-16 rounded-full bg-[#f8c8cb]" />

          <p className="mx-auto mb-9 max-w-[280px] text-[14px] leading-relaxed text-[#757579]">
            A ciência das ligações em um tabuleiro estratégico.
          </p>

          <button
            type="button"
            className="mb-9 flex h-[66px] w-full items-center justify-center rounded-[22px] bg-[#f91f22] text-[34px] font-extrabold tracking-wide text-white shadow-[0_10px_20px_rgba(249,31,34,0.28)]"
          >
            ENTRAR <span className="ml-4 text-4xl">→</span>
          </button>

          <button
            type="button"
            className="mb-16 flex w-full items-center justify-center gap-3 text-[14px] font-semibold tracking-[0.08em] text-[#79797d]"
          >
            <span className="text-base">👤</span> CRIAR CONTA DE CIENTISTA
          </button>

          <footer className="pt-16 text-[#929296]">
            <p className="mb-3 text-[12px] tracking-[0.2em]">— LAB PROTOCOL V4.2.0 —</p>
            <p className="text-[10px] tracking-wide">MOLECULAR PRECISION FRAMEWORK</p>
          </footer>
        </div>
      </section>
    </main>
  )
}
