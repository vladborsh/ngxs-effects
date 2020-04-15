import { EFFECT_TERMINATE_METADATA } from './constans';
import { EffectTerminateMetadataInterface } from './interfaces/effect-terminate-metadata.interface';

export function EffectsTerminate<EClassType, ArgsType, ReturnType, ActionObject>() {
  return (
    target: EClassType,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(args: ActionObject) => ReturnType>
  ) => {
    const metadata: EffectTerminateMetadataInterface = {
      propertyName,
    };

    if (target.constructor.hasOwnProperty(EFFECT_TERMINATE_METADATA)) {
      target.constructor[EFFECT_TERMINATE_METADATA].push(metadata);
    } else {
      Object.defineProperty(target.constructor, EFFECT_TERMINATE_METADATA, {
        value: [metadata],
      });
    }
  };
}
