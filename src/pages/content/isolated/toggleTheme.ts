import exampleThemeStorage from '@root/src/shared/storages/themeStorage';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';

refreshOnUpdate('pages/content/isoloated/toggleTheme');

async function toggleTheme() {
  console.log('initial theme!', await exampleThemeStorage.get());
  await exampleThemeStorage.toggle();
  console.log('toggled theme', await exampleThemeStorage.get());
}

void toggleTheme();
