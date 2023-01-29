
const logoContent = () => `
<svg viewBox="0 0 64 64" height="16">
<g transform="translate(0,44)"><rect width="60" height="20" fill="yellow" rx="3" /></g>
<g transform="translate(0,22)"><rect width="40" height="20" fill="#f60" rx="2" /><path d="M0,20l0,4 42,0 -1,-4z" fill="black" /></g>
<g><rect width="20" height="20" fill="#e00" rx="1" /><path d="M0,20l0,4 22,0 -1,-4z" fill="black" /></g>
</svg>
`;

(() => {
  const { offstage } = window;

  if(offstage.devtool) { return ; }
  offstage.devtool = 1;

  const root = document.createElement('div');
  Object.assign(root.style, {
    position: 'fixed',
    bottom: '0',
    left: '20px',
    cursor: 'pointer',
  });
  document.body.appendChild(root);

  const state = {
    menuOpen: false,
    filters: [],
  }

  const isForceNetwork = () => offstage.forceNetwork || window.isOffstagePlaywright;

  const renderHistory = content => {
    const codeStyle = {
      whiteSpace: 'pre',
      fontSize: '12px',
      lineHeight: '1.3em',
      borderBottom: '1px solid #222',
      padding: '8px 0',
    }
    offstage.history
      .filter(({ serviceMethodName }) =>
        state.filters.length === 0 || state.filters.includes(serviceMethodName)
      )
      .forEach(entry => {
      const div = el(content, '', {});
      el(div,`
        <span style="color: #f60">${entry.serviceMethodName}</span>
        <span style="color: #888">${entry.date.toLocaleString()}</span>
      `, {
          display: 'flex',
          justifyContent: 'space-between',
        }),
      el(div, entry.endpoint, { fontWeight:'bold' }),
      el(div, JSON.stringify(entry.requestData, null, 4), codeStyle);
      el(div, JSON.stringify(entry.responseData, null, 4), codeStyle);
    });
  }

  const renderLogFilter = log => {
    const filter = el(log, '', {
      flex: 1,
      padding: '10px',
      borderLeft: '1px solid #222',
    });
    
    Object.entries(offstage.services).forEach(([serviceName, service]) =>
      Object.keys(service).forEach(methodName => {
        const key = `${serviceName}.${methodName}`

        const isActive = state.filters.includes(key);
        checkbox(filter, key, {opacity: isActive ? 1 : 0.6}, isActive, (on) => {
          state.filters = on
            ?
            [...state.filters, key]
            :
            state.filters.filter(k => k != key)
        })
      })
    );
  }

  const renderLog = root => {
    const log = el(root, '', {
      background: 'rgba(0,0,0,0.8)',
      border: '1px solid #222',
      position: 'fixed',
      width: '800px',
      height: isForceNetwork() ? 'auto' : '400px',
      maxWidth: 'calc(100vw - 64px)',
      maxHeight: 'calc(100vh - 64px)',
      bottom: '31px',
      display: 'flex',
    });

    const content = el(log, '', {
      flex: 3,
      padding: '10px',
      overflow: 'auto',
      fontFamily: 'monospace',
    });

    if(isForceNetwork()) {
      el(content, 'Force network enabled. Actual HTTP traffic is visible in your browsers devtools');
    } else {
      renderHistory(content);
      renderLogFilter(log);
    }

  }

  const renderMenu = (root) => {
    const menu = el(root, '', {
      position: 'absolute',
      bottom: '0px',
      left: '32px',
    });

    
    checkbox(menu, 'Force network', {}, isForceNetwork(),  () => {
      offstage.forceNetwork = !offstage.forceNetwork;
      state.menuOpen = false;
    });
  }

  const render = () => {
    root.innerHTML = '';
    const borderRadius = '4px';
    el(root, logoContent(), {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#111',
      boxSizing: 'border-box',
      border: '1px solid white',
      borderBottom: 0,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
      border: isForceNetwork()
        ? '2px solid blue'
        : '1px solid rgba(255,255,255,0.1)',
    }, () => {
      state.menuOpen = !state.menuOpen;
    });

    if(state.menuOpen) {
      renderMenu(root);
      renderLog(root);
    }
  }

  const el = (parent, content, style, clickHandler) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    Object.assign(div.style, style);
    if(clickHandler) {
      div.onclick = () => {
        clickHandler();
        render();
      }
    }
    parent.appendChild(div);
    return div;
  }
  const checkbox = (parent, content, style, isActive, changeHandler) => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" ${isActive ? 'checked' : ''} /> ${content}`;
    Object.assign(label.style, {
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      whiteSpace: 'nowrap',
      ...style,
    });
    label.querySelector('input').onchange = (e) => {
      changeHandler(e.target.checked);
      render();
    }
    parent.appendChild(label);
    return label;
  }

  render();
  offstage.onHistoryUpdate = render;

  let visible = false;
  const setVisible = to => {
    if(visible === to) { return; }
    visible = to;
    if(visible) {
      document.body.appendChild(root);
    } else {
      document.body.removeChild(root);
    }
    render();
  }
  setVisible(true);

  const frame = () => {
    requestAnimationFrame(frame);
    setVisible(!window.isOffstagePlaywright);
  }
  frame();

})();
