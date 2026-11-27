<script lang="ts">
  import type { ResultadoManoCirulla } from '@juegos/engine';
  import { T } from '../textos';
  import ResumenScopa from './ResumenScopa.svelte';

  interface Props {
    resultado: ResultadoManoCirulla;
    /** Nombres de los dos bandos. */
    lados: readonly [string, string];
    /** Bando del jugador: sus valores van en la primera columna. */
    bando: 0 | 1;
  }

  let { resultado, lados, bando }: Props = $props();

  const extras = $derived([
    {
      concepto: T.cirulla.grande,
      detalle: (b: 0 | 1) => (resultado.puntos[b].grande > 0 ? '✓' : '–'),
      puntos: (b: 0 | 1) => resultado.puntos[b].grande,
    },
    {
      concepto: T.cirulla.pequena,
      detalle: (b: 0 | 1) => (resultado.puntos[b].pequena > 0 ? '✓' : '–'),
      puntos: (b: 0 | 1) => resultado.puntos[b].pequena,
    },
  ]);
</script>

<ResumenScopa
  {resultado}
  {lados}
  {bando}
  nombreScopas={T.cirulla.escobas}
  {extras}
  testid="resumen-cirulla"
/>
{#if resultado.todosLosOros !== null}
  <p class="oros" data-testid="todos-los-oros">
    {T.cirulla.todosLosOros(lados[resultado.todosLosOros === bando ? 0 : 1]!)}
  </p>
{/if}

<style>
  .oros {
    margin: 8px 0 0;
    font-weight: 700;
    color: var(--acento);
  }
</style>
