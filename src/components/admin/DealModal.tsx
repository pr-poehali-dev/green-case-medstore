import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { dealsApi, Deal, DealStage, DealComment } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  deal: Deal;
  onClose: () => void;
  onUpdated: (deal: Deal) => void;
  onDeleted: (dealId: number) => void;
}

const STAGE_STATUS: Record<DealStage['status'], { label: string; color: string; icon: string }> = {
  pending: { label: 'Ожидает',  color: 'bg-slate-100 text-slate-600',     icon: 'Clock' },
  in_work: { label: 'В работе', color: 'bg-blue-100 text-blue-700',       icon: 'PlayCircle' },
  done:    { label: 'Завершён', color: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle2' },
};

const DEAL_STATUS_CFG: Record<Deal['status'], { label: string; color: string }> = {
  active:    { label: 'Активна',   color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Завершена', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Отменена',  color: 'bg-rose-100 text-rose-700' },
};

function fmtDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StageCard({ stage, onAction }: {
  stage: DealStage;
  onAction: (id: number, action: 'take' | 'complete' | 'reopen') => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<DealComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [acting, setActing] = useState(false);

  const loadComments = async () => {
    if (commentsLoaded) return;
    const list = await dealsApi.getComments(stage.id).catch(() => [] as DealComment[]);
    setComments(list);
    setCommentsLoaded(true);
  };

  const toggleExpand = () => {
    if (!expanded) loadComments();
    setExpanded(e => !e);
  };

  const handleAction = async (action: 'take' | 'complete' | 'reopen') => {
    setActing(true);
    try {
      await onAction(stage.id, action);
    } finally {
      setActing(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const c = await dealsApi.addComment(stage.id, newComment.trim());
      setComments(prev => [...prev, c]);
      setNewComment('');
    } finally {
      setPosting(false);
    }
  };

  const st = STAGE_STATUS[stage.status];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3">
        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${st.color}`}>
          <Icon name={st.icon} size={13} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{stage.title}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.color}`}>{st.label}</span>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-x-4 text-[11px] text-muted-foreground">
            <span>Создан: {fmtDate(stage.created_at)}</span>
            {stage.taken_at && <span>Взят: {fmtDate(stage.taken_at)}</span>}
            {stage.taken_by && <span>Исполнитель: <span className="text-foreground font-medium">{stage.taken_by}</span></span>}
            {stage.completed_at && <span>Завершён: {fmtDate(stage.completed_at)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {stage.status === 'pending' && (
            <Button size="sm" variant="outline" className="h-7 rounded-lg px-2.5 text-xs" disabled={acting} onClick={() => handleAction('take')}>
              {acting ? <Icon name="Loader2" size={12} className="animate-spin mr-1" /> : <Icon name="Play" size={12} className="mr-1" />}
              В работу
            </Button>
          )}
          {stage.status === 'in_work' && (
            <Button size="sm" className="h-7 rounded-lg px-2.5 text-xs" disabled={acting} onClick={() => handleAction('complete')}>
              {acting ? <Icon name="Loader2" size={12} className="animate-spin mr-1" /> : <Icon name="Check" size={12} className="mr-1" />}
              Завершить
            </Button>
          )}
          {stage.status === 'done' && (
            <Button size="sm" variant="outline" className="h-7 rounded-lg px-2.5 text-xs" disabled={acting} onClick={() => handleAction('reopen')}>
              {acting ? <Icon name="Loader2" size={12} className="animate-spin mr-1" /> : <Icon name="RotateCcw" size={12} className="mr-1" />}
              Возобновить
            </Button>
          )}
          <button onClick={toggleExpand} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <Icon name={expanded ? 'ChevronUp' : 'MessageSquare'} size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border bg-secondary/30 px-4 py-3 space-y-3">
          {!commentsLoaded ? (
            <div className="text-xs text-muted-foreground">Загрузка...</div>
          ) : comments.length === 0 ? (
            <div className="text-xs text-muted-foreground">Комментариев пока нет</div>
          ) : (
            <div className="space-y-2">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="h-6 w-6 shrink-0 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[10px] font-bold mt-0.5">
                    {c.author[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold">{c.author}</span>
                      <span className="text-[10px] text-muted-foreground">{fmtDate(c.created_at)}</span>
                    </div>
                    <p className="text-xs text-foreground mt-0.5 whitespace-pre-wrap">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
              placeholder="Написать комментарий…"
              className="rounded-lg h-8 text-xs"
            />
            <Button size="sm" className="h-8 rounded-lg px-3" disabled={posting || !newComment.trim()} onClick={handleComment}>
              <Icon name={posting ? 'Loader2' : 'Send'} size={13} className={posting ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DealModal({ deal, onClose, onUpdated, onDeleted }: Props) {
  const { user } = useAuth();
  const [stages, setStages] = useState<DealStage[]>([]);
  const [loadingStages, setLoadingStages] = useState(true);
  const [newStageTitle, setNewStageTitle] = useState('');
  const [addingStage, setAddingStage] = useState(false);
  const [showAddStage, setShowAddStage] = useState(false);
  const [dealStatus, setDealStatus] = useState(deal.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isPrivileged = user?.role === 'developer' || user?.role === 'admin';

  useEffect(() => {
    dealsApi.getStages(deal.id).then(setStages).finally(() => setLoadingStages(false));
  }, [deal.id]);

  const handleStageAction = async (id: number, action: 'take' | 'complete' | 'reopen') => {
    const updated = await dealsApi.updateStage({ id, action });
    setStages(prev => prev.map(s => s.id === id ? updated : s));
  };

  const handleAddStage = async () => {
    if (!newStageTitle.trim()) return;
    setAddingStage(true);
    try {
      const stage = await dealsApi.addStage(deal.id, newStageTitle.trim());
      setStages(prev => [...prev, stage]);
      setNewStageTitle('');
      setShowAddStage(false);
    } finally {
      setAddingStage(false);
    }
  };

  const handleDealStatus = async (status: Deal['status']) => {
    setUpdatingStatus(true);
    try {
      await dealsApi.update({ id: deal.id, status });
      setDealStatus(status);
      onUpdated({ ...deal, status });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await dealsApi.remove(deal.id);
      onDeleted(deal.id);
    } finally {
      setDeleting(false);
    }
  };

  const doneCount = stages.filter(s => s.status === 'done').length;
  const progress = stages.length > 0 ? Math.round((doneCount / stages.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card h-full shadow-2xl border-l border-border flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-border shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="text-xs text-muted-foreground mb-1">Сделка #{deal.id} · {deal.created_by_name}</div>
            <h2 className="font-display text-lg font-bold leading-tight">{deal.title}</h2>
            {deal.description && <p className="text-sm text-muted-foreground mt-1">{deal.description}</p>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isPrivileged && (
              confirmDelete ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-rose-600 font-medium">Удалить?</span>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex h-8 items-center px-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold">
                    {deleting ? <Icon name="Loader2" size={13} className="animate-spin" /> : 'Да'}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground text-xs font-semibold">
                    Нет
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-colors" title="Удалить сделку">
                  <Icon name="Trash2" size={15} />
                </button>
              )
            )}
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary">
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        {/* Status + Progress */}
        <div className="px-6 py-4 border-b border-border shrink-0 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Статус:</span>
            {(['active', 'completed', 'cancelled'] as Deal['status'][]).map(s => (
              <button key={s} disabled={updatingStatus} onClick={() => handleDealStatus(s)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${dealStatus === s ? DEAL_STATUS_CFG[s].color + ' ring-2 ring-offset-1 ring-current/30' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
                {DEAL_STATUS_CFG[s].label}
              </button>
            ))}
          </div>

          {stages.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Прогресс этапов</span>
                <span className="font-semibold">{doneCount}/{stages.length} · {progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Stages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-sm">
              Этапы {stages.length > 0 && <span className="text-muted-foreground font-normal">({stages.length})</span>}
            </h3>
            <button onClick={() => setShowAddStage(s => !s)} className="flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold">
              <Icon name="Plus" size={13} /> Добавить этап
            </button>
          </div>

          {showAddStage && (
            <div className="flex gap-2 animate-float-up">
              <Input
                autoFocus
                value={newStageTitle}
                onChange={e => setNewStageTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddStage()}
                placeholder="Название этапа…"
                className="rounded-lg h-9 text-sm"
              />
              <Button size="sm" className="h-9 rounded-lg px-3" disabled={addingStage || !newStageTitle.trim()} onClick={handleAddStage}>
                {addingStage ? <Icon name="Loader2" size={14} className="animate-spin" /> : 'Добавить'}
              </Button>
              <button onClick={() => setShowAddStage(false)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary">
                <Icon name="X" size={14} />
              </button>
            </div>
          )}

          {loadingStages ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />)}
            </div>
          ) : stages.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Icon name="ListTodo" size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Этапов пока нет</p>
              <p className="text-xs mt-1">Нажмите «Добавить этап» чтобы начать</p>
            </div>
          ) : (
            stages.map(stage => (
              <StageCard key={stage.id} stage={stage} onAction={handleStageAction} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
