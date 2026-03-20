import { useSettings } from '@/contexts/SettingsContext';
import { motion } from 'framer-motion';
import { Monitor, Moon, Sun, Calendar, Clock, Bell, AlertTriangle } from 'lucide-react';
import React from 'react';

export default function Definicoes() {
  const { theme, setTheme, billingMode, setBillingMode, gracePeriodDays, setGracePeriodDays, warningDays, setWarningDays } = useSettings();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleBillingModeChange = (mode: 'relative' | 'first_of_month') => {
    setBillingMode(mode);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Definições</h1>
        <p className="text-sm text-muted-foreground mt-1">Gira as preferências do sistema e aparência.</p>
      </div>

      <div className="space-y-6">
        {/* Apperance Section */}
        <section className="glass-surface-inner p-6 rounded-2xl flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">Aparência</h2>
            <p className="text-sm text-muted-foreground">Escolhe o tema da aplicação.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-xl border transition-colors ${
                theme === 'light' ? 'bg-primary/10 border-primary text-primary' : 'bg-card/40 border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sun className="w-6 h-6" />
              <span className="font-medium text-sm">Claro</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-xl border transition-colors ${
                theme === 'dark' ? 'bg-primary/10 border-primary text-primary' : 'bg-card/40 border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Moon className="w-6 h-6" />
              <span className="font-medium text-sm">Escuro</span>
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              className={`flex flex-col items-center justify-center gap-3 py-6 px-4 rounded-xl border transition-colors ${
                theme === 'system' ? 'bg-primary/10 border-primary text-primary' : 'bg-card/40 border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Monitor className="w-6 h-6" />
              <span className="font-medium text-sm">Sistema</span>
            </button>
          </div>
        </section>

        {/* Billing Cycles Section */}
        <section className="glass-surface-inner p-6 rounded-2xl flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">Faturação e Cobrança</h2>
            <p className="text-sm text-muted-foreground">Define como as datas de próximo pagamento são calculadas por defeito ao renovar mensalidades.</p>
          </div>

          <div className="flex flex-col gap-3">
            <label
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                billingMode === 'relative' ? 'bg-primary/10 border-primary' : 'bg-card/40 border-border hover:bg-card/60'
              }`}
              onClick={() => handleBillingModeChange('relative')}
            >
              <div className="mt-1">
                <Clock className={`w-5 h-5 ${billingMode === 'relative' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex flex-col flex-1">
                <span className={`font-medium ${billingMode === 'relative' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Dinâmico (Fim de 30/31 dias)
                </span>
                <span className="text-sm text-muted-foreground mt-1">
                  A data do próximo pagamento é calculada adicionando extamente 1 mês a partir da data de limite atual. (Ex: 15 Jan &rarr; 15 Fev).
                </span>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ${
                billingMode === 'relative' ? 'border-primary' : 'border-muted-foreground'
              }`}>
                {billingMode === 'relative' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
              </div>
            </label>

            <label
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                billingMode === 'first_of_month' ? 'bg-primary/10 border-primary' : 'bg-card/40 border-border hover:bg-card/60'
              }`}
              onClick={() => handleBillingModeChange('first_of_month')}
            >
              <div className="mt-1">
                <Calendar className={`w-5 h-5 ${billingMode === 'first_of_month' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex flex-col flex-1">
                <span className={`font-medium ${billingMode === 'first_of_month' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Fixo (Sempre no Dia 1)
                </span>
                <span className="text-sm text-muted-foreground mt-1">
                  As cobranças vencem sempre no dia 1 do mês seguinte, independentemente do dia em que o membro paga. (Ex: 15 Jan &rarr; 1 Março).
                </span>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ${
                billingMode === 'first_of_month' ? 'border-primary' : 'border-muted-foreground'
              }`}>
                {billingMode === 'first_of_month' && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
              </div>
            </label>
          </div>
          
        </section>

        {/* Tolerances and Warnings Section */}
        <section className="glass-surface-inner p-6 rounded-2xl flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-medium text-foreground">Avisos e Tolerâncias</h2>
            <p className="text-sm text-muted-foreground">Configura os prazos de tolerância para pagamentos em atraso e notificações prévias.</p>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4 text-warning" />
                  Dias de Aviso Prévio ("A Vencer")
                </span>
                <span className="text-sm text-muted-foreground">Quantos dias antes do vencimento a plataforma deve alertar que a subscrição está a terminar?</span>
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" max="15" step="1" 
                  value={warningDays} onChange={(e) => setWarningDays(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" 
                />
                <span className="text-sm font-medium w-16 text-right tabular-nums">{warningDays} dias</span>
              </div>
            </div>

            <div className="w-full h-px bg-border/50" />

            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Dias de Tolerância de Atraso
                </span>
                <span className="text-sm text-muted-foreground">Quantos dias de carência oferecer ao membro após o limite expirar antes de o marcar como "Em Atraso". Durante esta janela legal ele consta como "A Vencer".</span>
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" max="30" step="1" 
                  value={gracePeriodDays} onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" 
                />
                <span className="text-sm font-medium w-16 text-right tabular-nums">{gracePeriodDays} dias</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
