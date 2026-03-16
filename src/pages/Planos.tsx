import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard, MoreVertical, Pencil, Trash2, Users } from 'lucide-react';
import { mockPlanos, mockInscricoes, mockMembros } from '@/data/mock';
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
  const [planos, setPlanos] = useState(mockPlanos);
  const [open, setOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  
  // AlertDialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // View Subscribers state
  const [viewingPlanId, setViewingPlanId] = useState<string | null>(null);

  const getSubscribers = (planoId: string) => {
    return mockInscricoes
      .filter(i => i.plano_id === planoId)
      .map(i => {
        const membro = mockMembros.find(m => m.id === i.membro_id);
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
    }
  };

  const handleSave = () => {
    if (!nome.trim() || !preco) return;
    
    if (editingPlano) {
      setPlanos(prev =>
        prev.map(p =>
          p.id === editingPlano.id
            ? { ...p, nome: nome.trim(), preco: parseFloat(preco) }
            : p
        )
      );
      toast.success('Plano atualizado com sucesso!');
    } else {
      const novo: Plano = {
        id: String(Date.now()),
        nome: nome.trim(),
        preco: parseFloat(preco),
        frequencia: 'mensal',
      };
      setPlanos(prev => [...prev, novo]);
      toast.success('Plano criado com sucesso!');
    }
    
    handleOpenChange(false);
  };

  const handleEdit = (plano: Plano) => {
    setEditingPlano(plano);
    setNome(plano.nome);
    setPreco(plano.preco.toString());
    setOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setPlanos(prev => prev.filter(p => p.id !== deleteId));
      toast.success('Plano eliminado com sucesso!');
      setDeleteId(null);
    }
  };

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
                type="number"
                value={preco}
                onChange={e => setPreco(e.target.value)}
                placeholder="Preço (Kz)"
                className="w-full bg-card/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button
                onClick={handleSave}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {editingPlano ? 'Guardar Alterações' : 'Criar Plano'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {planos.map((plano, i) => (
          <motion.div
            key={plano.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="glass-surface p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{plano.nome}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-muted-foreground capitalize">{plano.frequencia}</p>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {mockInscricoes.filter(i => i.plano_id === plano.id).length} inscritos
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-lg font-semibold tabular-nums text-foreground">{plano.preco.toLocaleString('pt-AO')} Kz</p>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-muted/50 rounded-md transition-colors text-muted-foreground hover:text-foreground">
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
          </motion.div>
        ))}
      </div>

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
            <AlertDialogAction onClick={confirmDelete} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar Plano
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
