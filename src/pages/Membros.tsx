import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Plus, Mail, Phone } from 'lucide-react';
import { mockMembros, mockInscricoes, mockPlanos } from '@/data/mock';
import { StatusBadge } from '@/components/StatusBadge';
import { Membro } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Membros() {
  const [membros, setMembros] = useState(mockMembros);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  const handleAddMembro = () => {
    if (!nome.trim()) return;
    const novo: Membro = {
      id: String(Date.now()),
      nome: nome.trim(),
      email: email.trim() || undefined,
      telefone: telefone.trim() || undefined,
      created_at: new Date().toISOString(),
    };
    setMembros(prev => [...prev, novo]);
    setNome('');
    setEmail('');
    setTelefone('');
    setOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Membros</h1>
          <p className="text-sm text-muted-foreground mt-1">{membros.length} membros registados</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Novo Membro
            </button>
          </DialogTrigger>
          <DialogContent className="glass-surface border-border">
            <DialogHeader>
              <DialogTitle>Adicionar Membro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <input
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Nome completo"
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
              <button
                onClick={handleAddMembro}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Adicionar
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {membros.map((membro, i) => {
          const inscricao = mockInscricoes.find(ins => ins.membro_id === membro.id);
          const plano = inscricao ? mockPlanos.find(p => p.id === inscricao.plano_id) : null;

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
              <div className="flex items-center gap-3">
                {plano && <span className="text-xs text-muted-foreground hidden sm:inline">{plano.nome}</span>}
                {inscricao && <StatusBadge status={inscricao.status} />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
