<script lang="ts">
  import { atascado } from '@juegos/engine';
  import { T } from '../textos';

  interface Props {
    /** Acciones legales del jugador en la partida en curso. */
    legales: readonly { readonly tipo: string }[];
    terminada: boolean;
    deshacer: () => void;
    abandonar: () => void;
  }

  let { legales, terminada, deshacer, abandonar }: Props = $props();

  const puedeDeshacer = $derived(legales.some((a) => a.tipo === 'deshacer'));
  // Sin acciones legales también puede ser una pausa: solo cuenta si se puede abandonar.
  const visible = $derived(
    !terminada && legales.some((a) => a.tipo === 'abandonar') && atascado(legales),
  );
</script>

{#if visible}
  <div class="atasco" role="alert" data-testid="atasco">
    <p>{T.partida.atasco}</p>
    <div class="botones">
      {#if puedeDeshacer}
        <button onclick={deshacer}>{T.partida.deshacer}</button>
      {/if}
      <button class="principal" onclick={abandonar}>{T.partida.abandonar}</button>
    </div>
  </div>
{/if}

<style>
  .atasco {
    position: fixed;
    left: 50%;
    bottom: 16px;
    translate: -50% 0;
    width: min(calc(100% - 32px), 420px);
    padding: 12px 16px;
    border-radius: 14px;
    text-align: center;
    background: var(--tapete-oscuro);
    border: 1px solid rgb(255 255 255 / 0.25);
    box-shadow: var(--sombra-alta);
    z-index: 1200;
  }

  .atasco p {
    margin: 0 0 10px;
    font-weight: 700;
  }

  .botones {
    display: flex;
    justify-content: center;
    gap: 10px;
  }
</style>
