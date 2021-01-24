import { ActionsDispatcher } from './ActionsDispatcher';
import { StateTrait } from './StateTrait';

class Store<TStateTraits extends StateTrait<any>[]> {
  constructor(protected actionsDispatcher: ActionsDispatcher, protected traits: TStateTraits) {
    traits.forEach(trait => this.actionsDispatcher.registerTrait(trait));
  }

  onInit() {}
}
