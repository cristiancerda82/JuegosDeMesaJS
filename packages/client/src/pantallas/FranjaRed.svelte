<script lang="ts">
  import type { InfoRed } from '../sesion/sesion-mesa';
  import { T } from '../textos';

  interface Props {
    red: InfoRed;
    asiento: number;
    reconectando: boolean;
  }

  let { red, asiento, reconectando }: Props = $props();

  /** Estado de un asiento: conectado, desconectado, jugado por la IA o de la IA. */
  function estado(i: number): { texto: string; clase: string } {
    const a = red.asientos[i];
    if (!a) return { texto: T.red.ia, clase: 'ia' };
    if (a.relevado) return { texto: T.red.relevado, clase: 'ia' };
    if (!a.conectado) return { texto: T.red.desconectado, clase: 'off' };
    return { texto: T.red.conectado, clase: 'on' };
  }
</script>

<div class="franja" data-testid="franja-red">
  <span class="codigo">{T.red.sala(red.codigo)}</span>
  {#each red.asientos as a, i (i)}
    {@const e = estado(i)}
    <span class="jugador {e.clase}" class:mio={i === asiento} data-testid="jugador-{i}" title={e.texto}>
      <span class="punto" aria-hidden="true"></span>
      {a?.nombre ?? T.red.ia}
      <span class="sr">({e.texto})</span>
    </span>
  {/each}
  {#if reconectando}
    <span class="aviso" role="status">{T.red.reconectando}</span>
  {/if}
</div>

<style>
  .franja {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px 10px;
    padding: 2px 8px 4px;
    font-size: 0.8rem;
    color: var(--texto-suave);
  }

  .codigo {
    font-weight: 700;
    letter-spacing: 0.1em;
  }

  .jugador {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .jugador.mio {
    color: var(--texto);
    font-weight: 600;
  }

  .punto {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #6c6;
  }

  .off .punto {
    background: var(--peligro);
  }

  .ia .punto {
    background: #999;
  }

  /* El estado se lee en voz alta; a la vista basta el color del punto. */
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .aviso {
    flex-basis: 100%;
    text-align: center;
    color: var(--acento);
  }
</style>
