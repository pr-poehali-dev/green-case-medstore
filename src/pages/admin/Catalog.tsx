import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { productsApi, Product } from '@/lib/api';
import { PRODUCT_STATUS, ProductStatus } from '@/lib/adminData';

const CATEGORIES = ['Видеосистемы', 'Гинекология', 'Косметология', 'Отоларингология', 'Рентген аппараты', 'Электрохирургия'];
const HERO_IMG = 'https://cdn.poehali.dev/projects/8cc5c4b0-536f-47f6-a8d2-d674659779ef/files/37cfd8dc-2290-45f5-b2b1-1d9ea96a9531.jpg';

type FormData = Partial<Product> & { specsStr?: string; complStr?: string; certsStr?: string };
const EMPTY_FORM: FormData = {
  name: '', reg_name: '', category: '', brand: '',
  ru_number: '', ru_valid: '', status: 'in_stock',
  description: '', photos: [],
  specsStr: '', complStr: '', certsStr: '',
};

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProductStatus | 'all'>('all');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [csvModal, setCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvResult, setCsvResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  const fileInput = useRef<HTMLInputElement>(null);
  const csvFileInput = useRef<HTMLInputElement>(null);

  const load = (q = query, st = filterStatus) => {
    setLoading(true);
    productsApi.list({ q: q || undefined, status: st !== 'all' ? st : undefined })
      .then(setProducts).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleSearch = (v: string) => {
    setQuery(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(v, filterStatus), 400);
  };

  const handleFilterStatus = (f: ProductStatus | 'all') => {
    setFilterStatus(f);
    load(query, f);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setError('');
    setModal('add');
  };

  const openEdit = (p: Product) => {
    setForm({
      ...p,
      specsStr: (p.specs || []).join('\n'),
      complStr: (p.complectation || []).join('\n'),
      certsStr: (p.certs || []).join('\n'),
    });
    setError('');
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setError(''); };

  // Загрузка фото
  const handlePhotoUpload = async (file: File, idx: number) => {
    setUploadingIdx(idx);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const b64 = (reader.result as string).split(',')[1];
        const res = await productsApi.uploadPhoto(b64, file.type);
        const newPhotos = [...(form.photos || [])];
        if (newPhotos[idx] !== undefined) {
          newPhotos[idx] = res.url;
        } else {
          newPhotos.push(res.url);
        }
        setForm(f => ({ ...f, photos: newPhotos }));
        setUploadingIdx(null);
      };
    } catch (e) {
      setError('Ошибка загрузки фото');
      setUploadingIdx(null);
    }
  };

  const removePhoto = (idx: number) => {
    const newPhotos = (form.photos || []).filter((_, i) => i !== idx);
    setForm(f => ({ ...f, photos: newPhotos }));
  };

  const handleSave = async () => {
    setError('');
    if (!form.name?.trim()) { setError('Название обязательно'); return; }
    setSaving(true);
    const payload = {
      ...form,
      specs: (form.specsStr || '').split('\n').map(s => s.trim()).filter(Boolean),
      complectation: (form.complStr || '').split('\n').map(s => s.trim()).filter(Boolean),
      certs: (form.certsStr || '').split('\n').map(s => s.trim()).filter(Boolean),
    };
    try {
      if (modal === 'add') {
        await productsApi.create(payload);
      } else {
        await productsApi.update({ ...payload, id: form.id! });
      }
      closeModal();
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await productsApi.remove(deleteId).catch(() => {});
    setDeleteId(null);
    load();
  };

  const handleCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setCsvText(reader.result as string);
    reader.readAsText(file, 'utf-8');
  };

  const handleCsvImport = async () => {
    if (!csvText.trim()) return;
    setCsvLoading(true);
    setCsvResult(null);
    try {
      const res = await productsApi.csvImport(csvText);
      setCsvResult(res);
      if (res.imported > 0) load();
    } catch (e: unknown) {
      setCsvResult({ imported: 0, errors: [e instanceof Error ? e.message : 'Ошибка импорта'] });
    } finally {
      setCsvLoading(false);
    }
  };

  const statusKeys = Object.keys(PRODUCT_STATUS) as ProductStatus[];

  return (
    <AdminLayout title="Каталог товаров">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 rounded-xl border border-border bg-card px-3">
          <Icon name="Search" size={18} className="text-muted-foreground shrink-0" />
          <Input value={query} onChange={e => handleSearch(e.target.value)}
            placeholder="Поиск по названию или РУ…" className="border-0 shadow-none focus-visible:ring-0 px-0" />
        </div>
        <Button variant="outline" className="rounded-xl" onClick={() => { setCsvModal(true); setCsvResult(null); setCsvText(''); }}>
          <Icon name="Upload" size={16} className="mr-2" /> Импорт CSV
        </Button>
        <Button className="rounded-xl font-semibold" onClick={openAdd}>
          <Icon name="Plus" size={16} className="mr-2" /> Добавить товар
        </Button>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => handleFilterStatus('all')}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${filterStatus === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground/70 hover:bg-accent'}`}>
          Все ({products.length})
        </button>
        {statusKeys.map(s => (
          <button key={s} onClick={() => handleFilterStatus(s)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground/70 hover:bg-accent'}`}>
            {PRODUCT_STATUS[s].label} ({products.filter(p => p.status === s).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Фото</th>
                <th className="px-4 py-3 font-medium">Товар</th>
                <th className="px-4 py-3 font-medium">Категория</th>
                <th className="px-4 py-3 font-medium">Номер РУ</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {[...Array(6)].map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-muted animate-pulse" /></td>)}
                    </tr>
                  ))
                : products.map(p => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-secondary shrink-0">
                          <img src={p.photos?.[0] || HERO_IMG} alt="" className="h-full w-full object-cover" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.brand}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                      <td className="px-4 py-3">
                        <div className="font-mono-tech text-xs font-semibold">{p.ru_number}</div>
                        <div className="font-mono-tech text-[11px] text-muted-foreground">до {p.ru_valid}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${PRODUCT_STATUS[p.status]?.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${PRODUCT_STATUS[p.status]?.dot}`} />
                          {PRODUCT_STATUS[p.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors" title="Редактировать">
                            <Icon name="Pencil" size={16} />
                          </button>
                          <button onClick={() => setDeleteId(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-rose-600 transition-colors" title="Удалить">
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        {!loading && products.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Icon name="PackageOpen" size={36} className="mx-auto mb-2 opacity-50" />
            Товары не найдены
          </div>
        )}
      </div>

      {/* ── Модалка добавления/редактирования ───────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative w-full max-w-2xl bg-card rounded-3xl border border-border shadow-2xl max-h-[92vh] overflow-y-auto animate-float-up">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="font-display text-xl font-bold">{modal === 'add' ? 'Добавить товар' : 'Редактировать товар'}</h2>
              <button onClick={closeModal} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary"><Icon name="X" size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Photos */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Фотографии товара (до 4 шт.)</label>
                <div className="grid grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map(idx => {
                    const url = (form.photos || [])[idx];
                    return (
                      <div key={idx} className="relative aspect-square rounded-xl border-2 border-dashed border-border overflow-hidden group bg-secondary">
                        {url ? (
                          <>
                            <img src={url} alt="" className="h-full w-full object-cover" />
                            <button
                              onClick={() => removePhoto(idx)}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Icon name="Trash2" size={18} className="text-white" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              if ((form.photos || []).length >= 4) return;
                              if (fileInput.current) fileInput.current.dataset.idx = String(idx);
                              fileInput.current?.click();
                            }}
                            className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent transition-colors gap-1">
                            {uploadingIdx === idx ? <Icon name="Loader2" size={18} className="animate-spin" /> : <Icon name="Plus" size={20} />}
                            <span className="text-[10px]">Фото {idx + 1}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <input ref={fileInput} type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    const idx = parseInt(e.target.dataset.idx || '0');
                    if (file) handlePhotoUpload(file, idx);
                    e.target.value = '';
                  }} />
                <p className="text-xs text-muted-foreground mt-1.5">JPEG, PNG или WebP, до 5 МБ каждый</p>
              </div>

              {/* Main fields */}
              <div className="grid gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Торговое название *</label>
                  <Input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-xl" placeholder="Название товара" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Название по РУ</label>
                  <Input value={form.reg_name || ''} onChange={e => setForm(f => ({ ...f, reg_name: e.target.value }))} className="rounded-xl" placeholder="По регистрационному удостоверению" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Категория</label>
                    <select value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                      <option value="">— выбрать —</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Производитель</label>
                    <Input value={form.brand || ''} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="rounded-xl" placeholder="Бренд" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Номер РУ</label>
                    <Input value={form.ru_number || ''} onChange={e => setForm(f => ({ ...f, ru_number: e.target.value }))} className="rounded-xl" placeholder="РЗН 2023/XXXXX" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">РУ действует до (мм.гггг)</label>
                    <Input value={form.ru_valid || ''} onChange={e => setForm(f => ({ ...f, ru_valid: e.target.value }))} className="rounded-xl" placeholder="12.2028" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Статус наличия</label>
                  <select value={form.status || 'in_stock'} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProductStatus }))}
                    className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none">
                    {statusKeys.map(s => <option key={s} value={s}>{PRODUCT_STATUS[s].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Описание</label>
                  <Textarea value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-xl" rows={3} placeholder="Описание товара" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Характеристики (каждая с новой строки)</label>
                  <Textarea value={form.specsStr || ''} onChange={e => setForm(f => ({ ...f, specsStr: e.target.value }))} className="rounded-xl" rows={4} placeholder={"4K UHD сенсор\nNBI-режим\nГлубина 1.5–100 мм"} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Комплектация (каждая позиция с новой строки)</label>
                  <Textarea value={form.complStr || ''} onChange={e => setForm(f => ({ ...f, complStr: e.target.value }))} className="rounded-xl" rows={3} placeholder={"Видеопроцессор ×1\nМонитор 27\" ×1"} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Сертификаты и РУ (каждый с новой строки)</label>
                  <Textarea value={form.certsStr || ''} onChange={e => setForm(f => ({ ...f, certsStr: e.target.value }))} className="rounded-xl" rows={2} placeholder={"РЗН 2023/19847\nCE 0413"} />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2.5 text-sm text-rose-700">
                  <Icon name="AlertCircle" size={15} className="shrink-0" /> {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-border">
              <Button variant="outline" onClick={closeModal} className="flex-1 rounded-xl">Отмена</Button>
              <Button onClick={handleSave} disabled={saving || !form.name} className="flex-1 rounded-xl font-semibold">
                {saving && <Icon name="Loader2" size={16} className="animate-spin mr-2" />}
                {modal === 'add' ? 'Добавить товар' : 'Сохранить изменения'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Подтверждение удаления ─────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative w-full max-w-sm bg-card rounded-3xl border border-border shadow-2xl p-6 animate-float-up text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mx-auto mb-4">
              <Icon name="Trash2" size={26} />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Удалить товар?</h2>
            <p className="text-muted-foreground text-sm mb-5">
              Товар будет помечен как «Снят с производства» и скрыт из каталога. Это действие можно отменить через редактирование.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1 rounded-xl">Отмена</Button>
              <Button onClick={handleDelete} className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── CSV Импорт ─────────────────────────────────────────────────────── */}
      {csvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setCsvModal(false); setCsvResult(null); }} />
          <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl p-6 animate-float-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold">Импорт из CSV</h2>
              <button onClick={() => { setCsvModal(false); setCsvResult(null); }} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary"><Icon name="X" size={18} /></button>
            </div>

            {csvResult ? (
              <div>
                <div className={`rounded-xl p-4 mb-4 ${csvResult.imported > 0 ? 'bg-primary/10' : 'bg-rose-50'}`}>
                  <p className="font-bold">{csvResult.imported > 0 ? `✅ Импортировано: ${csvResult.imported} товаров` : '❌ Импорт не выполнен'}</p>
                  {csvResult.errors.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-rose-700">
                      {csvResult.errors.map((e, i) => <li key={i}>• {e}</li>)}
                    </ul>
                  )}
                </div>
                <Button className="w-full rounded-xl" onClick={() => { setCsvModal(false); setCsvResult(null); }}>Закрыть</Button>
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-secondary p-3 mb-4 text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Формат CSV (первая строка — заголовки):</p>
                  <code className="font-mono-tech text-[11px]">name,reg_name,category,brand,ru_number,ru_valid,status,specs,description</code>
                  <p className="mt-1">Характеристики (specs) разделяйте точкой с запятой «;»</p>
                </div>
                <div
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center mb-4 cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => csvFileInput.current?.click()}>
                  <Icon name="Upload" size={28} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="font-semibold text-sm">Нажмите чтобы выбрать файл</p>
                  <p className="text-xs text-muted-foreground mt-1">CSV в кодировке UTF-8</p>
                  {csvText && <p className="text-xs text-primary mt-2">Файл загружен ✓</p>}
                </div>
                <input ref={csvFileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleCsvFile(f); e.target.value = ''; }} />
                <Button onClick={handleCsvImport} disabled={!csvText || csvLoading} className="w-full rounded-xl font-semibold">
                  {csvLoading && <Icon name="Loader2" size={16} className="animate-spin mr-2" />}
                  Импортировать
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}