<script lang="ts">
  import type { IdCarta } from '@juegos/engine';
  import Carta from '../../cartas/Carta.svelte';
  import { T } from '../../textos';

  interface Props {
    /** Cartas boca abajo (sin contar la muestra). */
    mazo: number;
    muestra: IdCarta | null;
    /** Texto bajo la muestra en vez de la cuenta del mazo (el Whist no tiene mazo). */
    rotulo?: string | null;
  }

  let { mazo, muestra, rotulo = null }: Props = $props();
</script>

<div class="mazo" data-zona="mazo">
  {#if muestra !== null}
    <div class="muestra" data-carta={muestra} data-testid="muestra" title={T.brisca.muestra}>
      <Carta id={muestra} />
    </div>
  {/if}
  {#if mazo > 0}
    <div class="monton"><Carta /></div>
  {/if}
  <span class="cuenta" data-testid="cartas-mazo">
    {rotulo ?? T.brisca.enMazo(mazo + (muestra === null ? 0 : 1))}
  </span>
</div>

<style>
  .mazo {
    position: relative;
    flex: none;
    width: calc(var(--ancho-carta) * var(--escala-mazo, 0.8));
    height: calc(var(--alto-carta) * var(--escala-mazo, 0.8));
    margin-left: calc(var(--ancho-carta) * 0.25);
  }

  .muestra {
    position: absolute;
    width: 100%;
    height: 100%;
    left: calc(var(--ancho-carta) * -0.3);
    /* `rotate` y no `transform`, que queda libre para las animaciones FLIP. */
    rotate: -90deg;
  }

  .monton {
    position: absolute;
    inset: 0;
  }

  .cuenta {
    position: absolute;
    top: 100%;
    left: -30%;
    right: -30%;
    margin-top: 6px;
    text-align: center;
    font-size: 0.75rem;
    color: var(--texto-suave);
  }
</style>
