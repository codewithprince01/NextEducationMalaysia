import { prisma } from '@/lib/db-fresh';
import { serializeBigInt } from '@/lib/utils';

export class PartnerService {
  private static instance: PartnerService;
  private constructor() {}

  static getInstance(): PartnerService {
    if (!PartnerService.instance) PartnerService.instance = new PartnerService();
    return PartnerService.instance;
  }

  private pick(row: any, keys: string[]) {
    for (const k of keys) {
      const v = row?.[k];
      if (v !== undefined && v !== null && String(v).trim() !== '') return v;
    }
    return null;
  }

  private normalizeCountry(value: any) {
    const v = String(value || '').trim().toUpperCase();
    if (!v) return '';
    if (v === 'INDIA') return 'IN';
    if (v === 'MALAYSIA') return 'MY';
    if (v === 'BANGLADESH') return 'BD';
    if (v === 'PAKISTAN') return 'PK';
    if (v === 'NEPAL') return 'NP';
    if (v === 'SRI LANKA') return 'LK';
    return v;
  }

  private normalize(rows: any[]) {
    return rows.map((r) => ({
      ...r,
      name: this.pick(r, ['name', 'full_name']),
      email: this.pick(r, ['email', 'mail']),
      company_name: this.pick(r, ['company_name', 'company']),
      company_addrs_country: this.normalizeCountry(this.pick(r, ['company_addrs_country', 'country'])),
      territory: this.pick(r, ['territory', 'state']),
      company_addrs_city: this.pick(r, ['company_addrs_city', 'city']),
      company_logo: this.pick(r, ['company_logo', 'profile_image', 'logo']),
      company_logopath: this.pick(r, ['company_logopath', 'logo_path']),
    }));
  }

  private isActive(row: any) {
    const valid = Number(row?.is_valid ?? row?.is_active ?? 1);
    const status = Number(row?.status ?? 1);
    return valid === 1 && status === 1;
  }

  async getPartners(filters: { country?: string; state?: string; city?: string; search?: string } = {}) {
    const fetchFromOurPartners = async () => {
      const rows: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM our_partners`);
      return this.normalize(rows);
    };
    const fetchFromAgentDetails = async () => {
      const rows: any[] = await prisma.$queryRawUnsafe(`SELECT * FROM agent_details`);
      return this.normalize(rows);
    };

    let rows: any[] = [];
    try {
      rows = await fetchFromOurPartners();
      if (!rows.length) rows = await fetchFromAgentDetails();
    } catch {
      rows = await fetchFromAgentDetails();
    }

    const filtered = rows.filter((r) => {
      if (!this.isActive(r)) return false;
      if (filters.country && String(r.company_addrs_country || '') !== filters.country) return false;
      if (filters.state && String(r.territory || '') !== filters.state) return false;
      if (filters.city && String(r.company_addrs_city || '') !== filters.city) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const blob = [
          r.name,
          r.email,
          r.company_name,
          r.company_addrs_country,
          r.territory,
          r.company_addrs_city,
        ]
          .map((v) => String(v || '').toLowerCase())
          .join(' ');
        if (!blob.includes(q)) return false;
      }
      return true;
    });

    filtered.sort(
      (a, b) =>
        String(a.territory || '').localeCompare(String(b.territory || '')) ||
        String(a.name || '').localeCompare(String(b.name || ''))
    );

    const grouped = filtered.reduce((acc: Record<string, any[]>, p) => {
      const key = String(p.territory || 'Other');
      if (!acc[key]) acc[key] = [];
      acc[key].push(serializeBigInt(p));
      return acc;
    }, {});

    return { count: filtered.length, data: grouped };
  }

  async getCountries() {
    const { data } = await this.getPartners();
    const set = new Set<string>();
    Object.values(data).flat().forEach((r: any) => {
      const c = String(r?.company_addrs_country || '').trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  async getStates(country?: string) {
    const { data } = await this.getPartners({ country });
    return Object.keys(data).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }

  async getCities(country?: string, state?: string) {
    const { data } = await this.getPartners({ country, state });
    const set = new Set<string>();
    Object.values(data).flat().forEach((r: any) => {
      const c = String(r?.company_addrs_city || '').trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }
}

export const partnerService = PartnerService.getInstance();
