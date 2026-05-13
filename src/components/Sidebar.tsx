import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  CheckCircle2, 
  Circle,
  Search,
  Download,
  Upload,
  Terminal
} from 'lucide-react';
import { MODULES, Module } from '../data/modules';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  completedTopics: Record<string, string>;
  toggleTopic: (moduleId: string, topicIndex: number) => void;
  moduleProgress: Record<string, { completed: number; total: number; pct: number }>;
  applySecretCode?: (code: string) => string;
}

const AREAS = [
  { id: 'matematica', label: 'Matemática', subjects: ['Matemática'] },
  { id: 'naturezas', label: 'Ciências da Natureza', subjects: ['Biologia', 'Física', 'Química'] },
  { id: 'linguagens', label: 'Linguagens', subjects: ['Português', 'Literatura', 'Redação'] },
  { id: 'humanas', label: 'Ciências Humanas', subjects: ['História', 'Geografia', 'Filosofia', 'Sociologia'] }
];

export function Sidebar({ isOpen, onClose, completedTopics, toggleTopic, moduleProgress, applySecretCode }: SidebarProps) {
  const [expandedAreas, setExpandedAreas] = useState<string[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rescueMode, setRescueMode] = useState<'none' | 'export' | 'import' | 'debug'>('none');
  const [rescueCode, setRescueCode] = useState('');
  const [debugCode, setDebugCode] = useState('');

  const toggleArea = (id: string) => {
    setExpandedAreas(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const toggleSubject = (s: string) => {
    setExpandedSubjects(prev => prev.includes(s) ? prev.filter(a => a !== s) : [...prev, s]);
  };

  const filteredModules = (subject: string) => {
    return MODULES.filter(m => m.subject === subject && 
      (m.title.toLowerCase().includes(searchTerm.toLowerCase()) || subject.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const handleGenerateCode = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('enem-')) {
        data[key] = localStorage.getItem(key) || '';
      }
    }
    const jsonString = JSON.stringify(data);
    const base64 = btoa(encodeURIComponent(jsonString));
    setRescueCode(base64);
    setRescueMode('export');
  };

  const copyRescueCode = async () => {
    try {
      await navigator.clipboard.writeText(rescueCode);
      alert('Seu Código de Resgate foi copiado com sucesso! Guarde-o em um bloco de notas ou WhatsApp.');
      setRescueMode('none');
    } catch {
      alert('Erro ao copiar automaticamente. Por favor, selecione e copie o código manualmente.');
    }
  };

  const handleImportMode = () => {
    setRescueCode('');
    setRescueMode('import');
  };

  const confirmImport = () => {
    if (!rescueCode.trim()) {
      alert('Por favor, cole um código válido.');
      return;
    }
    try {
      const jsonString = decodeURIComponent(atob(rescueCode.trim()));
      const data = JSON.parse(jsonString);
      
      if (confirm('ATENÇÃO: Esse código vai DESTRUIR seu progresso atual e substituir pelo do código. Prosseguir?')) {
        let importedCount = 0;
        for (const key in data) {
          if (key.startsWith('enem-')) {
            localStorage.setItem(key, data[key]);
            importedCount++;
          }
        }
        if (importedCount > 0) {
          alert('Pet resgatado com sucesso! A página será recarregada.');
          window.location.reload();
        } else {
          alert('Este código parece vazio.');
        }
      }
    } catch (e) {
      alert('Código inválido ou corrompido! Verifique se você não cortou nenhuma letra.');
    }
  };

  const handleApplyDebugCode = () => {
    if (!applySecretCode) return;
    if (!debugCode.trim()) {
      alert('Digite um código de teste válido.');
      return;
    }
    const message = applySecretCode(debugCode);
    alert(message);
    setDebugCode('');
    if (message !== 'Código inválido.') {
      setRescueMode('none');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-[320px] bg-card-bg border-r border-border-main z-[70] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-border flex items-center justify-between h-16 md:h-20">
              <h2 className="text-xl md:text-2xl font-serif italic text-text-primary">Conteúdos</h2>
              <button 
                onClick={onClose} 
                className="p-2 md:p-3 hover:bg-white/5 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-text-secondary" />
              </button>
            </div>

            <div className="p-4 border-b border-border-main">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/40" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-10 bg-black/20 border-border-main rounded-xl h-10 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 space-y-2 pb-20">
                {AREAS.map(area => (
                  <div key={area.id} className="space-y-1">
                    <button
                      onClick={() => toggleArea(area.id)}
                      className="w-full flex items-center justify-between p-3 md:p-4 rounded-xl hover:bg-white/5 transition-colors text-left group min-h-[48px]"
                    >
                      <span className="font-bold text-sm md:text-base uppercase tracking-wider text-text-primary/80 group-hover:text-accent-red">
                        {area.label}
                      </span>
                      {expandedAreas.includes(area.id) ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>

                    <AnimatePresence>
                      {expandedAreas.includes(area.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pl-4 space-y-1"
                        >
                          {area.subjects.map(subject => (
                            <div key={subject} className="space-y-1">
                              <button
                                onClick={() => toggleSubject(subject)}
                                className="w-full flex items-center justify-between p-2 md:p-3 rounded-lg hover:bg-white/5 transition-colors text-left min-h-[44px]"
                              >
                                <span className="text-sm md:text-base text-text-secondary font-medium">{subject}</span>
                                {expandedSubjects.includes(subject) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>

                              <AnimatePresence>
                                {expandedSubjects.includes(subject) && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden pl-3 space-y-2 py-1"
                                  >
                                    {filteredModules(subject).map(module => (
                                      <div key={module.id} className="space-y-2 p-3 rounded-xl bg-white/5 border border-border-main/50">
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="text-xs font-bold text-text-primary/90 leading-tight">
                                            {module.title}
                                          </span>
                                          <Badge variant="outline" className="text-[10px] border-accent-red/20 text-accent-red shrink-0">
                                            {moduleProgress[module.id].completed}/{moduleProgress[module.id].total}
                                          </Badge>
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                          {module.items.map((item, idx) => {
                                            const isDone = !!completedTopics[`${module.id}__${idx}`];
                                            return (
                                              <div 
                                                key={idx} 
                                                className="flex items-start gap-2 group cursor-pointer"
                                                onClick={() => toggleTopic(module.id, idx)}
                                              >
                                                <Checkbox 
                                                  checked={isDone}
                                                  onCheckedChange={() => toggleTopic(module.id, idx)}
                                                  className="mt-0.5 border-border-main data-[state=checked]:bg-accent-red data-[state=checked]:border-accent-red"
                                                />
                                                <span className={`text-[11px] leading-tight transition-colors ${isDone ? 'text-text-secondary/40 line-through' : 'text-text-secondary group-hover:text-text-primary'}`}>
                                                  {item}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {rescueMode === 'none' ? (
              <div className="p-4 border-t border-border-main flex gap-2 shrink-0 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleGenerateCode} className="text-[10px] flex-1 flex items-center justify-center gap-1.5 touch-target">
                  <Download className="w-3.5 h-3.5" />
                  Gerar
                </Button>
                <Button variant="outline" size="sm" onClick={handleImportMode} className="text-[10px] flex-1 flex items-center justify-center gap-1.5 touch-target">
                  <Upload className="w-3.5 h-3.5" />
                  Resgatar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRescueMode('debug')} className="text-[10px] flex-1 flex items-center justify-center gap-1.5 touch-target">
                  <Terminal className="w-3.5 h-3.5" />
                  Testes
                </Button>
              </div>
            ) : rescueMode === 'export' ? (
              <div className="p-4 border-t border-border-main flex flex-col gap-2 shrink-0 bg-black/20">
                <p className="text-xs text-text-secondary text-center">Copie seu Código de Resgate:</p>
                <textarea 
                  readOnly 
                  value={rescueCode} 
                  className="w-full h-20 text-[10px] font-mono bg-black/40 border border-border-main rounded-md p-2 text-text-primary/70 break-all resize-none"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRescueMode('none')} className="flex-1 text-[10px] touch-target">Voltar</Button>
                  <Button size="sm" onClick={copyRescueCode} className="flex-1 text-[10px] bg-accent-blue text-white touch-target border-transparent">
                    Copiar Código
                  </Button>
                </div>
              </div>
            ) : rescueMode === 'import' ? (
              <div className="p-4 border-t border-border-main flex flex-col gap-2 shrink-0 bg-black/20">
                <p className="text-xs text-text-secondary text-center">Cole seu Código de Resgate:</p>
                <textarea 
                  value={rescueCode} 
                  onChange={e => setRescueCode(e.target.value)}
                  className="w-full h-20 text-[10px] font-mono bg-black/40 border border-border-main rounded-md p-2 text-text-primary focus:border-accent-blue outline-none resize-none"
                  placeholder="Cole aquele textão cheio de letras aqui..."
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRescueMode('none')} className="flex-1 text-[10px] touch-target">Cancelar</Button>
                  <Button size="sm" onClick={confirmImport} className="flex-1 text-[10px] bg-accent-red text-white touch-target border-transparent">
                    Importar Progresso
                  </Button>
                </div>
              </div>
            ) : rescueMode === 'debug' ? (
              <div className="p-4 border-t border-border-main flex flex-col gap-2 shrink-0 bg-black/20">
                <p className="text-xs text-text-secondary text-center">Digite seu código secreto:</p>
                <Input 
                  value={debugCode} 
                  onChange={e => setDebugCode(e.target.value)}
                  className="w-full text-xs font-mono bg-black/40 border border-border-main rounded-md p-2 text-text-primary focus:border-accent-blue outline-none mix-blend-screen"
                  placeholder="Digite o código aqui..."
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRescueMode('none')} className="flex-1 text-[10px] touch-target">Cancelar</Button>
                  <Button size="sm" onClick={handleApplyDebugCode} className="flex-1 text-[10px] bg-purple-600 hover:bg-purple-700 text-white touch-target border-transparent">
                    Executar Código
                  </Button>
                </div>
              </div>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
