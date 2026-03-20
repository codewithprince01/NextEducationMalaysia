import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

/**
 * Enterprise Stats Service (Singleton)
 */
export class StatsService {
  private static instance: StatsService;

  private constructor() {}

  static getInstance(): StatsService {
    if (!StatsService.instance) {
      StatsService.instance = new StatsService();
    }
    return StatsService.instance;
  }

  /**
   * Get international student statistics grouped by year.
   */
  async getStats(years?: number[]) {
    const whereClause: any = {};
    if (years && years.length > 0) {
      whereClause.year = { in: years };
    }

    const rows = await prisma.internationalStudentData.findMany({
      where: whereClause,
      include: {
        country: true
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

      const countryItem = {
        country_id: item.country_id,
        country: item.country?.country_name || null,
        slug: item.country?.country_slug || null,
        color: item.country?.color_class || null,
        count: item.count
      };

      acc[year].items.push(countryItem);
      acc[year].total += item.count;

      return acc;
    }, {});

    // Convert to array and sort
    let yearsData = Object.values(groupedData);

    if (years && years.length > 0) {
      // Keep requested order if possible
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
   * Get list of available years in stats.
   */
  async getYears() {
    const years = await prisma.internationalStudentData.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'asc' }
    });

    return years.map(y => y.year);
  }

  /**
   * Get list of countries that have data.
   */
  async getCountries() {
    const countries = await prisma.internationalStudentDataCountry.findMany({
      where: {
        applications: {
          some: {}
        }
      },
      select: {
        id: true,
        country_name: true,
        color_class: true
      },
      orderBy: {
        country_name: 'asc'
      }
    });

    return serializeBigInt(countries);
  }
}

export const statsService = StatsService.getInstance();
