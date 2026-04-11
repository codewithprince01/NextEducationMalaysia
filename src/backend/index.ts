// ============================================================
// BACKEND BARREL EXPORT
// Centralized access to all backend services, utilities, and middleware.
// ============================================================

// ─── MIDDLEWARE ───────────────────────────────────────────────
export * from './middleware/api-key';
export * from './middleware/with-middleware';
export * from './middleware/auth';
export * from './middleware/rate-limit';

// ─── UTILS ────────────────────────────────────────────────────
export * from './utils/response';
export * from './utils/auth-cookies';
export * from './utils/formatters';
export * from './utils/seo-tags';
export * from './utils/error';
export * from './utils/logger';

// ─── SERVICES ─────────────────────────────────────────────────
export * from './services/university.service';
export * from './services/seo.service';
export * from './services/blog.service';
export * from './services/exam.service';
export * from './services/service.service';
export * from './services/scholarship.service';
export * from './services/faq.service';
export * from './services/student-auth.service';
export * from './services/student-profile.service';
export * from './services/discovery.service';
export * from './services/malaysia-discovery.service';
export * from './services/inquiry.service';
export * from './services/feedback.service';
export * from './services/partner.service';
export * from './services/stats.service';
export * from './services/application.service';
export * from './services/country.service';
export * from './services/dropdown.service';
export * from './services/malaysia-stats.service';
export * from './services/search-apply.service';
export * from './services/multiple-search-apply.service';
export * from './services/sitemap.service';
export * from './services/sitemap-data.service';
export * from './services/home.service';

// ─── TYPES ────────────────────────────────────────────────────
export * from './types';
