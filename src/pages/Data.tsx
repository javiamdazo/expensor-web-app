import { useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { downloadCsv, exportStateToCsv, parseCsvToState } from '../lib/csv';
import { buttonDangerClass, buttonPrimaryClass, buttonSecondaryClass, cardClass } from '../lib/ui';

export function Data() {
  const cases = useAppStore((s) => s.cases);
  const activeCaseId = useAppStore((s) => s.activeCaseId);
  const history = useAppStore((s) => s.history);
  const state = { cases, activeCaseId, history };
  const replaceState = useAppStore((s) => s.replaceState);
  const resetToSeed = useAppStore((s) => s.resetToSeed);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSummary, setImportSummary] = useState<string | null>(null);

  function handleExport() {
    const csv = exportStateToCsv(state);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(csv, `expensor-${date}.csv`);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const text = await file.text();
    const { state: parsedState, errors } = parseCsvToState(text);
    setImportErrors(errors);

    if (parsedState.cases.length === 0) {
      setImportSummary(null);
      return;
    }

    const proceed = confirm(
      `Se importarán ${parsedState.cases.length} caso(s) y ${parsedState.history.length} entrada(s) de histórico. ` +
        'Esto reemplazará todos los datos actuales guardados en este navegador. ¿Continuar?',
    );
    if (!proceed) return;

    replaceState(parsedState);
    setImportSummary(
      `Importado: ${parsedState.cases.length} caso(s), ${parsedState.history.length} entrada(s) de histórico.`,
    );
  }

  function handleResetSeed() {
    if (confirm('Esto sustituirá tus datos actuales por los datos de ejemplo. ¿Continuar?')) {
      resetToSeed();
    }
  }

  function handleWipe() {
    if (confirm('Esto borrará TODOS los casos, presupuestos e histórico guardados en este navegador. ¿Continuar?')) {
      replaceState({ cases: [], activeCaseId: null, history: [] });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Datos</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Todo se guarda automáticamente en el <code>localStorage</code> de este
          navegador, en este dispositivo. Exporta a CSV para hacer copia de
          seguridad, moverlo a otro dispositivo o editarlo en Excel/Sheets.
        </p>
      </div>

      <section className={cardClass}>
        <h2 className="mb-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          Exportar
        </h2>
        <p className="mb-3 text-sm text-neutral-500">
          Descarga un único CSV con todos tus casos, presupuestos e histórico.
        </p>
        <button className={buttonPrimaryClass} type="button" onClick={handleExport}>
          Descargar CSV
        </button>
      </section>

      <section className={cardClass}>
        <h2 className="mb-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          Importar
        </h2>
        <p className="mb-3 text-sm text-neutral-500">
          Carga un CSV exportado previamente (o editado a mano) para restaurar tus
          datos. Sustituye todo lo que haya en este navegador ahora mismo.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <button className={buttonSecondaryClass} type="button" onClick={handleImportClick}>
          Elegir archivo CSV
        </button>
        {importSummary && <p className="mt-3 text-sm text-[#0ca30c]">{importSummary}</p>}
        {importErrors.length > 0 && (
          <ul className="mt-3 list-inside list-disc text-sm text-[#d03b3b]">
            {importErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
      </section>

      <section className={cardClass}>
        <h2 className="mb-2 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          Restablecer
        </h2>
        <div className="flex flex-wrap gap-2">
          <button className={buttonSecondaryClass} type="button" onClick={handleResetSeed}>
            Cargar datos de ejemplo
          </button>
          <button className={buttonDangerClass} type="button" onClick={handleWipe}>
            Borrar todos los datos
          </button>
        </div>
      </section>
    </div>
  );
}
