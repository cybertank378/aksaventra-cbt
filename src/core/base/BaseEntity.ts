export abstract class BaseEntity<TId = string> {
  public readonly id: TId;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(id: TId, createdAt?: Date, updatedAt?: Date) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public equals(other?: BaseEntity<TId> | null): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    return this.id === other.id;
  }
}
