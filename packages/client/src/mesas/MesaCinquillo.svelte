<script lang="ts">
  import {
    ORDEN_CINQUILLO,
    type AccionCinquillo,
    type Asiento,
    type ConfigCinquillo,
    type EstadoCinquillo,
    type VistaCinquillo,
  } from '@juegos/engine';
  import type { SesionMesa } from '../sesion/sesion-mesa';
  import { T } from '../textos';
  import MesaEscaleras from './escaleras/MesaEscaleras.svelte';

  interface Props {
    sesion: SesionMesa<ConfigCinquillo, EstadoCinquillo, AccionCinquillo, VistaCinquillo>;
  }

  let { sesion }: Props = $props();

  const vista = $derived(sesion.vista);

  const detalle = (asiento: Asiento) => [
    T.cinquillo.cartas(vista.cartasEnMano[asiento] ?? 0),
    T.cinquillo.puntos(vista.totales[asiento] ?? 0),
  ];
</script>

<MesaEscaleras
  {sesion}
  orden={ORDEN_CINQUILLO}
  inicial={5}
  {detalle}
  salida={T.cinquillo.salidaOros}
  pasa={T.cinquillo.pasa}
>
  {#snippet resumen(i: number, nombre: (asiento: Asiento) => string)}
    {@const r = vista.resultadosManos[i]!}
    <p class="gana" data-testid="gana-mano">{T.cinquillo.ganaMano(nombre(r.ganador))}</p>
    <table>
      <thead>
        <tr>
          <th></th>
          <th scope="col">{T.cinquillo.quedan}</th>
          <th scope="col">{T.cinquillo.totalPartida}</th>
        </tr>
      </thead>
      <tbody>
        {#each r.cartasRestantes as quedan, a (a)}
          <tr class:ganador={a === r.ganador}>
            <th scope="row">{nombre(a)}</th>
            <td data-testid="quedan-{a}">{T.cinquillo.cartas(quedan)}</td>
            <td>{r.totalesTras[a]}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/snippet}
</MesaEscaleras>

<style>
  .gana {
    margin: 0 0 8px;
    font-weight: 700;
    color: var(--acento);
  }

  table {
    margin: 0 auto;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 3px 10px;
  }

  thead th {
    color: var(--texto-suave);
    font-size: 0.85rem;
    font-weight: 600;
  }

  tbody th {
    text-align: left;
    font-weight: 500;
  }

  td {
    text-align: center;
    font-weight: 700;
  }

  tr.ganador td,
  tr.ganador th {
    color: var(--acento);
  }
</style>
