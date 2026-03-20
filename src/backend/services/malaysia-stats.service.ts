import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

/**
 * Enterprise Malaysia Stats Service (Singleton)
 */
export class MalaysiaStatsService {
  private static instance: MalaysiaStatsService;

  private constructor() {}

  static getInstance(): MalaysiaStatsService {
    if (!MalaysiaStatsService.instance) {
      MalaysiaStatsService.instance = new MalaysiaStatsService();
    }
    return MalaysiaStatsService.instance;
  }

  /**
   * Get Malaysia application statistics grouped by year.
   */
  async getStats(years?: number[]) {
    const whereClause: any = {};
    if (years && years.length > 0) {
      whereClause.year = { in: years };
    }

    const rows = await prisma.malaysiaApplication.findMany({
      where: whereClause,
      include: {
        category: true
      },
      orderBy: {
        year: 'desc'
      }
    });

    // Group by year
    const groupedData = rows.reduce((acc: any, item) => {
      const year = item.year;
      if (!acc[year]) {
        acc[year] = {
          year: year,
          total: 0,
          items: []
        };
      }

      const categoryItem = {
        category_id: item.category_id,
        category: item.category?.category_name || null,
        slug: item.category?.category_slug || null,
        color: item.category?.color_class || null,
        count: item.count
      };

      acc[year].items.push(categoryItem);
      acc[year].total += item.count;

      return acc;
    }, {});

    // Convert to array and handle ordering
    let yearsData = Object.values(groupedData);

    if (years && years.length > 0) {
      yearsData.sort((a: any, b: any) => {
        return years.indexOf(a.year) - years.indexOf(b.year);
      });
    } else {
      yearsData.sort((a: any, b: any) => b.year - a.year);
    }

    const overallTotal = yearsData.reduce((sum: number, y: any) => sum + y.total, 0);

    return {
      overall_total: overallTotal,
      years: serializeBigInt(yearsData)
    };
  }

  /**
   * Get available years for Malaysia applications.
   */
  async getYears() {
    const years = await prisma.malaysiaApplication.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'asc' }
    });

    return years.map(y => y.year);
  }

  /**
   * Get categories that have Malaysia applications.
   */
  async getCategories() {
    const categories = await prisma.malaysiaApplicationCategory.findMany({
      where: {
        applications: {
          some: {}
        }
      },
      select: {
        id: true,
        category_name: true,
        color_class: true
      },
      orderBy: {
        category_name: 'asc'
      }
    });

    return serializeBigInt(categories);
  }
}

export const malaysiaStatsService = MalaysiaStatsService.getInstance();
