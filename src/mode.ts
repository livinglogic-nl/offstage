
export const getGlobal = () => {
  try {
    return window as any;
  } catch(_) {
    return global as any;
  }
}

export const isPlaywright = () => getGlobal().isOffstagePlaywright

export const isMockAllowed = () => {
  try {
    if(isPlaywright()) {
      return false;
    }
    if(getGlobal().offstage?.forceNetwork) {
      return false;
    }
  } catch(_) {}
  return true;
}

export const isProduction = () => {
  try {
    if(process.env.NODE_ENV === 'production') {
      return true;
    }
  } catch(_) {}
  return false;
}
