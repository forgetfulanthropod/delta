import { AppRegistry } from 'react-native';
import App from './App';
import './src/index.css';

AppRegistry.registerComponent('delta', () => App);
AppRegistry.runApplication('delta', {
  rootTag: document.getElementById('root'),
});