var supportsES6 = (function () { try { new Function('(a=0)=>a'); return true } catch (e) { console.log('No ES6'); return false } }());


    var supportsLocalStorage = (function () { try { var m = new Date().valueOf() + ""; localStorage.setItem(m, m); localStorage.removeItem(m); return true } catch (e) { console.log("localStorage unavailable"); return false } }());


    // Adds a mode toggle button, containing an SVG, to the HTML 
    var Dark_Light_Mode_Toggle_Button = (function (window, document, supportsES6, supportsLocalStorage) {

      if (!supportsES6) return;

      const name = 'mode';
      const btnClass = 'actions_btn-' + name;
      const svgClass = 'actions_svg-' + name;
      const clickedClass = '-js-clicked';
      const [light, dark] = ['light', 'dark'];
      const body = document.body;
      const btn = document.createElement('button');

      const lightLink = document.getElementById("light-mode-theme");
      const darkLink = document.getElementById("dark-mode-theme");

      let mode;

      const _setAttr = (obj, attr, value) => obj.setAttribute(attr, value);
      const _modeText = bool => bool ? light : dark;
      const _animEnd = e => btn.classList.remove(clickedClass);

      const _clicked = _ => {

        _setAttr(btn, 'aria-clicked', btn.getAttribute('aria-clicked') === 'false');

        mode = mode === false;
        body.style.colorScheme = _modeText(mode); // Ignored where unsupported
        _setAttr(body, 'data-lightMode', _modeText(mode));
        _setAttr(btn, 'aria-label', `Change to ${_modeText(!mode)} mode`);
        supportsLocalStorage && localStorage.setItem('mode', _modeText(mode));
        btn.classList.add(clickedClass);
        btn.addEventListener('animationend', _animEnd, { once: true });

        console.log(mode);
        if (mode) {
          console.log("light");
          darkLink.href = "";
          lightLink.href = "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-solarizedlight.min.css";
          document.body.style.setProperty('--backbg', "#EFF6EE");
          document.body.style.setProperty('--bg', "#fdf6e3");
          document.body.style.setProperty('--green', "#508484");
          document.body.style.setProperty('--text', "#151515");
          document.body.style.setProperty('--link-hover', "#80D1D1");
          document.body.style.setProperty('--link-visited', "#325252");
        }
        else {
          console.log("dark");
          darkLink.href = "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css";
          lightLink.href = "";
          document.body.style.setProperty('--backbg', "#222222");
          document.body.style.setProperty('--bg', "#2D2D2D");
          document.body.style.setProperty('--green', "#6BAB90");
          document.body.style.setProperty('--text', "#FFF8E8");
          document.body.style.setProperty('--link-hover', "#80D1D1");
          document.body.style.setProperty('--link-visited', "#2ED1D1");

        }

      };

      const _getSvg = _ => `<svg class="${svgClass}" aria-hidden=true focusable=false viewbox="0 0 960 960">
  <g class="${name}-${light}">
    <circle cx="476" cy="480" r="458" fill-opacity=".25"/>
    <path d="M382 33C82 91-118 488 115 767c186 223 492 255 716 9a515 515 0 01-421-243c-94-157-56-368-28-500z"/>
  </g>
  <g class="${name}-${dark}">
    <circle cx="479.5" cy="480.5" r="242"/>
    <path d="M480 800c22 0 40 18 40 40v80a40 40 0 01-80 0v-80c0-22 18-40 40-40zm480-320c0 22-18 40-40 40h-80a40 40 0 010-80h80c22 0 40 18 40 40zM706 763l57 56a40 40 0 1056-56l-56-57a40 40 0 10-57 57zm-509 56l57-56a40 40 0 10-57-57l-56 57a40 40 0 1056 56zm-77-379a40 40 0 010 80H40a40 40 0 010-80h80zm21-243l56 57a40 40 0 1057-57l-57-56a40 40 0 10-56 56zm622 57l56-57a40 40 0 10-56-56l-57 56a40 40 0 1057 57zM440 40v80a40 40 0 0080 0V40a40 40 0 00-80 0z"/>
  </g>
</svg>`;


      const _getMode = _ => {

        // Get the OS mode setting
        mode = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? false : true;

        // Override OS mode with the locally stored value.
        // Caters to state persistence across pages and visits.
        if (supportsLocalStorage && 'mode' in localStorage) {
          mode = localStorage.getItem('mode') === 'light';
        }
      };


      const _init = _ => {

        _getMode();

        // color-scheme cannot be set with CSS variable
        // Ignored where unsupported
        body.style.colorScheme = _modeText(mode);

        _setAttr(body, 'data-lightMode', _modeText(mode));
        _setAttr(btn, 'class', btnClass);
        // _setAttr(btn, 'aria-pressed', false);
        _setAttr(btn, 'role', 'switch');
        _setAttr(btn, 'aria-clicked', false);
        _setAttr(btn, 'aria-label', `Change to ${_modeText(!mode)} mode`);

        btn.innerHTML = _getSvg();
        btn.addEventListener('click', _clicked);

        // Note: Button is added at the end of the HTML to avoid preceding an accessibility skip-to-content link.
        // Skip-to-content links should always be the first actionable asset on a web page.
        document.getElementById('actions-container').appendChild(btn);

        if (mode) {
          console.log("light");
          darkLink.href = "";
          lightLink.href = "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-solarizedlight.min.css";
          document.body.style.setProperty('--backbg', "#EFF6EE");
          document.body.style.setProperty('--bg', "#fdf6e3");
          document.body.style.setProperty('--green', "#508484");
          document.body.style.setProperty('--text', "#151515");
          document.body.style.setProperty('--link-hover', "#80D1D1");
          document.body.style.setProperty('--link-visited', "#325252");
        }
        else {
          console.log("dark");
          darkLink.href = "https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css";
          lightLink.href = "";
          document.body.style.setProperty('--backbg', "#222222");
          document.body.style.setProperty('--bg', "#2D2D2D");
          document.body.style.setProperty('--green', "#6BAB90");
          document.body.style.setProperty('--text', "#FFF8E8");
          document.body.style.setProperty('--link-hover', "#9CF7D1");
          document.body.style.setProperty('--link-visited', "#4C7865");

        }

      };

      _init();

    }(window, document, supportsES6, supportsLocalStorage));

// Includes used:
// Prism highlighting: https://codepen.io/2kool2/pen/MEbeEg
