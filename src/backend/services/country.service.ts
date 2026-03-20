import { prisma } from '@/lib/db';

export type CountryFilter = {
  search?: string;
  orderBy?: string;
  orderIn?: 'asc' | 'desc';
  limit?: number;
};

/**
 * Enterprise Country Service (Singleton)
 */
export class CountryService {
  private static instance: CountryService;

  private constructor() {}

  static getInstance(): CountryService {
    if (!CountryService.instance) {
      CountryService.instance = new CountryService();
    }
    return CountryService.instance;
  }

  /**
   * Get a list of countries with search and ordering.
   */
  async getCountries(filters: CountryFilter = {}) {
    const { search, orderBy = 'name', orderIn = 'asc', limit } = filters;

    const where: any = {};
    if (search) {
      where.name = { contains: search };
    }

    // Prepare valid sort field
    const validSortFields = ['id', 'name', 'phonecode'];
    const sortField = validSortFields.includes(orderBy) ? orderBy : 'name';

    const countries = await prisma.countries.findMany({
      where,
      orderBy: { [sortField]: orderIn },
      take: limit ? Number(limit) : undefined
    });

    return countries;
  }

  /**
   * Get countries with phone codes (!= 0).
   */
  async getPhoneCodes(filters: CountryFilter = {}) {
    const { search, orderBy = 'phonecode', orderIn = 'asc', limit } = filters;

    const where: any = {
      phonecode: { not: 0 }
    };
    if (search) {
      where.name = { contains: search };
    }

    const validSortFields = ['id', 'name', 'phonecode'];
    const sortField = validSortFields.includes(orderBy) ? orderBy : 'phonecode';

    const countries = await prisma.countries.findMany({
      where,
      select: {
        id: true,
        name: true,
        phonecode: true
      },
      orderBy: { [sortField]: orderIn },
      take: limit ? Number(limit) : undefined
    });

    return countries;
  }
}

export const countryService = CountryService.getInstance();
