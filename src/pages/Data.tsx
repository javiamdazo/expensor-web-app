import { useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { downloadCsv, exportStateToCsv, parseCsvToState } from '../lib/csv';
import { Card, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

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
    if (
      confirm(
        'Esto borrará TODOS los casos, presupuestos e histórico guardados en este navegador. ¿Continuar?',
      )
    ) {
      replaceState({ cases: [], activeCaseId: null, history: [] });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[22px] font-extrabold">Datos</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Todo se guarda automáticamente en este navegador. Exporta a CSV para hacer copia de
          seguridad, moverlo a otro dispositivo o editarlo en Excel/Sheets.
        </p>
      </div>

      <Card>
        <CardTitle>Exportar</CardTitle>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Descarga un único CSV con todos tus casos, presupuestos e histórico.
        </p>
        <Button variant="primary" className="mt-3.5" onClick={handleExport}>
          Descargar CSV
        </Button>
      </Card>

      <Card>
        <CardTitle>Importar</CardTitle>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Carga un CSV exportado previamente para restaurar tus datos. Sustituye todo lo que haya
          en este navegador ahora mismo.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button variant="secondary" className="mt-3.5" onClick={handleImportClick}>
          Elegir archivo CSV
        </Button>
        {importSummary && <p className="mt-3 text-sm text-positive">{importSummary}</p>}
        {importErrors.length > 0 && (
          <ul className="mt-3 list-inside list-disc text-sm text-negative">
            {importErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle>Restablecer</CardTitle>
        <div className="mt-3.5 flex gap-3">
          <Button variant="secondary" onClick={handleResetSeed}>
            Cargar datos de ejemplo
          </Button>
          <Button variant="destructive" onClick={handleWipe}>
            Borrar todos los datos
          </Button>
        </div>
      </Card>
    </div>
  );
}
