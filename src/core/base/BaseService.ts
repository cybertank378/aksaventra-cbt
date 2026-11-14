import type { Result } from "./Result";

export abstract class BaseService {
  protected readonly serviceName: string;

  constructor(serviceName = "BaseService") {
    this.serviceName = serviceName;
  }

  protected async execute<T, E = unknown>(
    operation: () => Promise<Result<T, E>>,
  ): Promise<Result<T, E>> {
    return await operation();
  }
}
