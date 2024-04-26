import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import initProflie from './init';
import handler from './handler';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
// reloadOnUpdate('pages/content/style.scss');

console.log('background loaded');

chrome.runtime.onInstalled.addListener(async details => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    await initProflie();
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'src/pages/ui/index.html' });
});

void handler();
