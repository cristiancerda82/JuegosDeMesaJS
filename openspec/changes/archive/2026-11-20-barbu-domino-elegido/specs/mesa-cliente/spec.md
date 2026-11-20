## ADDED Requirements

### Requirement: Dominó del Barbu con el número elegido en el cliente
Las opciones del Barbu MUST tener la casilla «Dominó: elige el número», desactivada por defecto, en local y al crear una sala en red. La guía del Barbu MUST explicar la variante y decir que se activa con esa opción.

Con la opción, la mesa MUST:
- ofrecer al repartidor que elige el dominó un botón por número, del 2 al As;
- avisar a los demás de que está eligiendo;
- abrir las filas del dominó en el número elegido;
- decir en el contrato con qué número se empieza.

#### Scenario: Elegir el número en la mesa
- **WHEN** con la opción el jugador reparte, elige el dominó y toca el 7
- **THEN** el contrato dice que el número de salida es el 7, y en su mano solo se pueden jugar los sietes

#### Scenario: La variante en la guía
- **WHEN** el jugador abre la guía del Barbu
- **THEN** ve explicado que quien reparte elige el número del dominó y que se activa en las opciones
