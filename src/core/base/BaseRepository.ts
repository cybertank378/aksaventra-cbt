export interface BaseRepository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>;
  findAll?(): Promise<TEntity[]>;
  save(entity: TEntity): Promise<TEntity>;
  delete?(id: TId): Promise<boolean>;
}
