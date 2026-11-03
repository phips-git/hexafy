/** Entity base class Represents a domain object with a unique identity */
export class Entity {
    _id;
    constructor(id) {
        this._id = id;
    }
    getId() {
        return this._id;
    }
}
