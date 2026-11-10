# Autonomous Coding Agent


[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-4-orange.svg)](https://sdk.vercel.ai/docs)
[![E2B](https://img.shields.io/badge/E2B-Sandbox-purple.svg)](https://e2b.dev/)
[![Better Auth](https://img.shields.io/badge/Better%20Auth-Authentication-green.svg)](https://www.better-auth.com/)

An **autonomous coding agent** that runs in isolated E2B sandboxes. Give it a GitHub repo and a task — it plans, explores, writes code, runs tests, and creates PRs. Built with Next.js 15, Vercel AI SDK, and E2B.

---

## 🎯 Key Features

### 🤖 Autonomous Coding
- **Full repo access** — clones, explores, reads, writes, edits files
- **Task planning** — records step-by-step plans (`update_plan`) with live progress tracking
- **Smart edits** — Fast Apply regenerates only changed regions (Cursor-style)
- **Multi-language testing** — JavaScript, TypeScript, C, C++, Go, Java, Rust, Python

### 🔐 Secure & Private (BYOK)
- **Bring Your Own Keys** — E2B + LLM keys entered in UI, stored only in your browser
- **No server-side secrets** — public deployments run entirely on visitor credentials
- **GitHub OAuth** — secure authentication with conversation history in Neon DB

### 🧠 Multi-Provider LLM Support
| Provider | Models | Speed |
|----------|--------|-------|
| **Anthropic** | Claude Opus 4.8, Sonnet 4.6, Haiku 4.5 | Balanced |
| **OpenAI** | GPT-5, GPT-5 Mini | Latest |
| **Google** | Gemini 3.1 Pro, 3.5 Flash | Fast |
| **Cerebras** | gpt-oss-120b, zai-glm-4.7, Gemma 4 | ~1000+ tok/s |
| **OpenAI Compatible** | Ollama, LM Studio, vLLM, custom | Local |

### 👁️ Vision Recognition (Cerebras × Gemma 4)
- Upload a screenshot or provide a URL
- Gemma 4 reads actual pixels (layout, modals, disabled states)
- Generates Playwright tests at Cerebras speed
- One-click handoff to coding agent

### 🔌 MCP Integration
- Connect any MCP server from the UI
- Built-in Linear + GitHub (with user PAT)
- Tools merged into agent's toolset per session

### 🖥️ Live Preview & Desktop
- **Iframe preview** — auto-detects dev servers via `expose_port`
- **noVNC desktop** — real Chrome browser streamed live (separate sandbox)
- User-initiated, on-demand, torn down with session

### 📋 Workspace Panel
- **Plan tab** — live progress bar, step statuses
- **Files tab** — browse every touched file, view diffs
- **Preview tab** — switch between iframe and desktop stream

### 🔄 Conversation History
- Persisted to Neon DB (user-scoped)
- History panel with search, preview, one-click restore
- Automatic save after each agent turn

---

## 📸 Screenshots

| Main Interface | Plan & Files | Vision Recognition |
|----------------|--------------|-------------------|
| ![Main](docs/screenshots/main.png) | ![Workspace](docs/screenshots/workspace.png) | ![Vision](docs/screenshots/vision.png) |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **E2B API Key** — [Get one here](https://e2b.dev/docs/getting-started/api-key)
- **At least one LLM API Key** (Anthropic, OpenAI, Google, Cerebras, or Ollama)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/autonomous-coding-agent.git
cd autonomous-coding-agent

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Configure Environment

Edit `.env.local` with your keys:

```env
# ===========================================
# REQUIRED
# ===========================================
E2B_API_KEY=your_e2b_api_key
E2B_PLAYWRIGHT_TEMPLATE=playwright

# ===========================================
# LLM PROVIDERS (at least one required)
# ===========================================
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_key
CEREBRAS_API_KEY=your_cerebras_key

# ===========================================
# OPTIONAL: GitHub OAuth (for auth + history)
# ===========================================
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# ===========================================
# OPTIONAL: Database (Neon Postgres)
# ===========================================
DATABASE_URL=postgresql://user:pass@host/db

# ===========================================
# OPTIONAL: MCP Servers
# ===========================================
LINEAR_API_KEY=your_linear_key
GITHUB_API_KEY=ghp_your_github_pat  # for server-side GitHub MCP

# ===========================================
# OPTIONAL: Model Overrides
# ===========================================
ANTHROPIC_MODEL=claude-opus-4-8
OPENAI_MODEL=gpt-5
GOOGLE_MODEL=gemini-3.1-pro-preview
CEREBRAS_MODEL=gpt-oss-120b
OPENAI_COMPATIBLE_MODEL=llama3.1
OPENAI_COMPATIBLE_BASE_URL=http://localhost:11434/v1

# ===========================================
# OPTIONAL: Provider Priority
# ===========================================
ROUTER_ORDER=anthropic,openai,google,cerebras,openai-compatible
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage Guide

### 1. Basic Coding Task

1. **Select Model** — Click provider/model selector (top-right)
2. **Enter Repo** — Paste GitHub URL (`github.com/owner/repo`)
3. **Describe Task** — e.g., *"Add a /health endpoint with tests"*
4. **Run** — Watch the agent plan, explore, implement, and test

### 2. Vision → Code Flow

1. Navigate to **/recognize** (click 👁️ Recognize in header)
2. Upload screenshot or enter app URL
3. Click **Generate Test** — Gemma 4 on Cerebras writes Playwright test
4. Click **Send to Coding Agent** — Hands off to main agent for validation

### 3. Creating Pull Requests

1. Complete a coding task (files modified)
2. Connect GitHub MCP (MCP → Add Server → GitHub → enter PAT)
3. Click **Create PR** button (appears when files changed)
4. Agent creates PR with auto-generated title/description

### 4. Conversation History

1. Sign in with GitHub (top-right)
2. Click **History** (🕐 icon) to view past conversations
3. Click any conversation to restore and continue

### 5. Adding MCP Servers

1. Click **MCP** (plug icon) in header
2. Click **Add Server** → Choose Linear, GitHub, or Custom
3. Enter credentials → Tools available to agent immediately

---

## 🏗️ Architecture

```
autonomous-coding-agent/
├── app/
│   ├── page.tsx                    # Main UI (chat + workspace)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Design system (CSS variables)
│   ├── recognize/
│   │   └── page.tsx                # Vision recognition page
│   └── api/
│       ├── agent/route.ts          # Streaming agent endpoint
│       ├── auth/[...all]/route.ts  # Better Auth handler
│       ├── conversations/route.ts  # Conversation CRUD
│       ├── mcp/route.ts            # MCP server listing
│       ├── mcp/tools/route.ts      # MCP tool introspection
│       ├── preview/route.ts        # Desktop preview lifecycle
│       ├── vision/route.ts         # Vision recognition endpoint
│       └── config/route.ts         # Provider availability
├── components/
│   ├── Header.tsx                  # Top bar (model, MCP, keys, history)
│   ├── Composer.tsx                # Task input + Run/Create PR
│   ├── AgentLog.tsx                # Streaming tool calls
│   ├── Workspace.tsx               # Plan/Files/Preview tabs
│   ├── HistoryPanel.tsx            # Conversation history modal
│   └── auth/                       # Auth components
├── lib/
│   ├── router.ts                   # Multi-provider model resolution
│   ├── sandbox.ts                  # E2B sandbox pool (10-min TTL)
│   ├── tools.ts                    # Agent tool definitions
│   ├── preview.ts                  # noVNC desktop sandbox
│   ├── fastApply.ts                # AI-assisted targeted edits
│   ├── mcp.ts                      # MCP client factory
│   ├── testRunner.ts               # Multi-language test runner
│   ├── playwrightRunner.ts         # Playwright in E2B
│   ├── vision.ts                   # Vision prompts & parsing
│   ├── auth.ts                     # Better Auth config
│   ├── auth-client.ts              # Client auth hooks
│   ├── db.ts                       # Prisma client
│   └── types.ts                    # Shared TypeScript types
├── prisma/
│   └── schema.prisma               # Database schema
└── public/
```

### Key Design Decisions

| Aspect | Approach |
|--------|----------|
| **Sandbox Isolation** | Per-session E2B sandbox, 10-min idle timeout |
| **Context Engineering** | Active exploration (read_file, list_files) > RAG |
| **Approval Gates** | `request_approval` tool before mutating actions |
| **State Management** | React hooks + Vercel AI SDK `useChat` |
| **Auth** | Better Auth + GitHub OAuth + Prisma adapter |
| **Streaming** | Vercel AI SDK `streamText` → `toUIMessageStreamResponse` |

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `E2B_API_KEY` | ✅ | E2B sandbox API key |
| `E2B_PLAYWRIGHT_TEMPLATE` | ✅ | Playwright template name |
| `ANTHROPIC_API_KEY` | One of | Anthropic API key |
| `OPENAI_API_KEY` | One of | OpenAI API key |
| `GOOGLE_GENERATIVE_AI_API_KEY` | One of | Google AI API key |
| `CEREBRAS_API_KEY` | One of | Cerebras API key |
| `GITHUB_CLIENT_ID` | For auth | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | For auth | GitHub OAuth client secret |
| `DATABASE_URL` | For history | Neon Postgres connection string |
| `LINEAR_API_KEY` | Optional | Linear MCP server |
| `GITHUB_API_KEY` | Optional | Server-side GitHub MCP PAT |
| `OPENAI_COMPATIBLE_BASE_URL` | Optional | Ollama/LM Studio base URL |
| `ROUTER_ORDER` | Optional | Provider fallback priority |

### Model Configuration

Default models (override via env):

```typescript
anthropic: 'claude-opus-4-8'
openai: 'gpt-5'
google: 'gemini-3.1-pro-preview'
cerebras: 'gpt-oss-120b'
openai-compatible: 'llama3.1'
```

Fast models (for Fast Apply):

```typescript
anthropic: 'claude-haiku-4-5-20251001'
openai: 'gpt-5-mini'
google: 'gemini-3.5-flash'
cerebras: 'gpt-oss-120b'
openai-compatible: 'llama3.2'
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run specific test file
npm test -- lib/tools.test.ts
```

### Test Coverage
- **84 tests passing** across 7 test files
- Unit tests for tools, MCP, preview, vision, sandbox
- E2E tests for preview (skipped by default)

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

```bash
# Build locally first to verify
npm run build
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-Specific Notes

- **E2B_API_KEY** must have sandbox creation permissions
- **DATABASE_URL** requires Neon Postgres (or compatible)
- **GITHUB_CLIENT_ID/SECRET** need OAuth app configured with callback URL
- **CEREBRAS_API_KEY** required for vision recognition

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/amazing-feature

# 2. Make changes
# ... code ...

# 3. Run tests
npm test

# 4. Build to verify
npm run build

# 5. Commit with conventional commits
git commit -m "feat: add amazing feature"

# 6. Push and open PR
git push origin feature/amazing-feature
```

### Code Style

- **TypeScript** strict mode
- **ESLint** + **Prettier** (run `npm run lint`)
- **Conventional Commits** for commit messages

---


## 🙏 Acknowledgments

- **[E2B](https://e2b.dev/)** — Secure sandbox infrastructure
- **[Vercel AI SDK](https://sdk.vercel.ai/)** — Streaming LLM integration
- **[Better Auth](https://www.better-auth.com/)** — Authentication framework
- **[Cerebras](https://cerebras.ai/)** — Ultra-fast inference
- **[Neon](https://neon.tech/)** — Serverless Postgres
- **[Prisma](https://www.prisma.io/)** — Type-safe database access
- **[shadcn/ui](https://ui.shadcn.com/)** — Component inspiration



<div align="center">
  <strong>Built with ❤️ for developers who want to code faster</strong>
  <br>
  <sub>Star ⭐ this repo if you find it useful!</sub>
</div>