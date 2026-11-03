import { Entity } from './entity';
/**
 * Aggregate Root is an entity that defines a boundary within which other
 * entities (value objects and aggregates) maintain consistency
 */
export class AggregateRoot extends Entity {
    _createdAt;
    _updatedAt;
    constructor(id, createdAt = new Date(), updatedAt = new Date()) {
        super(id);
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }
    get createdAt() {
        return this._createdAt;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    updateTimestamp() {
        this._updatedAt = new Date();
    }
}
