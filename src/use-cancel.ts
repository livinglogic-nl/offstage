import { OffstageState } from "types"

export default (state:OffstageState) => {
  const cancelRequestsByGroup = (cancelGroup:string) => {
    [...state.activeRequests].filter(req => req.cancelGroup == cancelGroup)
      .forEach(req => req.cancel());
  }
  return cancelRequestsByGroup;
}
