// @ts-nocheck

import { OffstageState } from './src/types.js';
import useConfigure from './src/use-configure.js';
import useEndpoint from './src/use-endpoint.js';
import useMount from './src/use-mount.js';
import useService from './src/use-service.js';

const state:OffstageState = {
  configurators: [],
};

export const configure = useConfigure(state);
export const service = useService();
export const endpoint = useEndpoint(state);
export const mount = useMount(state);
export const factory = (defaultObject:any) => (override = {}) => ({...defaultObject, ...override});

