import { AUTH_COLORS } from "./authShared"

type AuthPageHeaderProps = {
  badge?: string
  logoSrc: string
  logoAlt: string
  showTopLogo?: boolean
  title: string
  titleAccent?: string
  subtitle: string
}

export function AuthPageHeader({ badge, logoSrc, logoAlt, showTopLogo = true, title, titleAccent, subtitle }: AuthPageHeaderProps) {
  const [titleFirst, titleSecond] = title.split("\n", 2)

  return (
    <header style={{ textAlign: "center" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        {showTopLogo ? <img src={logoSrc} alt={logoAlt} style={{ height: 34, width: "auto", objectFit: "contain" }} /> : null}
        {badge ? (
          <span
            style={{
              border: `1px solid ${AUTH_COLORS.border}`,
              borderRadius: 999,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.4,
              color: AUTH_COLORS.muted,
              backgroundColor: AUTH_COLORS.white,
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <img src="/logo.png" alt="Dominó Químico" style={{ width: 144, maxWidth: "52vw", height: "auto", objectFit: "contain" }} />
      </div>

      <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, letterSpacing: -0.8, color: AUTH_COLORS.text }}>
        {titleFirst}
        {titleSecond ? (
          <>
            <br />
            <span style={{ color: titleAccent ?? AUTH_COLORS.accent }}>{titleSecond}</span>
          </>
        ) : null}
      </h1>

      <p style={{ margin: "12px auto 0", maxWidth: 520, fontSize: 15, lineHeight: 1.7, color: AUTH_COLORS.muted }}>
        {subtitle}
      </p>
    </header>
  )
}