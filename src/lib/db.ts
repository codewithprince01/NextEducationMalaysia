import { PrismaClient, Prisma } from '@prisma/client'

const SITE_VAR = process.env.SITE_VAR || 'MYS'

const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof createPrismaClient> }

/**
 * Models that have a `website` column.
 * WebsiteScope filter is auto-applied to all read queries.
 */
const WEBSITE_SCOPED_MODELS = [
  'University', 'UniversityProgram', 'CourseSpecialization',
  'CourseCategory', 'Blog', 'BlogCategory',
  'Scholarship', 'Service', 'Exam', 'PageBanner',
  'PageContent', 'DynamicPageSeo', 'StaticPageSeo',
  'InstituteType', 'leads',
] as const

type ScopedModel = (typeof WEBSITE_SCOPED_MODELS)[number]

function isScopedModel(model: string): model is ScopedModel {
  if (model.toLowerCase() === 'level') return false;
  return (WEBSITE_SCOPED_MODELS as readonly string[]).some(
    (m) => m.toLowerCase() === model.toLowerCase()
  )
}

function createPrismaClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

  return base.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          console.log(`Prisma Query: findMany on model "${model}". Scoped: ${isScopedModel(model)}`);
          if (isScopedModel(model)) {
            args.where = { ...args.where, website: SITE_VAR }
          }
          return query(args)
        },
        async findFirst({ model, args, query }) {
          console.log(`Prisma Query: findFirst on model "${model}". Scoped: ${isScopedModel(model)}`);
          if (isScopedModel(model)) {
            args.where = { ...args.where, website: SITE_VAR }
          }
          return query(args)
        },
        async findUnique({ model, args, query }) {
          return query(args)
        },
        async count({ model, args, query }) {
          console.log(`Prisma Query: count on model "${model}". Scoped: ${isScopedModel(model)}`);
          if (isScopedModel(model)) {
            args.where = { ...args.where, website: SITE_VAR }
          }
          return query(args)
        },
        async aggregate({ model, args, query }) {
          console.log(`Prisma Query: aggregate on model "${model}". Scoped: ${isScopedModel(model)}`);
          if (isScopedModel(model)) {
            args.where = { ...args.where, website: SITE_VAR }
          }
          return query(args)
        },
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
