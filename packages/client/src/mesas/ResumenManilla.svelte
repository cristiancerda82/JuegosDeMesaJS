<script lang="ts">
  import { valorPinte, type ResultadoManoManilla } from '@juegos/engine';
  import { nombreCarta } from '../cartas/dibujo';
  import { T } from '../textos';

  interface Props {
    resultado: ResultadoManoManilla;
    /** Nombre de cada pareja: la del jugador primero. */
    lados: readonly [string, string];
    /** Pareja del jugador: sus valores van en la primera columna. */
    bando?: number;
  }

  let { resultado, lados, bando = 0 }: Props = $props();

  /** Índices de las parejas en el orden de las columnas. */
  const [a, b] = $derived(bando === 0 ? [0, 1] : [1, 0]);

  const cartas = $derived(resultado.puntos.map((p, i) => p - resultado.bazas[i]!));
  const repartidora = $derived(resultado.repartidor % 2);
  const valor = $derived(valorPinte(resultado.pinte));
  const pinte = $derived([0, 1].map((p) => (p === repartidora && resultado.pinteAnotado ? valor : 0)));
  /** La pareja que reparte, dentro de una frase. */
  const pareja = $derived(repartidora === bando ? T.mus.nosotrosEn : T.mus.ellosEn);
  const nota = $derived.by(() => {
    const carta = nombreCarta(resultado.pinte);
    if (valor === 0) return T.manilla.pinteSinValor(carta);
    return resultado.pinteAnotado
      ? T.manilla.pinteAnotado(carta, valor, pareja)
      : T.manilla.pinteDecisivo(carta, pareja);
  });
</script>

<p class="pinte" data-testid="resumen-pinte">{nota}</p>
<table class="resumen" data-testid="resumen-manilla">
  <thead>
    <tr>
      <th scope="col">{T.butifarra.concepto}</th>
      <th scope="col">{lados[0]}</th>
      <th scope="col">{lados[1]}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">{T.butifarra.cartas}</th>
      <td>{cartas[a!]}</td>
      <td>{cartas[b!]}</td>
    </tr>
    <tr>
      <th scope="row">{T.butifarra.bazas}</th>
      <td>{resultado.bazas[a!]}</td>
      <td>{resultado.bazas[b!]}</td>
    </tr>
    <tr class="total">
      <th scope="row">{T.butifarra.totalMano}</th>
      <td data-testid="mano-0">{resultado.puntos[a!]}</td>
      <td data-testid="mano-1">{resultado.puntos[b!]}</td>
    </tr>
    <tr>
      <th scope="row">{T.manilla.pinteFila}</th>
      <td>{pinte[a!]}</td>
      <td>{pinte[b!]}</td>
    </tr>
    <tr class="total">
      <th scope="row">{T.butifarra.anotados}</th>
      <td data-testid="anotados-0">{resultado.anotados[a!]}</td>
      <td data-testid="anotados-1">{resultado.anotados[b!]}</td>
    </tr>
    <tr class="total">
      <th scope="row">{T.butifarra.totalPartida}</th>
      <td data-testid="total-0">{resultado.totalesTras[a!]}</td>
      <td data-testid="total-1">{resultado.totalesTras[b!]}</td>
    </tr>
  </tbody>
</table>

<style>
  .pinte {
    margin: 0 0 8px;
    font-weight: 600;
  }

  .resumen {
    width: 100%;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  th,
  td {
    padding: 4px 6px;
  }

  thead th {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--texto-suave);
  }

  tbody th {
    text-align: left;
    font-weight: 500;
  }

  td {
    text-align: center;
  }

  .total th,
  .total td {
    font-weight: 700;
  }
</style>
