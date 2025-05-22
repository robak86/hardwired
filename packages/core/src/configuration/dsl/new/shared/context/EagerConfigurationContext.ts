// export class EagerConfigurationContext implements IConfigurationContext {
//   private _bindingsRegistry = BindingsRegistry.create();
//
//   private _interceptors = new Map<string | symbol, IInterceptor<unknown>>();
//   private _disposeFns: Array<(scope: IContainer) => void> = [];
//
//   withInterceptor(name: string | symbol, interceptor: IInterceptor<unknown>): void {
//     if (this._interceptors.get(name)) {
//       throw new Error(`Interceptor with name ${name.toString()} already exists.`);
//     }
//
//     this._interceptors.set(name, interceptor);
//   }
//
//   onDispose(callback: (scope: IContainer) => void): void {
//     this._disposeFns.push(callback);
//   }
//
//   onCascadingDefinition(definition: IDefinitionSymbol<unknown, LifeTime.cascading>): void {
//     this._cascadeDefinitions.set(definition.id, definition);
//   }
//
//   onConfigureBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void {
//     switch (configType) {
//       case 'add':
//         this._lazyDefinitionsRegister.push(builder);
//         break;
//       case 'modify':
//         this._lazyDefinitionsOverride.push(builder);
//         break;
//       case 'freeze':
//         this._lazyDefinitionsFreeze.push(builder);
//         break;
//     }
//
//     if (builder.symbol.strategy === LifeTime.cascading) {
//       this._cascadeDefinitions.set(builder.symbol.id, builder.symbol as IDefinitionSymbol<unknown, LifeTime.cascading>);
//     }
//   }
//
//   onDecorateBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime>): void {
//     switch (configType) {
//       case 'add':
//         this._lazyDefinitionsRegister.push(builder);
//         break;
//       case 'modify':
//         this._lazyDefinitionsOverride.push(builder);
//         break;
//       case 'freeze':
//         this._lazyDefinitionsFreeze.push(builder);
//         break;
//     }
//
//     if (builder.symbol.strategy === LifeTime.cascading) {
//       this._cascadeDefinitions.set(builder.symbol.id, builder.symbol as IDefinitionSymbol<unknown, LifeTime.cascading>);
//     }
//   }
//
//   onInheritBuilder(configType: ConfigurationType, builder: ILazyDefinitionBuilder<unknown, LifeTime.cascading>): void {
//     if (this._overrideDefinitions.has(builder.symbol.id)) {
//       throw new Error(`Cannot inherit from ${builder.symbol.toString()}. It is already modified in the current scope.`);
//     }
//
//     switch (configType) {
//       case 'add':
//         this._lazyDefinitionsRegister.push(builder);
//         break;
//       case 'modify':
//         this._lazyDefinitionsOverride.push(builder);
//         break;
//       case 'freeze':
//         this._lazyDefinitionsFreeze.push(builder);
//         break;
//     }
//   }
//
//   onDefinition(configType: ConfigurationType, definition: IDefinition<unknown, LifeTime>): void {
//     switch (configType) {
//       case 'add':
//         this._registerDefinitions.set(definition.id, definition);
//         break;
//       case 'modify':
//         if (definition.strategy === LifeTime.cascading) {
//           this._cascadeDefinitions.set(definition.id, definition as IDefinitionSymbol<unknown, LifeTime.cascading>);
//         }
//
//         this._overrideDefinitions.set(definition.id, definition);
//         break;
//       case 'freeze':
//         this._freezeDefinitions.set(definition.id, definition);
//         break;
//     }
//   }
//
//   // TODO: still slow as hell. We shouldn't apply anything, but produce already BindingsRegistry allowing treating
//   // multiple of them as linked list
//   applyBindings(
//     bindingsRegistry: BindingsRegistry,
//     container: ICascadingDefinitionResolver,
//     interceptorsRegistry: InterceptorsRegistry,
//     lifecycleRegistry: ILifeCycleRegistry,
//   ): void {
//     this._registerDefinitions.forEach(definition => {
//       bindingsRegistry.register(definition, definition, container);
//     });
//
//     this._overrideDefinitions.forEach(definition => {
//       bindingsRegistry.override(definition);
//     });
//
//     this._lazyDefinitionsRegister.forEach(builder => {
//       const def = builder.build(bindingsRegistry);
//
//       bindingsRegistry.override(def);
//     });
//
//     this._lazyDefinitionsOverride.forEach(builder => {
//       const def = builder.build(bindingsRegistry);
//
//       bindingsRegistry.override(def);
//     });
//
//     this._freezeDefinitions.forEach(def => {
//       bindingsRegistry.freeze(def);
//     });
//
//     this._cascadeDefinitions.forEach(symbol => {
//       bindingsRegistry.setCascadeRoot(symbol, container);
//
//       bindingsRegistry.override(bindingsRegistry.getDefinition(symbol));
//     });
//
//     this._interceptors.forEach((interceptor, name) => {
//       interceptorsRegistry.register(name, interceptor);
//     });
//
//     lifecycleRegistry.setDisposeFns(this._disposeFns);
//   }
// }
