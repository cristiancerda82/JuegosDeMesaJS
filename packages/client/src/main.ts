import { mount } from 'svelte';
import App from './App.svelte';
import './estilos.css';

const destino = document.getElementById('app');
if (destino === null) throw new Error('Falta el elemento #app');

export default mount(App, { target: destino });
