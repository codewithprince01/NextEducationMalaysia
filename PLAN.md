# Migration Plan: Education Malaysia Next.js Platform

## 🟢 Phase 0: Pre-flight & Foundation
- [x] Analyze existing Laravel/React codebase
- [x] Design Next.js architecture (`ARCHITECTURE.md`)
- [x] Initialize Next.js 15 project
- [x] Setup Prisma ORM & Database Singleton
- [x] Port core utility functions
- [/] Create `PLAN.md` (Orchestrator Enforcement)

## 🎨 Phase 1: Frontend & Design (Frontend Specialist)
- [ ] **Deep Design Thinking**: Perform competitive analysis and topological betting
- [ ] **Design Commitment**: Finalize radical style (Bauhaus Remix / Asymmetric Tension)
- [ ] **Root Layout**: Implement `<RootLayout />` with typography system (Outfit/Inter)
- [ ] **Global CSS**: Setup custom design tokens (No Generic SaaS/Purple!)
- [ ] **Core Components**: Header, Footer, Hero (with scroll-reveal animations)

## 🗄️ Phase 2: Data Access Layer (Database Architect / Backend Specialist)
- [ ] **Prisma Finalization**: Run `npx prisma generate` and verify types
- [ ] **WebsiteScope Integration**: Implement Prisma middleware for global filtering
- [ ] **Core Queries**: Implement `getUniversityBySlug`, `getBlogBySlug`, etc.
- [ ] **API Migration**: Port inquiry submissions (POST routes)

## 🔍 Phase 3: SEO & Performance (SEO Specialist / Performance Optimizer)
- [ ] **Metadata Engine**: Implement dynamic `generateMetadata` helper
- [ ] **JSON-LD**: Create structured data generators for University, Course, Blog
- [ ] **Sitemap Index**: Setup dynamic `sitemap.ts` for 10k+ pages
- [ ] **Image Optimization**: Configure `next/image` with optimized remote patterns
- [ ] **Middleware**: Setup URL preservation and security headers

## 🧪 Phase 4: Page Implementation (Parallel)
- [ ] Homepage (ISR)
- [ ] University Detail (ISR)
- [ ] Course Listing (ISR with filters)
- [ ] Blog System (ISR)
- [ ] Search & Filters (Client-side with transitions)

## ✅ Phase 5: Verification & Audit
- [ ] **UX Audit**: Run `python .agent/scripts/ux_audit.py`
- [ ] **Security Scan**: Run `python .agent/scripts/security_scan.py`
- [ ] **Performance Check**: Run `python .agent/scripts/lighthouse_audit.py`
- [ ] **Final Checklist**: Run `python .agent/scripts/checklist.py .`

---
**Agents Involved:**
- `orchestrator`: Coordination & Plan Enforcement
- `frontend-specialist`: UI/UX, Components, Styles
- `backend-specialist`: Data Logic, Queries, APIs
- `database-architect`: Prisma, SQL Optimization
- `seo-specialist`: Metadata, Sitemaps, JSON-LD
- `performance-optimizer`: Core Web Vitals, Speed
