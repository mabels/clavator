
export interface IObjectId {
  objectId(): string;
}

let objectId = 0;
export class ObjectId {
  private readonly _objectId: string;
  constructor(objectName: string) {
    this._objectId = `${objectName}@${++objectId}`;
  }
  public objectId(): string {
    return this._objectId;
  }
}

export default ObjectId;
