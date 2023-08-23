export interface Serializable<TSerializedData extends object> {
  serialize(data: TSerializedData): string;
  deserialize(data: string): void;
}
