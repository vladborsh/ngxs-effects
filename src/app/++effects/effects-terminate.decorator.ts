import { EFFECT_TERMINATE_METADATA } from './constans';

export function EffectsTerminate<EClassType, ArgsType, ReturnType, ActionObject>() {
  return (
    target: EClassType,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(args: ActionObject) => ReturnType>
  ) => {
    const metadata = {
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
