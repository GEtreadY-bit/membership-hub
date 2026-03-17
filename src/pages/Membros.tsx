import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Plus, Mail, Phone, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMembros, createMembro, updateMembro, deleteMembro, getInscricoes, createInscricao, updateInscricao, deleteInscricao, getPlanos, createHistorico } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { Membro } from '@/types';
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
        // Update Membro
        await updateMembro(editingMembro.id, { 
          nome: nome.trim(), 
          email: email.trim() || undefined, 
          telefone: telefone.trim() || undefined 
        });

        // Update/Create/Delete Inscricao
        const existingInscricao = inscricoes.find(i => i.membro_id === editingMembro.id);
        if (planoId) {
          if (existingInscricao) {
            if (existingInscricao.plano_id !== planoId) {
              await updateInscricao(existingInscricao.id, { plano_id: planoId });
            }
          } else {
            const novaInscricao = await createInscricao({
              membro_id: editingMembro.id,
              plano_id: planoId,
              status: 'Ativo',
              dia_vencimento: 1,
              proximo_pagamento: new Date().toISOString()
            });
            const selectedPlano = planos.find(p => p.id === planoId);
            if (selectedPlano) {
              await createHistorico({
                membro_id: editingMembro.id,
                inscricao_id: novaInscricao.id,
                valor: selectedPlano.preco,
                data_pagamento: new Date().toISOString()
              });
            }
          }
        } else if (existingInscricao) {
          await deleteInscricao(existingInscricao.id);
        }
      } else {
        // Create Membro
        const novoMembro = await createMembro({
          nome: nome.trim(),
          email: email.trim() || undefined,
          telefone: telefone.trim() || undefined
        });
        
        // Create Inscricao if a plan was selected
        if (planoId) {
          const novaInscricao = await createInscricao({
            membro_id: novoMembro.id,
            plano_id: planoId,
            status: 'Ativo',
            dia_vencimento: 1,
            proximo_pagamento: new Date().toISOString()
          });
          const selectedPlano = planos.find(p => p.id === planoId);
          if (selectedPlano) {
            await createHistorico({
              membro_id: novoMembro.id,
              inscricao_id: novaInscricao.id,
              valor: selectedPlano.preco,
              data_pagamento: new Date().toISOString()
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membros'] });
      queryClient.invalidateQueries({ queryKey: ['inscricoes'] });
      queryClient.invalidateQueries({ queryKey: ['historico'] });
      toast.success(editingMembro ? 'Membro atualizado com sucesso!' : 'Membro registado com sucesso!');
      handleOpenChange(false);
    },
    onError: () => toast.error('Ocorreu um erro ao guardar os dados do membro.')
  });

  const handleSave = () => {
    if (!nome.trim()) return;
    saveMutation.mutate();
  };

  const handleEdit = (membro: Membro) => {
    setEditingMembro(membro);
    setNome(membro.nome);
    setEmail(membro.email || '');
    setTelefone(membro.telefone || '');
    const inscricao = inscricoes.find(i => i.membro_id === membro.id);
    setPlanoId(inscricao?.plano_id || '');
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

  if (loadingMembros || loadingInscricoes || loadingPlanos) {
     return <div className="p-12 text-center text-muted-foreground">A carregar membros...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Membros</h1>
          <p className="text-sm text-muted-foreground mt-1">{membros.length} membros registados</p>
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
              <input
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Nome completo (obrigatório)"
                className="w-full bg-card/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email (opcional)"
                className="w-full bg-card/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <input
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                placeholder="Telefone (opcional)"
                className="w-full bg-card/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground pl-1">Plano de Subscrição</label>
                <select
                  value={planoId}
                  onChange={e => setPlanoId(e.target.value)}
                  className="w-full bg-card/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none"
                >
                  <option value="">Sem plano de subscrição</option>
                  {planos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} - {p.preco.toLocaleString('pt-AO')} Kz</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSave}
                disabled={!nome.trim() || saveMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {saveMutation.isPending ? 'A guardar...' : (editingMembro ? 'Guardar Alterações' : 'Criar Membro')}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {membros.length === 0 ? (
         <div className="glass-surface p-10 text-center text-muted-foreground">
           Nenhum membro registado.
         </div>
      ) : (
        <div className="space-y-2">
          {membros.map((membro, i) => {
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
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{membro.nome}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {membro.email && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {membro.email}
                        </span>
                      )}
                      {membro.telefone && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {membro.telefone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {plano && <span className="text-xs text-muted-foreground hidden sm:inline">{plano.nome}</span>}
                  {inscricao ? (
                     <StatusBadge status={inscricao.status} />
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
                        <Pencil className="w-4 h-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(membro.id)} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-surface border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto irá eliminar permanentemente o membro e todos os registos (inscrições e pagamentos) da plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending} 
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'A eliminar...' : 'Eliminar Membro'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
