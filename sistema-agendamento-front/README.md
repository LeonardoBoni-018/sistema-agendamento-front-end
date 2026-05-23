<div align="center">
  <h1>Sistema de Agendamento — Frontend</h1>
  <p><strong>Aplicação web para gerenciamento de agendamentos em estabelecimentos comerciais</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 19"/>
    <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 6"/>
    <img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS 4"/>
    <img src="https://img.shields.io/badge/shadcn/ui-000000?style=flat-square&logo=shadcnui&logoColor=white" alt="shadcn/ui"/>
    <img src="https://img.shields.io/badge/Zustand-5.0-443E38?style=flat-square" alt="Zustand 5"/>
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License"/>
  </p>
</div>

## Sobre

Interface web moderna para o sistema de agendamento. Permite que estabelecimentos gerenciem seus profissionais, serviços e horários, e que clientes realizem agendamentos de forma prática e rápida.

## Funcionalidades

- **Autenticação** com login e sessão persistente (Zustand + localStorage)
- **Dashboard** com métricas e indicadores visuais
- **Gerenciamento de agendamentos** — criar, visualizar, filtrar e cancelar
- **Painel administrativo** — CRUD de funcionários, serviços, horários e bloqueios
- **Página pública de agendamento** — clientes agendam sem cadastro
- **Notificações em tempo real** via SSE
- **Avaliações** com estrelas após atendimento
- **Tema claro/escuro** com next-themes
- **Design responsivo** com Tailwind CSS + shadcn/ui

## Tecnologias

| Categoria | Tecnologia |
|---|---|
| Framework | React 19.2 |
| Linguagem | TypeScript 6.0 |
| Build | Vite 8.0 |
| Estilização | Tailwind CSS 4.3 + shadcn/ui (Radix UI) |
| Estado | Zustand 5.0 |
| Roteamento | React Router DOM 7.15 |
| Formulários | React Hook Form 7.76 + Zod 4.4 |
| HTTP | Axios 1.16 |
| Notificações | Sonner 2.0 |
| Ícones | Lucide React |

## Pré-requisitos

- Node.js 20+
- npm ou yarn

## Configuração

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/sistema-agendamento-front.git
cd sistema-agendamento-front
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (copie `.env.example` para `.env`):
```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Compila para produção (TypeScript + Vite) |
| `npm run lint` | Executa ESLint em todo o projeto |
| `npm run preview` | Visualiza build de produção localmente |

## Estrutura do Projeto

```
src/
├── components/
│   ├── layout/      # DashboardLayout
│   ├── shared/      # Componentes reutilizáveis
│   └── ui/          # Componentes shadcn/ui
├── hooks/           # Hooks customizados (SSE, tempo real)
├── layout/          # Header, Sidebar
├── lib/             # Utilitários
├── pages/           # Páginas da aplicação
│   ├── admin/       # Painel administrativo
│   ├── appointments/# Agendamentos
│   ├── auth/        # Login
│   ├── dashboard/   # Dashboard
│   ├── jobs/        # Serviços
│   ├── profile/     # Perfil
│   └── publico/     # Agendamento público
├── routes/          # Configuração de rotas
├── services/        # Serviços HTTP (Axios)
├── store/           # Estado global (Zustand)
└── types/           # Definições TypeScript
```

## Licença

Este projeto está licenciado sob a licença MIT — veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">
  <sub>Desenvolvido com ❤️</sub>
</div>
