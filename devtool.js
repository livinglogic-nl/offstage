const clearCache = () => Object.keys(sessionStorage)
  .filter(key => key.startsWith('offstage-'))
  .forEach(key => sessionStorage.removeItem(key));

const build = () => {
  const { offstage } = window;
  const state = {
    menuOpen: false,
    filters: [],
  }
  const host = document.createElement('div');
  Object.assign(host.style, {
    position: 'fixed',
    bottom: '0',
    left: '20px',
  });
  const shadow = host.attachShadow({ mode:'closed' });

  const style = document.createElement('style');
  style.textContent = styleContent();
  shadow.appendChild(style);

  const root = document.createElement('div');
  root.className = 'root';
  shadow.appendChild(root);

  const el = (parent, tag, classNames, content, clickHandler) => {
    const div = document.createElement(tag);
    if(classNames) {
      div.className = classNames.join(' ');
    }
    if(content) {
      div.innerHTML = content;
    }
    if(clickHandler) {
      div.onclick = () => {
        clickHandler();
        render();
      }
    }
    parent.appendChild(div);
    return div;
  }

  const checkbox = (parent, classNames, content, isActive, changeHandler) => {
    const label = el(parent, 'label', classNames);

    const input = el(label, 'input');
    el(label, 'span', [], content);

    input.type = 'checkbox';
    input.checked = isActive;
    input.onchange = (e) => {
      changeHandler(e.target.checked);
    }
    return label;
  }

  const isForceNetwork = () => offstage.forceNetwork || window.isOffstagePlaywright;

  const render = () => {
    root.innerHTML = '';
    root.className = isForceNetwork() ? 'root force' : 'root';
    el(root, 'div', [ 'logo' ], logoContent(), () => {
      state.menuOpen = !state.menuOpen;
    });

    if(state.menuOpen) {
      const menu = el(root, 'div', [ 'menu' ]);
      checkbox(menu, [ 'option' ], 'Force network', isForceNetwork(), () => {
        clearCache();
        offstage.forceNetwork = !offstage.forceNetwork;
        if(offstage.forceNetwork) {
           localStorage.setItem('offstage-force-network', '1');
        } else {
           localStorage.removeItem('offstage-force-network');
        }
        state.menuOpen = false;
        render();
      });

      const log = el(root, 'div', [ 'log' ]);

      if(isForceNetwork()) {
        el(log, 'div', [ 'content' ], 'Force network enabled. Actual HTTP traffic is visible in your browsers devtools');
      } else {
        const content = el(log, 'div', [ 'content' ]);

        const renderContent = () => {
          content.innerHTML = '';
          offstage.history
            .filter(({ serviceMethodName }) =>
              state.filters.length === 0 || state.filters.includes(serviceMethodName)
            )
            .forEach(entry => {
               el(content, 'div', [ 'entry' ], `
                  <div class="call">
                    <span class="service-method">${entry.serviceMethodName}</span>
                    <span class="date-time">${entry.date.toLocaleString()}</span>
                  </div>
                  <div class="endpoint">${entry.endpoint}</div>
                  <div class="request">${JSON.stringify(entry.requestData, null, 2)}</div>
                  <div class="response">${JSON.stringify(entry.responseData, null, 2)}</div>
              `);
            })
          content.scrollTo(0,0);
        }
        renderContent();
        const filter = el(log, 'div', [ 'filter' ]);
        Object.entries(offstage.services).forEach(([serviceName, service]) => {
          const group = el(filter, 'div', [ 'group' ]);
          el(group, 'h2', [], serviceName);
          Object.keys(service).forEach(methodName => {
            const key = `${serviceName}.${methodName}`
            const count = offstage.history.filter(e => e.serviceMethodName === key).length;

            const isActive = state.filters.includes(key);
            checkbox(group, [], `${methodName} (${count})`, isActive, on => {
              state.filters = on ? [...state.filters, key] : state.filters.filter(k => k != key);
              renderContent();
            });
          })
        });
      }
    }
  }
  offstage.onHistoryUpdate = render;
  render();
  let visible = false;
  const setVisible = to => {
    if(visible === to) { return; }
    clearCache();
    visible = to;
    if(visible) {
      document.body.appendChild(host);
    } else {
      document.body.removeChild(host);
    }
    render();
  }
  setVisible(true);

  const frame = () => {
    requestAnimationFrame(frame);
    setVisible(!window.isOffstagePlaywright);
  }
  frame();
}

const styleContent = () => `

.root {
  all: inherit;
  color: white;
  --seperator-color: rgba(255,255,255,0.2);
  --seperator-color: #222;
}

.logo {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;

  background: #111;
  box-sizing: border-box;
  border: 1px solid white;
  border-bottom: 0;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.force .logo {
  border: 2px solid #e00;
  border-bottom: 0;
}

.logo {
  border-color: rgba(255,255,255,0.2);
}

.menu {
  position: absolute;
  bottom: 0px;
  left: 32px;
}

label {
  white-space: nowrap;
  display: flex;
  align-items: center;
  height: 32px;
}

.menu label {
  background: #111;
  color: white;
  padding: 0 10px;
}

.log {
  background: #111;
  border: 1px solid #222;
  position: fixed;
  width: 880px;
  height: 400px;
  max-width: calc(100vw - 64px);
  max-height: calc(100vh - 64px);
  bottom: 32px;
  display: flex;
  font-size: 14px;
  line-height: 1.2em;
}

.force .log {
  height: auto;
}

.log .content {
  flex: 3;
  padding: 10px;
  overflow: auto;
  font-family: monospace;
}


.entry {
  border-bottom: 1px solid var(--seperator-color);
}
.entry>div {
  padding: 4px 0;
}

.call {
  display: flex;
  justify-content: space-between;
}

.service-method {
  color: #f60;
}

.date-time {
  font-size: 12px;
}

.request, .response {
  font-size: 12px;
  border-top: 1px solid var(--seperator-color);
  white-space: pre;
}

.log .filter {
  width: 280px;
  padding: 10px;
  border-left: 1px solid #222;
  overflow: auto;
}

.filter .group {
  padding: 10px 0;
}

.filter .group h2 {
  margin: 0;
  margin-bottom: 4px;
  font-size: 16px;
  color: #f60;
}
.filter .group label {
  padding-left: 4px;
}

`;
const logoContent = () => `
  <svg viewBox="0 0 64 64" height="16">
    <g transform="translate(0,44)"><rect width="60" height="20" fill="yellow" rx="3" /></g>
    <g transform="translate(0,22)"><rect width="40" height="20" fill="#f60" rx="2" /><path d="M0,20l0,4 42,0 -1,-4z" fill="black" /></g>
    <g><rect width="20" height="20" fill="#e00" rx="1" /><path d="M0,20l0,4 22,0 -1,-4z" fill="black" /></g>
  </svg>
`;


build();

