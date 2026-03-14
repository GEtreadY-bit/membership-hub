import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard } from 'lucide-react';
import { mockPlanos } from '@/data/mock';
import { Plano } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Planos() {
  const [planos, setPlanos] = useState(mockPlanos);
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');

  const handleAdd = () => {
    if (!nome.trim() || !preco) return;
    const novo: Plano = {
      id: String(Date.now()),
      nome: nome.trim(),
      preco: parseFloat(preco),
      frequencia: 'mensal',
    };
    setPlanos(prev => [...prev, novo]);
    setNome('');
    setPreco('');
    setOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Planos & Serviços</h1>
          <p className="text-sm text-muted-foreground mt-1">{planos.length} planos ativos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Novo Plano
            </button>
          </DialogTrigger>
          <DialogContent className="glass-surface border-border">
            <DialogHeader>
              <DialogTitle>Criar Plano</DialogTitle>
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
                placeholder="Preço (€)"
                className="w-full bg-card/40 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button
                onClick={handleAdd}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Criar Plano
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
                <p className="text-xs text-muted-foreground capitalize">{plano.frequencia}</p>
              </div>
            </div>
            <p className="text-lg font-semibold tabular-nums text-foreground">{plano.preco.toFixed(2)}€</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
