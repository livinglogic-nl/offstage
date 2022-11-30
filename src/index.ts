import { OffstageState } from './types.js';
import useConfigure from './use-configure.js';
import useEndpoint from './use-endpoint.js';
import useMount from './use-mount.js';
import useService from './use-service.js';

const state:OffstageState = {
  configurators: [],
};

export const configure = useConfigure(state);
export const service = useService();
export const endpoint = useEndpoint(state);
export const mount = useMount(state);
export const factory = (defaultObject:any) => (override = {}) => ({...defaultObject, ...override});

