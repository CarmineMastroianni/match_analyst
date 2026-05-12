import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Upload, Download } from "lucide-react";

const TEMPLATE_CSV = `firstName,lastName,birthDate,sex,hand,category,team
Mario,Rossi,2003-04-12,M,R,Senior,CS Fiamme Oro M
Giulia,Bianchi,2006-09-30,F,L,U20,Pro Patria Scherma F
`;

export function ImportExcelPage() {
  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scherma_atleti_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <h1 className="font-cond font-bold uppercase text-[40px] leading-none mb-6">
        Import Excel
      </h1>
      <Card accent="red">
        <div className="border-2 border-dashed border-border-light p-12 text-center">
          <Upload size={32} className="mx-auto text-text-dark-dim" />
          <div className="font-cond font-bold uppercase text-lg mt-3">
            Trascina qui il file
          </div>
          <div className="text-sm text-text-dark-dim mt-1">
            Formato accettato: CSV/XLSX (parser non implementato in MVP demo)
          </div>
          <div className="flex justify-center gap-2 mt-6">
            <Button onClick={downloadTemplate} icon={<Download size={14} />}>
              Scarica template CSV
            </Button>
            <Button variant="ghost" disabled>
              Carica file
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
