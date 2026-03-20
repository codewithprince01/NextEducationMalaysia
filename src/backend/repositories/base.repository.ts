import { prisma } from '@/lib/db';

/**
 * Base Repository providing common data access patterns.
 * Decouples Prisma from business logic (Services).
 */
export abstract class BaseRepository<T> {
  protected model: any;

  constructor(modelName: string) {
    this.model = (prisma as any)[modelName];
  }

  async findMany(args?: any): Promise<T[]> {
    return this.model.findMany(args);
  }

  async findUnique(args: any): Promise<T | null> {
    return this.model.findUnique(args);
  }

  async findFirst(args: any): Promise<T | null> {
    return this.model.findFirst(args);
  }

  async count(args?: any): Promise<number> {
    return this.model.count(args);
  }

  async create(args: any): Promise<T> {
    return this.model.create(args);
  }

  async update(args: any): Promise<T> {
    return this.model.update(args);
  }

  async delete(args: any): Promise<T> {
    return this.model.delete(args);
  }
}
