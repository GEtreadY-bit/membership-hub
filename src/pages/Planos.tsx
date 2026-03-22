import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard, MoreVertical, Pencil, Trash2, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPlanos, createPlano, updatePlano, deletePlano, getInscricoes, getMembros } from '@/lib/api';
import { Plano, Membro, StatusPagamento } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function Planos() {
  const queryClient = useQueryClient();

  const { data: planos = [], isLoading: loadingPlanos } = useQuery({ queryKey: ['planos'], queryFn: getPlanos });
  const { data: inscricoes = [], isLoading: loadingInscricoes } = useQuery({ queryKey: ['inscricoes'], queryFn: getInscricoes });
  const { data: membros = [], isLoading: loadingMembros } = useQuery({ queryKey: ['membros'], queryFn: getMembros });

  const [open, setOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [taxaInscricao, setTaxaInscricao] = useState('');
  const [multaAtraso, setMultaAtraso] = useState('');
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingPlanId, setViewingPlanId] = useState<string | null>(null);

  // --- Validation errors ---
  const [errors, setErrors] = useState<{ nome?: string; preco?: string; taxaInscricao?: string; multaAtraso?: string }>({});

  const validateFormPlano = (): boolean => {
    const newErrors: typeof errors = {};
    if (!nome.trim()) {
      newErrors.nome = 'O nome do plano é obrigatório.';
    } else if (nome.trim().length < 2) {
      newErrors.nome = 'O nome deve ter pelo menos 2 caracteres.';
    } else if (nome.trim().length > 80) {
      newErrors.nome = 'O nome não pode exceder 80 caracteres.';
    }
    if (!preco.trim()) {
      newErrors.preco = 'O valor da mensalidade é obrigatório.';
    } else {
      const val = parsePrice(preco);
      if (isNaN(val) || val <= 0) {
        newErrors.preco = 'Introduz um valor válido maior que zero.';
      } else if (val > 10_000_000) {
        newErrors.preco = 'O valor parece demasiado elevado.';
      }
    }
    if (taxaInscricao.trim()) {
      const val = parsePrice(taxaInscricao);
      if (isNaN(val) || val < 0) newErrors.taxaInscricao = 'Valor inválido.';
    }
    if (multaAtraso.trim()) {
      const val = parsePrice(multaAtraso);
      if (isNaN(val) || val < 0) newErrors.multaAtraso = 'Valor inválido.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getSubscribers = (planoId: string) => {
    return inscricoes
      .filter(i => i.plano_id === planoId)
      .map(i => {
        const membro = membros.find(m => m.id === i.membro_id);
        return membro ? { membro, status: i.status } : null;
      })
      .filter((item): item is { membro: Membro; status: StatusPagamento } => item !== null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingPlano(null);
      setNome('');
      setPreco('');
      setTaxaInscricao('');
      setMultaAtraso('');
      setErrors({});
    }
  };

  const createMutation = useMutation({
    mutationFn: createPlano,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      toast.success('Plano criado com sucesso!');
      handleOpenChange(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('duplicate') || msg.includes('23505')) {
        toast.error('Já existe um plano com esse nome.');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        toast.error('Erro de ligação. Verifica a tua internet e tenta de novo.');
      } else {
        toast.error('Erro ao criar plano. Tenta novamente.');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (p: { id: string, plano: Partial<Plano> }) => updatePlano(p.id, p.plano),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      toast.success('Plano atualizado com sucesso!');
      handleOpenChange(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('network') || msg.includes('fetch')) {
        toast.error('Erro de ligação. Verifica a tua internet e tenta de novo.');
      } else {
        toast.error('Erro ao atualizar plano. Tenta novamente.');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlano,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      toast.success('Plano eliminado com sucesso!');
      setDeleteId(null);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('foreign key') || msg.includes('23503')) {
        toast.error('Não é possível eliminar: existem inscrições dependentes deste plano.');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        toast.error('Erro de ligação. Verifica a tua internet e tenta de novo.');
      } else {
        toast.error('Erro ao eliminar plano. Tenta novamente.');
      }
      setDeleteId(null);
    },
  });

  const parsePrice = (val: string): number => {
    let clean = val.toString();
    if (clean.includes(',')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    }
    return parseFloat(clean) || 0;
  };

  const handleSave = () => {
    if (!validateFormPlano()) return;

    const finalPrice = parsePrice(preco);
    const finalTaxa = taxaInscricao ? parsePrice(taxaInscricao) : 0;
    const finalMulta = multaAtraso ? parsePrice(multaAtraso) : 0;

    if (editingPlano) {
      updateMutation.mutate({ id: editingPlano.id, plano: { nome: nome.trim(), preco: finalPrice, taxa_inscricao: finalTaxa, multa_atraso: finalMulta } });
    } else {
      createMutation.mutate({ nome: nome.trim(), preco: finalPrice, frequencia: 'mensal', taxa_inscricao: finalTaxa, multa_atraso: finalMulta });
    }
  };

  const handleEdit = (plano: Plano) => {
    setEditingPlano(plano);
    setNome(plano.nome);
    setPreco(plano.preco.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setTaxaInscricao(plano.taxa_inscricao && plano.taxa_inscricao > 0
      ? plano.taxa_inscricao.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '');
    setMultaAtraso(plano.multa_atraso && plano.multa_atraso > 0
      ? plano.multa_atraso.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '');
    setOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const totalInscritos = inscricoes.filter(i => i.plano_id === id).length;
    if (totalInscritos > 0) {
      toast.error(`Não podes eliminar este plano porque ainda tem ${totalInscritos} membro(s) ativos. Por favor, move-os para outro plano primeiro.`);
      return;
    }
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  if (loadingPlanos || loadingInscricoes || loadingMembros) {
     return <div className="p-12 text-center text-muted-foreground">A carregar planos...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Planos & Serviços</h1>
          <p className="text-sm text-muted-foreground mt-1">{planos.length} planos ativos</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Novo Plano
            </button>
          </DialogTrigger>
          <DialogContent className="glass-surface border-border">
            <DialogHeader>
              <DialogTitle>{editingPlano ? 'Editar Plano' : 'Criar Plano'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-4">
              <div className="space-y-1">
                <input
                  value={nome}
                  onChange={e => { setNome(e.target.value); if (errors.nome) setErrors(p => ({ ...p, nome: undefined })); }}
                  placeholder="Nome do plano (ex: Mensalidade Jiu-Jitsu)"
                  className={`w-full bg-card/40 border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-colors ${
                    errors.nome ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'
                  }`}
                />
                {errors.nome && <p className="text-xs text-destructive pl-1 flex items-center gap-1"><span>⚠</span>{errors.nome}</p>}
              </div>
              <div className="space-y-1">
                <input
                  type="text"
                  value={preco}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9.,]/g, '');
                    setPreco(val);
                    if (errors.preco) setErrors(p => ({ ...p, preco: undefined }));
                  }}
                  placeholder="Mensalidade (Kz)"
                  className={`w-full bg-card/40 border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-colors ${
                    errors.preco ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'
                  }`}
                />
                {errors.preco && <p className="text-xs text-destructive pl-1 flex items-center gap-1"><span>⚠</span>{errors.preco}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground pl-1">Taxa de Inscrição</label>
                  <input
                    type="text"
                    value={taxaInscricao}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9.,]/g, '');
                      setTaxaInscricao(val);
                      if (errors.taxaInscricao) setErrors(p => ({ ...p, taxaInscricao: undefined }));
                    }}
                    placeholder="Opcional (0 Kz)"
                    className={`w-full bg-card/40 border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-colors ${
                      errors.taxaInscricao ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'
                    }`}
                  />
                  {errors.taxaInscricao && <p className="text-xs text-destructive pl-1">⚠ {errors.taxaInscricao}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground pl-1">Multa de Atraso</label>
                  <input
                    type="text"
                    value={multaAtraso}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9.,]/g, '');
                      setMultaAtraso(val);
                      if (errors.multaAtraso) setErrors(p => ({ ...p, multaAtraso: undefined }));
                    }}
                    placeholder="Opcional (0 Kz)"
                    className={`w-full bg-card/40 border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 transition-colors ${
                      errors.multaAtraso ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'
                    }`}
                  />
                  {errors.multaAtraso && <p className="text-xs text-destructive pl-1">⚠ {errors.multaAtraso}</p>}
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {createMutation.isPending || updateMutation.isPending ? 'A guardar...' : (editingPlano ? 'Guardar Alterações' : 'Criar Plano')}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {planos.length === 0 ? (
         <div className="glass-surface p-10 text-center text-muted-foreground">
           Nenhum plano registado.
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {planos.map((plano, i) => (
            <motion.div
              key={plano.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-surface px-5 pt-5 pb-4 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{plano.nome}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground capitalize truncate">{plano.frequencia}</p>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30 shrink-0" />
                      <p className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {inscricoes.filter(i => i.plano_id === plano.id).length} inscritos
                      </p>
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-muted/50 rounded-md transition-colors text-muted-foreground hover:text-foreground shrink-0">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 border-border/50 bg-background/95 backdrop-blur-md">
                    <DropdownMenuItem onClick={() => setViewingPlanId(plano.id)} className="cursor-pointer gap-2">
                      <Users className="w-4 h-4" />
                      <span>Ver inscritos</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(plano)} className="cursor-pointer gap-2">
                      <Pencil className="w-4 h-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(plano.id)} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="pl-[52px]">
                <p className="text-xl font-semibold tabular-nums text-foreground whitespace-nowrap">
                  {plano.preco.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm text-muted-foreground font-medium">Kz</span>
                </p>
                {((plano.taxa_inscricao ?? 0) > 0 || (plano.multa_atraso ?? 0) > 0) && (
                  <div className="mt-1 space-y-0.5">
                    {(plano.taxa_inscricao ?? 0) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        + {plano.taxa_inscricao!.toLocaleString('pt-AO')} Kz (inscrição)
                      </p>
                    )}
                    {(plano.multa_atraso ?? 0) > 0 && (
                      <p className="text-[11px] text-destructive/80 font-medium tracking-wide">
                        + {plano.multa_atraso!.toLocaleString('pt-AO')} Kz /multa
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-surface border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto irá eliminar permanentemente o plano e removê-lo dos nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
               onClick={confirmDelete} 
               disabled={deleteMutation.isPending}
               className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'A eliminar...' : 'Eliminar Plano'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewingPlanId} onOpenChange={(open) => !open && setViewingPlanId(null)}>
        <DialogContent className="glass-surface border-border max-w-md">
          <DialogHeader>
            <DialogTitle>
              Inscritos - {planos.find(p => p.id === viewingPlanId)?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2">
            {viewingPlanId && getSubscribers(viewingPlanId).length > 0 ? (
              getSubscribers(viewingPlanId).map(({ membro, status }) => (
                <div key={membro.id} className="flex items-center justify-between p-3 rounded-xl bg-card/40 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{membro.nome}</p>
                    <p className="text-xs text-muted-foreground">{membro.email || 'Sem email'}</p>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                    status === 'Ativo' ? 'bg-primary/10 text-primary' : 
                    status === 'Pendente' ? 'bg-yellow-500/10 text-yellow-500' : 
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {status}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum membro inscrito neste plano.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
