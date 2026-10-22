<script lang="ts">
  import {
    borrarEstadisticas,
    leerEstadisticas,
    type Estadisticas,
  } from '../estadisticas/estadisticas';
  import { formatoTiempo } from '../mesas/tiempo';
  import { ID_JUEGOS, JUEGOS } from '../sesion/juegos';
  import { T } from '../textos';

  interface Props {
    volver: () => void;
  }

  let { volver }: Props = $props();

  let estadisticas: Estadisticas = $state(leerEstadisticas());

  const jugados = $derived(
    ID_JUEGOS.flatMap((id) => {
      const e = estadisticas[id];
      return e && e.jugadas > 0 ? [{ id, e }] : [];
    }),
  );
  const total = $derived(
    jugados.reduce(
      (s, { e }) => ({ jugadas: s.jugadas + e.jugadas, ganadas: s.ganadas + e.ganadas }),
      { jugadas: 0, ganadas: 0 },
    ),
  );
  const porcentaje = (ganadas: number, jugadas: number) =>
    jugadas === 0 ? 0 : Math.round((100 * ganadas) / jugadas);

  function borrar() {
    if (!confirm(T.estadisticas.confirmarBorrar)) return;
    borrarEstadisticas();
    estadisticas = leerEstadisticas();
  }
</script>

<main class="estadisticas">
  <header>
    <button onclick={volver} data-testid="volver">← {T.opciones.volver}</button>
    <h1>{T.estadisticas.titulo}</h1>
  </header>

  {#if jugados.length === 0}
    <p class="vacio" data-testid="sin-estadisticas">{T.estadisticas.vacio}</p>
  {:else}
    <p class="total" data-testid="total">
      {T.estadisticas.total(total.jugadas, total.ganadas, porcentaje(total.ganadas, total.jugadas))}
    </p>

    <ul class="tarjetas">
      {#each jugados as { id, e } (id)}
        <li class="tarjeta" data-testid="estadisticas-{id}">
          <h2>{JUEGOS[id].nombre}</h2>
          <dl>
            <div><dt>{T.estadisticas.jugadas}</dt><dd data-testid="jugadas">{e.jugadas}</dd></div>
            <div><dt>{T.estadisticas.ganadas}</dt><dd data-testid="ganadas">{e.ganadas}</dd></div>
            {#if e.empatadas > 0}
              <div><dt>{T.estadisticas.empatadas}</dt><dd>{e.empatadas}</dd></div>
            {/if}
            <div><dt>{T.estadisticas.perdidas}</dt><dd data-testid="perdidas">{e.perdidas}</dd></div>
            <div>
              <dt>{T.estadisticas.victorias}</dt>
              <dd data-testid="porcentaje">{porcentaje(e.ganadas, e.jugadas)} %</dd>
            </div>
            <div><dt>{T.estadisticas.racha}</dt><dd data-testid="racha">{e.racha}</dd></div>
            <div><dt>{T.estadisticas.mejorRacha}</dt><dd data-testid="mejor-racha">{e.mejorRacha}</dd></div>
            {#if e.mejorTiempoMs !== null}
              <div>
                <dt>{T.estadisticas.mejorTiempo}</dt>
                <dd data-testid="mejor-tiempo">{formatoTiempo(e.mejorTiempoMs)}</dd>
              </div>
            {/if}
            {#if e.menosMovimientos !== null}
              <div>
                <dt>{T.estadisticas.menosMovimientos}</dt>
                <dd data-testid="menos-movimientos">{e.menosMovimientos}</dd>
              </div>
            {/if}
            {#if e.mejorPuntuacion !== null}
              <div>
                <dt>{T.estadisticas.mejorPuntuacion}</dt>
                <dd data-testid="mejor-puntuacion">{e.mejorPuntuacion}</dd>
              </div>
            {/if}
          </dl>
        </li>
      {/each}
    </ul>

    <button class="borrar" onclick={borrar} data-testid="borrar-estadisticas">
      {T.estadisticas.borrar}
    </button>
  {/if}
</main>

<style>
  .estadisticas {
    width: min(100%, 860px);
    margin: 0 auto;
    padding: 8px 16px 32px;
  }

  header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  h1 {
    font-size: 1.4rem;
  }

  .vacio,
  .total {
    color: var(--texto-suave);
  }

  .tarjetas {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
    gap: 12px;
    margin: 12px 0 20px;
    padding: 0;
    list-style: none;
  }

  .tarjeta {
    padding: 12px 14px;
    border-radius: 14px;
    background: rgb(0 0 0 / 0.18);
    border: 1px solid rgb(255 255 255 / 0.12);
  }

  .tarjeta h2 {
    font-size: 1.1rem;
    margin-bottom: 6px;
  }

  dl {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 12px;
    margin: 0;
  }

  dl div {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  dt {
    color: var(--texto-suave);
    font-size: 0.85rem;
  }

  dd {
    margin: 0;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .borrar {
    display: block;
    margin: 0 auto;
  }
</style>
