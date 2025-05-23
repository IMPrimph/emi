// Utility to sync MUI theme mode with body[data-theme] for CSS overrides
export function setBodyTheme(mode) {
  if (typeof document !== 'undefined') {
    document.body.setAttribute('data-theme', mode);
  }
}
