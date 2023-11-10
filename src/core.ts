import useConfigure from './use-configure.js';
import useEndpoint from './use-endpoint.js';
import useService from './use-service.js';

import { state } from './state.js';
import useCancel from './use-cancel.js';

export * from './types.js';

export const configure = useConfigure(state);
export const service = useService();
export const endpoint = useEndpoint(state);
export const cancelRequestsByGroup = useCancel(state);

export const clearCache = () => Object.keys(sessionStorage)
  .filter(key => key.startsWith('offstage-'))
  .forEach(key => sessionStorage.removeItem(key));

export const factory = <Type>(defaultObject:any) => (override = {}):Type => ({...defaultObject, ...override}) as Type;

