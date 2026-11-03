/**
 * Base repository class providing common CRUD operations
 *
 * This class implements the Repository interface and can be extended to provide
 * domain-specific implementations while maintaining the core repository
 * contract.
 *
 * @template Entity - The entity type managed by this repository
 * @template Id - The unique identifier type for the entity
 */
export class RepositoryBase {
    /** Check if an entity exists by its identifier */
    async exists(id) {
        const entity = await this.findById(id);
        return entity !== null;
    }
    /** Update an entity (alias for save with type safety) */
    async update(entity) {
        return this.save(entity);
    }
}
