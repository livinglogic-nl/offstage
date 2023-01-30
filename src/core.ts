import useConfigure from './use-configure.js';
import useEndpoint from './use-endpoint.js';
import useService from './use-service.js';

import { state } from './state.js';

export const configure = useConfigure(state);
export const service = useService();
export const endpoint = useEndpoint(state);
export const factory = <Type>(defaultObject:any) => (override = {}):Type => ({...defaultObject, ...override}) as Type;

