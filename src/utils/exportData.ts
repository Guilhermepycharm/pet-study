import { MODULES } from '../data/modules';
import { REVIEW_STAGES } from '../types';

export interface ExportData {
  completedTopics: Record<string, string>;
  reviewsDone: Record<string, string>;
  dailyStudyLog: Record<string, number>;
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportStudyCSV(data: ExportData): void {
  const topicRows: string[] = ['Matéria,Módulo,Tópico,Status,Revisões'];

  for (const mod of MODULES) {
    for (let i = 0; i < mod.items.length; i++) {
      const key = `${mod.id}__${i}`;
      const completedDate = data.completedTopics[key];
      const status = completedDate ? 'Concluído' : 'Pendente';

      const completedStages = REVIEW_STAGES
        .filter(stage => data.reviewsDone[`${key}__${stage.key}`])
        .map(stage => stage.key);
      const reviewLabel = completedStages.length > 0 ? completedStages.join('+') : 'Nenhuma';

      topicRows.push([
        escapeCSV(mod.subject),
        escapeCSV(mod.title),
        escapeCSV(mod.items[i]),
        status,
        reviewLabel,
      ].join(','));
    }
  }

  const logRows: string[] = ['Data,Minutos Estudados'];
  const sortedDates = Object.keys(data.dailyStudyLog).sort();

  for (const date of sortedDates) {
    const minutes = Math.round(data.dailyStudyLog[date] / 60);
    logRows.push(`${date},${minutes}`);
  }

  const csv = `${topicRows.join('\n')}\n\n${logRows.join('\n')}`;
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const filename = `pet-study-export-${new Date().toISOString().split('T')[0]}.csv`;

  downloadBlob(blob, filename);
}
