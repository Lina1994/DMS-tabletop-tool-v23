import { useState, useEffect } from 'react';

/**
 * Hook de debounce para retrasar la ejecución de una acción.
 * @param {any} value El valor a "debouncear".
 * @param {number} delay El tiempo de retraso en milisegundos.
 * @returns {any} El valor "debounceado".
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Establece un temporizador para actualizar el valor debounceado
    // después del tiempo de delay especificado.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpia el temporizador si el valor cambia (o si el componente se desmonta).
    // Esto evita que el valor se actualice si el usuario sigue escribiendo.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo se vuelve a ejecutar si el valor o el delay cambian

  return debouncedValue;
};

export default useDebounce;
