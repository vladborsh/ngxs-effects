export interface EffectMetadataInterface<ArgsType, ActionObject> {
    action: new (...args: ArgsType[]) => ActionObject;
    propertyName: string;
    metadataName: 'EFFECT_METADATA';
}
