import { mount } from 'svelte';
import App from './App.svelte';
import { temas } from './cartas/tema.svelte';
import { pwa } from './pwa/registro.svelte';
import './estilos.css';

const destino = document.getElementById('app');
if (destino === null) throw new Error('Falta el elemento #app');

pwa.iniciar();

// Los temas de naipes guardados se cargan antes de montar, para que las cartas no aparezcan
// primero en Minimal y cambien después; como mucho se esperan 300 ms (design, decisión 5).
await temas.precargar(300);

export default mount(App, { target: destino });
