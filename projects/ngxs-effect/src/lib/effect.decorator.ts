import { EFFECT_METADATA } from './constans';
import { EffectMetadataInterface } from './interfaces/effect-metadata.interface';

export function Effect<EClassType, ArgsType, ReturnType, ActionObject>(
  action: new (...args: ArgsType[]) => ActionObject
) {
  return (
    target: EClassType,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(args: ActionObject) => ReturnType>
  ) => {
    const metadata: EffectMetadataInterface<ArgsType, ActionObject> = {
      action,
      propertyName,
    };

    if (target.constructor.hasOwnProperty(EFFECT_METADATA)) {
      target.constructor[EFFECT_METADATA].push(metadata);
    } else {
      Object.defineProperty(target.constructor, EFFECT_METADATA, {
        value: [metadata],
      });
    }
  };
}
