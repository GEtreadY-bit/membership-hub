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
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewingPlanId, setViewingPlanId] = useState<string | null>(null);

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
    }
  };

  const createMutation = useMutation({
    mutationFn: createPlano,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      toast.success('Plano criado com sucesso!');
      handleOpenChange(false);
    },
    onError: () => toast.error('Erro ao criar plano.'),
  });

  const updateMutation = useMutation({
    mutationFn: (p: { id: string, plano: Partial<Plano> }) => updatePlano(p.id, p.plano),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      toast.success('Plano atualizado com sucesso!');
      handleOpenChange(false);
    },
    onError: () => toast.error('Erro ao atualizar plano.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePlano,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos'] });
      toast.success('Plano eliminado com sucesso!');
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Erro ao eliminar plano.');
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
    if (!nome.trim() || !preco) return;

    const finalPrice = parsePrice(preco);
    if (isNaN(finalPrice) || finalPrice <= 0) {
      toast.error('Introduza um preço válido.');
      return;
    }

    const finalTaxa = taxaInscricao ? parsePrice(taxaInscricao) : 0;

    if (editingPlano) {
      updateMutation.mutate({ id: editingPlano.id, plano: { nome: nome.trim(), preco: finalPrice, taxa_inscricao: finalTaxa } });
    } else {
      createMutation.mutate({ nome: nome.trim(), preco: finalPrice, frequencia: 'mensal', taxa_inscricao: finalTaxa });
    }
  };

  const handleEdit = (plano: Plano) => {
    setEditingPlano(plano);
    setNome(plano.nome);
    setPreco(plano.preco.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    setTaxaInscricao(plano.taxa_inscricao && plano.taxa_inscricao > 0
      ? plano.taxa_inscricao.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '');
    setOpen(true);
  };

  const handleDeleteClick = (id: string) => {
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
            <div className="space-y-4 mt-4">
              <input
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Nome do plano (ex: Mensalidade Jiu-Jitsu)"
                className="w-full bg-card/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <input
                type="text"
                value={preco}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9.,]/g, '');
                  setPreco(val);
                }}
                placeholder="Mensalidade (Kz)"
                className="w-full bg-card/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground pl-1">Taxa de Inscrição (opcional)</label>
                <input
                  type="text"
                  value={taxaInscricao}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9.,]/g, '');
                    setTaxaInscricao(val);
                  }}
                  placeholder="0 Kz (deixar vazio se não aplicar)"
                  className="w-full bg-card/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {editingPlano ? 'Guardar Alterações' : 'Criar Plano'}
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
                {(plano.taxa_inscricao ?? 0) > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    + {plano.taxa_inscricao!.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz de inscrição
                  </p>
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
