import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('delta', () => App);
AppRegistry.runApplication('delta', {
  rootTag: document.getElementById('root'),
});