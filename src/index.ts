import { OffstageState } from './types.js';
import useConfigure from './use-configure.js';
import useEndpoint from './use-endpoint.js';
import useMount from './use-mount.js';
import useService from './use-service.js';

const state:OffstageState = {
  configurators: [],
  rootConfig: {
    pact: {
    },
  },
};

export const configure = useConfigure(state);
export const service = useService();
export const endpoint = useEndpoint(state);
export const mount = useMount(state);
export const factory = <Type>(defaultObject:any) => (override = {}):Type => ({...defaultObject, ...override}) as Type;

