// @ts-nocheck

export default (state) => {
  const configure = (configurators:OffstageConfigurator[]) => {
    state.configurators = configurators;
  }

  return configure;
}
