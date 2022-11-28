import { OffstageConfigurator, OffstageState } from "./types";

export default (state:OffstageState) => {
  const configure = (configurators:OffstageConfigurator[]) => {
    state.configurators = configurators;
  }
  return configure;
}
