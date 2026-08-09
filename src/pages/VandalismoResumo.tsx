import * as React from "react";

export default function VandalismoResumo() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Resumo de Atividades</h1>
      <p className="text-muted-foreground">
        No checklist, essa opção deve aparecer apenas se o gps falhar
      </p>
    </div>
  );
}