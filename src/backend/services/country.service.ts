import { prisma } from '@/lib/db-fresh';

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
    const validSortFields = ['id', 'name', 'phonecode'];
    const sortField = validSortFields.includes(orderBy) ? orderBy : 'name';
    const sortDirection = orderIn === 'desc' ? 'DESC' : 'ASC';

    const whereSql = search ? 'WHERE name LIKE ?' : '';
    const limitSql = limit ? `LIMIT ${Number(limit)}` : '';
    const args: any[] = [];
    if (search) args.push(`%${search}%`);

    const countries = await prisma.$queryRawUnsafe(
      `
      SELECT id, name, phonecode
      FROM countries
      ${whereSql}
      ORDER BY ${sortField} ${sortDirection}
      ${limitSql}
      `,
      ...args
    );
    return countries as any[];
  }

  /**
   * Get countries with phone codes (!= 0).
   */
  async getPhoneCodes(filters: CountryFilter = {}) {
    const { search, orderBy = 'phonecode', orderIn = 'asc', limit } = filters;
    const validSortFields = ['id', 'name', 'phonecode'];
    const sortField = validSortFields.includes(orderBy) ? orderBy : 'phonecode';
    const sortDirection = orderIn === 'desc' ? 'DESC' : 'ASC';

    const whereSql = search
      ? 'WHERE phonecode IS NOT NULL AND phonecode <> 0 AND name LIKE ?'
      : 'WHERE phonecode IS NOT NULL AND phonecode <> 0';
    const limitSql = limit ? `LIMIT ${Number(limit)}` : '';
    const args: any[] = [];
    if (search) args.push(`%${search}%`);

    const countries = await prisma.$queryRawUnsafe(
      `
      SELECT id, name, phonecode
      FROM countries
      ${whereSql}
      ORDER BY ${sortField} ${sortDirection}
      ${limitSql}
      `,
      ...args
    );
    return countries as any[];
  }
}

export const countryService = CountryService.getInstance();
