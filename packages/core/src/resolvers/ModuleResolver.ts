import { ModuleLookup } from '../module/ModuleLookup';
import { Module } from '../module/Module';
import { DefinitionResolver, DefinitionResolverFactory } from './DependencyResolver';
import { RegistryRecord } from '../module/RegistryRecord';
import { ContainerContext } from '../container/ContainerContext';
import { ImmutableSet } from '../collections/ImmutableSet';
import { Instance } from './abstract/Instance';

export const a = 1;
//TODO: This looks like responsibility of the ContainerContext ?
