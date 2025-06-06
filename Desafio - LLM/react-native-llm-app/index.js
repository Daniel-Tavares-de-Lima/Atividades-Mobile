import { AppRegistry } from 'react-native';
import App from './app';
import { name as appName } from './package.json';
import { registerRootComponent } from 'expo';

AppRegistry.registerComponent(appName, () => App);
registerRootComponent(App);