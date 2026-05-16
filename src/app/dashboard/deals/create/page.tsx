'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Search, Info, Calendar, DollarSign, User, Tag, ChevronRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '@/lib/api';
import { formatPKR, CATEGORY_LABELS, cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(30, 'Description must be at least 30 characters').max(5000),
  category: z.string().min(1, 'Please select a category'),
  amountPKR: z.string().refine(v => !isNaN(Number(v)) && Number(v) >= 1000, 'Minimum amount is Rs. 1,000'),
  deadline: z.string().min(1, 'Deadline is required').refine(v => new Date(v) > new Date(), 'Deadline must be in the future'),
  sellerEmail: z.string().email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

const STEPS = ['Deal Details', 'Set Amount', 'Review & Send'];

export default function CreateDealPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [sellerSearch, setSellerSearch] = useState('');

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const watchedAmount = watch('amountPKR');
  const feeAmount = watchedAmount ? (Number(watchedAmount) * 0.02).toFixed(0) : '0';
  const sellerGets = watchedAmount ? (Number(watchedAmount) - Number(feeAmount)).toFixed(0) : '0';

  // Debounced seller search
  const { data: sellerData, isFetching: searchingUser } = useQuery({
    queryKey: ['search-user', sellerSearch],
    queryFn: () => api.get('/users/search', { params: { email: sellerSearch } }).then(r => r.data.data),
    enabled: sellerSearch.length > 4 && sellerSearch.includes('@'),
    staleTime: 0,
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/deals', data),
    onSuccess: (res) => {
      toast.success('Deal created! Seller has been notified.');
      router.push(`/dashboard/deals/${res.data.data.deal._id}`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const nextStep = async () => {
    const fields: (keyof FormData)[][] = [
      ['title', 'description', 'category'],
      ['amountPKR', 'deadline'],
    ];
    const valid = await trigger(fields[step]);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = (data: FormData) => createMutation.mutate(data);

  return (
    <div className="max-w-2xl animate-in">
      {/* ── HEADER ── */}
      <div className="mb-8">
        <h1 className="section-title">Create New Escrow Deal</h1>
        <p className="section-sub">Fill in the details to invite a seller and lock funds securely</p>
      </div>

      {/* ── STEP INDICATOR ── */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
              i < step ? 'bg-upwork-green text-white' :
              i === step ? 'bg-upwork-green text-white ring-4 ring-upwork-green-l' :
              'bg-gray-100 text-gray-400'
            )}>
              {i < step ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span className={cn('text-sm font-medium hidden sm:block', i === step ? 'text-ink' : 'text-gray-400')}>
              {s}
            </span>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card card-body space-y-6">

          {/* ── STEP 0: DEAL DETAILS ── */}
          {step === 0 && (
            <>
              <div className="form-group">
                <label className="label">
                  <Tag size={14} className="inline mr-1 text-gray-400" />
                  Deal Title <span className="text-danger">*</span>
                </label>
                <input
                  {...register('title')}
                  className={cn('input', errors.title && 'input-error')}
                  placeholder="e.g. SEO optimization for my e-commerce store"
                />
                {errors.title && <p className="error-msg">{errors.title.message}</p>}
              </div>

              <div className="form-group">
                <label className="label">Category <span className="text-danger">*</span></label>
                <select {...register('category')} className={cn('input', errors.category && 'input-error')}>
                  <option value="">Select a category…</option>
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
                {errors.category && <p className="error-msg">{errors.category.message}</p>}
              </div>

              <div className="form-group">
                <label className="label">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={5}
                  className={cn('input resize-none', errors.description && 'input-error')}
                  placeholder="Describe exactly what work the seller needs to deliver. Be specific — this protects both parties in case of a dispute."
                />
                <div className="flex justify-between mt-1">
                  {errors.description
                    ? <p className="error-msg">{errors.description.message}</p>
                    : <span />
                  }
                  <span className="text-xs text-gray-400">{watch('description')?.length || 0}/5000</span>
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="label">
                  <User size={14} className="inline mr-1 text-gray-400" />
                  Seller Email <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('sellerEmail')}
                    type="email"
                    className={cn('input pr-10', errors.sellerEmail && 'input-error')}
                    placeholder="seller@example.com"
                    onChange={e => {
                      register('sellerEmail').onChange(e);
                      setSellerSearch(e.target.value);
                    }}
                  />
                  {searchingUser && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-upwork-green border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {errors.sellerEmail && <p className="error-msg">{errors.sellerEmail.message}</p>}

                {/* Seller found */}
                {sellerData?.user && (
                  <div className="mt-2 flex items-center gap-3 p-3 bg-upwork-green-l border border-upwork-green/20 rounded-lg">
                    <div className="avatar w-8 h-8 text-xs">
                      {sellerData.user.avatar
                        ? <img src={sellerData.user.avatar} alt="" className="w-full h-full" />
                        : <span>{sellerData.user.fullName.slice(0, 2).toUpperCase()}</span>
                      }
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-upwork-green">{sellerData.user.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {sellerData.user.stats?.totalDealsAsSeller || 0} deals completed
                        {sellerData.user.kyc?.status === 'approved' && ' · ✓ KYC Verified'}
                      </p>
                    </div>
                    <CheckCircle2 size={18} className="text-upwork-green ml-auto" />
                  </div>
                )}
                {sellerSearch.includes('@') && sellerSearch.length > 4 && !searchingUser && sellerData?.user === null && (
                  <p className="text-xs text-amber-600 mt-1.5">
                    This email is not registered yet — an invitation link will be sent to them when you create the deal.
                  </p>
                )}
              </div>
            </>
          )}

          {/* ── STEP 1: AMOUNT & DEADLINE ── */}
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="label">
                  <DollarSign size={14} className="inline mr-1 text-gray-400" />
                  Deal Amount (PKR) <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">Rs.</span>
                  <input
                    {...register('amountPKR')}
                    type="number"
                    min="1000"
                    step="100"
                    className={cn('input pl-10', errors.amountPKR && 'input-error')}
                    placeholder="15000"
                  />
                </div>
                {errors.amountPKR && <p className="error-msg">{errors.amountPKR.message}</p>}

                {/* Fee Breakdown */}
                {watchedAmount && Number(watchedAmount) >= 1000 && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Deal Amount</span>
                      <span>Rs. {Number(watchedAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-xs">
                      <span>Platform Fee (2%)</span>
                      <span>− Rs. {Number(feeAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-ink border-t border-gray-200 pt-2">
                      <span>Seller Receives</span>
                      <span className="text-upwork-green">Rs. {Number(sellerGets).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group mb-0">
                <label className="label">
                  <Calendar size={14} className="inline mr-1 text-gray-400" />
                  Work Deadline <span className="text-danger">*</span>
                </label>
                <input
                  {...register('deadline')}
                  type="date"
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  className={cn('input', errors.deadline && 'input-error')}
                />
                {errors.deadline && <p className="error-msg">{errors.deadline.message}</p>}
                <p className="text-xs text-gray-400 mt-1.5">
                  Seller must deliver before this date. You can raise a dispute after the deadline passes.
                </p>
              </div>
            </>
          )}

          {/* ── STEP 2: REVIEW ── */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-ink">Review Deal Summary</h3>

              <div className="divide-y divide-gray-75 rounded-lg border border-gray-150 overflow-hidden">
                {[
                  ['Title', watch('title')],
                  ['Category', CATEGORY_LABELS[watch('category')] || watch('category')],
                  ['Seller Email', watch('sellerEmail')],
                  ['Amount', `Rs. ${Number(watch('amountPKR')).toLocaleString()}`],
                  ['Platform Fee (2%)', `Rs. ${Number(feeAmount).toLocaleString()}`],
                  ['Seller Receives', `Rs. ${Number(sellerGets).toLocaleString()}`],
                  ['Deadline', watch('deadline') ? new Date(watch('deadline')).toLocaleDateString('en-PK', { dateStyle: 'long' }) : ''],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-ink text-right max-w-[60%]">{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  The seller will be notified by email. If they don't have an account yet, they'll receive a link to register. Once they accept, you'll be asked to deposit the escrow amount. Funds are only released when you approve the work.
                </p>
              </div>
            </div>
          )}

          {/* ── NAVIGATION ── */}
          <div className="flex justify-between pt-2 border-t border-gray-75">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(s => s - 1)} className="btn-ghost">
                ← Back
              </button>
            ) : <span />}

            {step < STEPS.length - 1 ? (
              <button type="button" onClick={nextStep} className="btn-primary">
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn-primary"
              >
                {createMutation.isPending ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</>
                ) : 'Create Deal & Notify Seller'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
