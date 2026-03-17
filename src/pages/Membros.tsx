import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, MoreVertical, Pencil, Trash2, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMembros, createMembro, updateMembro, deleteMembro, getInscricoes, createInscricao, updateInscricao, deleteInscricao, getPlanos, createHistorico } from '@/lib/api';
import { MemberCard } from '@/components/MemberCard';
import { StatusPagamento, Membro } from '@/types';
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

type ViewMode = 'lista' | 'cartoes';

const statusOrder: Record<StatusPagamento, number> = {
  'Em Atraso': 0,
  'Só Inscrição': 1,
  Pendente: 2,
  Ativo: 3,
};

export default function Membros() {
  const queryClient = useQueryClient();

  const { data: membros = [], isLoading: loadingMembros } = useQuery({ queryKey: ['membros'], queryFn: getMembros });
  const { data: inscricoes = [], isLoading: loadingInscricoes } = useQuery({ queryKey: ['inscricoes'], queryFn: getInscricoes });
  const { data: planos = [], isLoading: loadingPlanos } = useQuery({ queryKey: ['planos'], queryFn: getPlanos });

  const [open, setOpen] = useState(false);
  const [editingMembro, setEditingMembro] = useState<Membro | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [planoId, setPlanoId] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusPagamento | 'Todos'>('Todos');
  const [viewMode, setViewMode] = useState<ViewMode>('cartoes');

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingMembro(null);
      setNome('');
      setEmail('');
      setTelefone('');
      setPlanoId('');
    }
  };

  // --- Mutations ---
  const deleteMutation = useMutation({
    mutationFn: deleteMembro,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membros'] });
      queryClient.invalidateQueries({ queryKey: ['inscricoes'] });
      toast.success('Membro eliminado com sucesso!');
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Erro ao eliminar membro.');
      setDeleteId(null);
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingMembro) {
        await updateMembro(editingMembro.id, {
          nome: nome.trim(),
          email: email.trim() || undefined,
          telefone: telefone.trim() || undefined
        });
        const existingInscricao = inscricoes.find(i => i.membro_id === editingMembro.id);
        if (planoId) {
          if (existingInscricao) {
            if (existingInscricao.plano_id !== planoId) {
              await updateInscricao(existingInscricao.id, { plano_id: planoId });
            }
          } else {
            await createInscricao({
              membro_id: editingMembro.id,
              plano_id: planoId,
              status: 'Pendente',
              taxa_inscricao_paga: false,
              dia_vencimento: 1,
              proximo_pagamento: new Date().toISOString()
            });
          }
        } else if (existingInscricao) {
          await deleteInscricao(existingInscricao.id);
        }
      } else {
        const novoMembro = await createMembro({
          nome: nome.trim(),
          email: email.trim() || undefined,
          telefone: telefone.trim() || undefined
        });
        if (planoId) {
          await createInscricao({
            membro_id: novoMembro.id,
            plano_id: planoId,
            status: 'Pendente',
            taxa_inscricao_paga: false,
            dia_vencimento: 1,
            proximo_pagamento: new Date().toISOString()
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membros'] });
      queryClient.invalidateQueries({ queryKey: ['inscricoes'] });
      toast.success(editingMembro ? 'Membro atualizado!' : 'Membro registado!');
      handleOpenChange(false);
    },
    onError: () => toast.error('Ocorreu um erro ao guardar os dados do membro.')
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ inscricaoId, valor, membroId, meses, proximoPagamento }: {
      inscricaoId: string; valor: number; membroId: string; meses: number; proximoPagamento: string;
    }) => {
      await updateInscricao(inscricaoId, { status: 'Ativo', proximo_pagamento: proximoPagamento });
      await createHistorico({
        membro_id: membroId,
        inscricao_id: inscricaoId,
        valor,
        tipo: meses > 1 ? `Mensalidade (${meses}x)` : 'Mensalidade',
        data_pagamento: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscricoes'] });
      queryClient.invalidateQueries({ queryKey: ['historico'] });
      toast.success('Pagamento confirmado!');
    },
    onError: () => toast.error('Erro ao processar o pagamento.'),
  });

  const inscricaoMutation = useMutation({
    mutationFn: async ({ inscricaoId, valor, membroId }: { inscricaoId: string; valor: number; membroId: string }) => {
      await updateInscricao(inscricaoId, { taxa_inscricao_paga: true });
      await createHistorico({ membro_id: membroId, inscricao_id: inscricaoId, valor, tipo: 'Inscrição', data_pagamento: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscricoes'] });
      queryClient.invalidateQueries({ queryKey: ['historico'] });
      toast.success('Taxa de inscrição confirmada!');
    },
    onError: () => toast.error('Erro ao confirmar inscrição.'),
  });

  // --- Handlers ---
  const handleSave = () => { if (!nome.trim()) return; saveMutation.mutate(); };

  const handleEdit = (membro: Membro) => {
    setEditingMembro(membro);
    setNome(membro.nome);
    setEmail(membro.email || '');
    setTelefone(membro.telefone || '');
    const inscricao = inscricoes.find(i => i.membro_id === membro.id);
    setPlanoId(inscricao?.plano_id || '');
    setOpen(true);
  };

  const handleConfirmarPagamento = (inscricaoId: string, meses: number = 1) => {
    const inscricao = inscricoes.find(i => i.id === inscricaoId);
    if (!inscricao) return;
    const plano = planos.find(p => p.id === inscricao.plano_id);
    if (!plano) return;
    const proximoBase = new Date(inscricao.proximo_pagamento);
    proximoBase.setMonth(proximoBase.getMonth() + meses);
    paymentMutation.mutate({ inscricaoId, valor: plano.preco * meses, membroId: inscricao.membro_id, meses, proximoPagamento: proximoBase.toISOString() });
  };

  const handleConfirmarInscricao = (inscricaoId: string) => {
    const inscricao = inscricoes.find(i => i.id === inscricaoId);
    if (!inscricao) return;
    const plano = planos.find(p => p.id === inscricao.plano_id);
    if (!plano || !plano.taxa_inscricao) return;
    inscricaoMutation.mutate({ inscricaoId, valor: plano.taxa_inscricao, membroId: inscricao.membro_id });
  };

  // --- Filtered data for card view ---
  const filteredInscricoes = useMemo(() => {
    return inscricoes
      .filter(i => {
        if (statusFilter !== 'Todos' && i.status !== statusFilter) return false;
        const membro = membros.find(m => m.id === i.membro_id);
        const plano = planos.find(p => p.id === i.plano_id);
        if (!membro || !plano) return false;
        const q = search.toLowerCase();
        return membro.nome.toLowerCase().includes(q) || plano.nome.toLowerCase().includes(q);
      })
      .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [inscricoes, membros, planos, search, statusFilter]);

  // --- Filtered membros for list view ---
  const filteredMembros = useMemo(() => {
    if (!search) return membros;
    const q = search.toLowerCase();
    return membros.filter(m =>
      m.nome.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.telefone?.toLowerCase().includes(q)
    );
  }, [membros, search]);

  const statuses: (StatusPagamento | 'Todos')[] = ['Todos', 'Em Atraso', 'Pendente', 'Ativo'];

  if (loadingMembros || loadingInscricoes || loadingPlanos) {
    return <div className="p-12 text-center text-muted-foreground">A carregar membros...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Membros</h1>
          <p className="text-sm text-muted-foreground mt-1">{membros.length} membros registados</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('cartoes')}
              className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'cartoes' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground bg-card/40'}`}
            >
              Cartões
            </button>
            <button
              onClick={() => setViewMode('lista')}
              className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'lista' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground bg-card/40'}`}
            >
              Lista
            </button>
          </div>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                Novo Membro
              </button>
            </DialogTrigger>
            <DialogContent className="glass-surface border-border">
              <DialogHeader>
                <DialogTitle>{editingMembro ? 'Editar Membro' : 'Adicionar Membro'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome completo (obrigatório)"
                  className="w-full bg-card/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (opcional)"
                  className="w-full bg-card/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="Telefone (opcional)"
                  className="w-full bg-card/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground pl-1">Plano de Subscrição</label>
                  <select value={planoId} onChange={e => setPlanoId(e.target.value)}
                    className="w-full bg-card/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none">
                    <option value="">Sem plano de subscrição</option>
                    {planos.map(p => (
                      <option key={p.id} value={p.id}>{p.nome} — {p.preco.toLocaleString('pt-AO')} Kz/mês</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleSave} disabled={!nome.trim() || saveMutation.isPending}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none">
                  {saveMutation.isPending ? 'A guardar...' : (editingMembro ? 'Guardar Alterações' : 'Criar Membro')}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={viewMode === 'cartoes' ? 'Pesquisar membro ou plano...' : 'Pesquisar membro...'}
            className="w-full bg-card/40 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 backdrop-blur-lg"
          />
        </div>
        {viewMode === 'cartoes' && (
          <div className="flex gap-1.5">
            {statuses.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-card/40 text-muted-foreground hover:text-foreground border border-border'}`}>
                {s === 'Em Atraso' ? 'Atraso' : s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Card View */}
      {viewMode === 'cartoes' && (
        <>
          {filteredInscricoes.length === 0 ? (
            <div className="glass-surface-inner p-12 text-center">
              <p className="text-muted-foreground">
                {inscricoes.length === 0 ? 'Nenhum membro com plano ativo.' : 'Nenhum resultado encontrado.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInscricoes.map((inscricao, index) => {
                const membro = membros.find(m => m.id === inscricao.membro_id)!;
                const plano = planos.find(p => p.id === inscricao.plano_id)!;
                if (!membro || !plano) return null;
                return (
                  <MemberCard
                    key={inscricao.id}
                    membro={membro}
                    inscricao={inscricao}
                    plano={plano}
                    onConfirmarPagamento={handleConfirmarPagamento}
                    onConfirmarInscricao={handleConfirmarInscricao}
                    index={index}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {/* List View */}
      {viewMode === 'lista' && (
        <>
          {filteredMembros.length === 0 ? (
            <div className="glass-surface-inner p-12 text-center">
              <p className="text-muted-foreground">Nenhum membro encontrado.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembros.map((membro, i) => {
                const inscricao = inscricoes.find(ins => ins.membro_id === membro.id);
                const plano = inscricao ? planos.find(p => p.id === inscricao.plano_id) : null;
                return (
                  <motion.div
                    key={membro.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-surface-inner p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-foreground">{membro.nome.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{membro.nome}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          {membro.email && <span className="text-xs text-muted-foreground truncate">{membro.email}</span>}
                          {membro.telefone && <span className="text-xs text-muted-foreground">{membro.telefone}</span>}
                          {!membro.email && !membro.telefone && <span className="text-xs text-muted-foreground">Sem contacto</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {plano && <span className="text-xs text-muted-foreground hidden md:inline">{plano.nome}</span>}
                      {inscricao ? (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-widest ${
                          inscricao.status === 'Ativo' ? 'bg-success/15 text-success border-success/30' :
                          inscricao.status === 'Em Atraso' ? 'bg-destructive/15 text-destructive border-destructive/30' :
                          'bg-warning/15 text-warning border-warning/30'
                        }`}>{inscricao.status}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">Sem plano</span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-muted/50 rounded-md transition-colors text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 border-border/50 bg-background/95 backdrop-blur-md">
                          <DropdownMenuItem onClick={() => handleEdit(membro)} className="cursor-pointer gap-2">
                            <Pencil className="w-4 h-4" /><span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteId(membro.id)} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4" /><span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-surface border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Irá eliminar permanentemente o membro e todos os registos associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteMutation.isPending ? 'A eliminar...' : 'Eliminar Membro'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
