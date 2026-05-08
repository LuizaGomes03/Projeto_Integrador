export const AUTH_COLORS = {
  white: "#FFFFFF",
  page: "#F4F6F8",
  card: "#FFFFFF",
  text: "#2F2F2F",
  muted: "#6B7280",
  border: "#D1D5DB",
  accent: "#C62828",
  accentHover: "#A61F1F",
  error: "#B91C1C",
  surface: "#F9FAFB",
} as const

export type AuthFieldErrors = {
  email?: string
  senha?: string
}

export function validateLogin(email: string, senha: string) {
  const errors: AuthFieldErrors = {}

  if (!email.trim()) {
    errors.email = "Informe seu email institucional."
  }

  if (!senha.trim()) {
    errors.senha = "Informe sua senha de acesso."
  }

  return errors
}

export type SignupFieldErrors = {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirm?: string
}

export function isAcademicEmail(email: string) {
  return email.trim().toLowerCase().endsWith("@aluno.cps.sp.gov.br")
}

export function validateSignup(params: {
  firstName: string
  lastName: string
  email: string
  password: string
  confirm: string
}) {
  const errors: SignupFieldErrors = {}

  if (!params.firstName.trim()) {
    errors.firstName = "Informe o nome."
  }

  if (!params.lastName.trim()) {
    errors.lastName = "Informe o sobrenome."
  }

  if (!params.email.trim()) {
    errors.email = "Informe o email acadêmico."
  } else if (!isAcademicEmail(params.email)) {
    errors.email = "Use um email terminando em @aluno.cps.sp.gov.br."
  }

  if (!params.password.trim()) {
    errors.password = "Informe a senha."
  }

  if (!params.confirm.trim()) {
    errors.confirm = "Confirme a senha."
  } else if (params.password !== params.confirm) {
    errors.confirm = "As senhas não conferem."
  }

  return errors
}

export const AUTH_COPY = {
  systemName: "Dominó Químico",
  systemSubtitle:
    "Entra para continuar seus estudos.",
  loginTitle: "Login do estudante",
  loginKicker: "Entrar na plataforma",
  loginButton: "Entrar",
  signupButton: "Criar conta",
} as const