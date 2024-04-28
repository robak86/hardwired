- `factory` and `asyncFactory` definitions are currently not included in the builder-based API

  - add `.asFactory()` to `asFactoryFn()` to `InstanceDefinition`

  ```typescript
  const myFactory: InstanceDefinition<IFactory<MyClass>, LifeTime.singleton> = singleton.class(MyClass).asFactory();
  const myFactoryFn: InstanceDefinition<() => MyClass, LifeTime.singleton> = singleton.class(MyClass).asFactoryFn();
  ```
