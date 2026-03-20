import { prisma } from '@/lib/db';
import { SITE_VAR } from '../utils/constants';
import { serializeBigInt } from '@/lib/utils';

/**
 * Enterprise Partner Service (Singleton)
 */
export class PartnerService {
  private static instance: PartnerService;

  private constructor() {}

  static getInstance(): PartnerService {
    if (!PartnerService.instance) {
      PartnerService.instance = new PartnerService();
    }
    return PartnerService.instance;
  }

  /**
   * Get active partners with optional location/search filters.
   */
  async getPartners(filters: {
    country?: string;
    state?: string;
    city?: string;
    search?: string;
  } = {}) {
    const where: any = {
      status: 1,
      is_valid: true
    };

    if (filters.country) where.company_addrs_country = filters.country;
    if (filters.state) where.company_addrs_street = filters.state;

    const searchWhere = filters.search
      ? {
          OR: [
            { name: { contains: filters.search } },
            { company_name: { contains: filters.search } },
            { company_addrs_country: { contains: filters.search } }
          ]
        }
      : {};

    const partners = await prisma.agent_details.findMany({
      where: { ...where, ...searchWhere },
      select: {
        id: true,
        name: true,
        email: true,
        company_name: true,
        company_url: true,
        company_logo: true,
        company_logopath: true,
        company_addrs_country: true,
        company_addrs_city: true,
        territory: true,
        status: 1
      },
      orderBy: [
        { company_addrs_country: 'asc' },
        { name: 'asc' }
      ]
    });

    // Group by country
    const grouped = partners.reduce((acc: Record<string, any[]>, p) => {
      const key = p.company_addrs_country || 'Other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(serializeBigInt(p));
      return acc;
    }, {});

    const count = partners.length;

    return { count, data: grouped };
  }

  /**
   * Get distinct partner countries.
   */
  async getCountries() {
    const results = await prisma.agent_details.findMany({
      where: { status: 1, is_valid: true, company_addrs_country: { not: null } },
      select: { company_addrs_country: true },
      distinct: ['company_addrs_country'],
      orderBy: { company_addrs_country: 'asc' }
    });

    return results
      .map(r => r.company_addrs_country)
      .filter(Boolean);
  }

  /**
   * Get distinct states/territories, optionally filtered by country.
   */
  async getStates(country?: string) {
    const where: any = { status: true, is_valid: true, territory: { not: null } };
    if (country) where.company_addrs_country = country;

    const results = await prisma.agent_details.findMany({
      where,
      select: { territory: true },
      distinct: ['territory'],
      orderBy: { territory: 'asc' }
    });

    return results.map(r => r.territory).filter(Boolean);
  }

  /**
   * Get distinct cities, optionally filtered by country and/or state.
   */
  async getCities(country?: string, state?: string) {
    const where: any = { status: true, is_valid: true, company_addrs_city: { not: null } };
    if (country) where.company_addrs_country = country;
    if (state) where.territory = state;

    const results = await prisma.agent_details.findMany({
      where,
      select: { company_addrs_city: true },
      distinct: ['company_addrs_city'],
      orderBy: { company_addrs_city: 'asc' }
    });

    return results.map(r => r.company_addrs_city).filter(Boolean);
  }
}

export const partnerService = PartnerService.getInstance();
