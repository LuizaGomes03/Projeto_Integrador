# PR: feat(responsive): tornar telas responsivas (login, jogo, aluno, desempenho)

Branch: feature/responsive-ui
Base: main

## Resumo
Implementa responsividade mobile-first nas telas principais do projeto "Dominó Químico":

- Login: logo responsiva, card com radii/paddings ajustados, inputs/botões fluidos, modal com max-h/overflow.
- Jogo: peças e player cards responsivos, modal vencedor adaptável.
- Menu do aluno: cards e botões full-width, paddings menores no mobile.
- Desempenho: títulos, cards e ícones com breakpoints e radii reduzidos no mobile.

## Arquivos alterados
- frontend/domino-quimico/app/login/page.tsx
- frontend/domino-quimico/app/jogo/page.tsx
- frontend/domino-quimico/app/aluno/page.tsx
- frontend/domino-quimico/app/aluno/desempenho/page.tsx

## Checklist de QA
- [ ] Rodar dev server:
```bash
cd frontend/domino-quimico
npm install
npm run dev
```
- [ ] Verificar visual em: iPhone SE (375x667), Android pequeno (~360x740), tablet, notebook, desktop grande, ultrawide.
- [ ] Conferir ausência de scroll horizontal em todas as páginas.
- [ ] Testar modais (recuperar senha, entrar em sala, vencedor) em mobile.
- [ ] Validar que inputs ocupam 100% e bots são clicáveis no mobile.
- [ ] Revisar títulos e tracking em mobile para evitar quebras estranhas.

## Notas técnicas
- Abordagem mobile-first com classes Tailwind responsivas (`sm`, `md`, `lg`, `xl`).
- Removidos tamanhos fixos excessivos e substituídos por `h-[]` responsivos, `max-w`, `w-full`, `clamp()` onde aplicável.
- Preservado visual premium em desktop (bordas e sombras) com ajustes menores no mobile.

## Como abrir o PR
Abra o link abaixo para criar o PR no GitHub (push já realizado):

https://github.com/LuizaGomes03/Projeto_Integrador/pull/new/feature/responsive-ui

Ou crie o PR manualmente com título/descrição acima.

---

Se quiser, eu posso:
- Abrir o PR automaticamente (requer `gh` autenticado), ou
- Gerar capturas das resoluções pedidas e anexá-las ao PR, ou
- Continuar refinando componentes (create reusable `Card`/`Input` components).