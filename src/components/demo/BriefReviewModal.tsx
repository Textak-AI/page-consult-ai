import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, FileText, ArrowRight, Check, AlertCircle, Pencil, Sparkles,
  Palette, Image, Code, HelpCircle, Loader2, RefreshCw, Lightbulb,
  ChevronDown, Plus, AlertTriangle, Zap
} from 'lucide-react';
import { useIntelligence } from '@/contexts/IntelligenceContext';
import { useBriefValidation } from '@/hooks/useBriefValidation';
import type { BriefData, FieldValidation, Suggestion } from '@/types/brief-validation';

interface BriefReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (briefData: BriefData) => void;
}

export function BriefReviewModal({ isOpen, onClose, onGenerate }: BriefReviewModalProps) {
  const { state, updateExtracted } = useIntelligence();
  const { isValidating, validation, validateBrief, getSuggestionValue, getMissedExtraction } = useBriefValidation();
  
  // Editable intelligence fields
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  
  // Editable brand elements
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [brandColors, setBrandColors] = useState({
    primary: '#3B82F6',
    secondary: '#1E293B',
    accent: '#06B6D4',
  });
  const [fonts, setFonts] = useState({ heading: 'Inter', body: 'Inter' });
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMissedExtractions, setShowMissedExtractions] = useState(true);
  
  // Get conversation messages from state
  const messages = state.conversation || [];
  
  // Initialize from state when modal opens
  useEffect(() => {
    if (isOpen && state.extracted) {
      setEditedFields({
        industry: state.extracted.industry || '',
        audience: state.extracted.audience || '',
        valueProp: state.extracted.valueProp || '',
        edge: state.extracted.competitorDifferentiator || '',
        painPoints: state.extracted.painPoints || '',
        objections: state.extracted.buyerObjections || '',
        results: state.extracted.proofElements || '',
        socialProof: state.extracted.socialProof || '',
      });
      
      // Load brand
      if (state.extractedLogo) setLogoPreview(state.extractedLogo);
      if (state.extractedBrand?.colors) {
        setBrandColors({
          primary: state.extractedBrand.colors.primary || '#3B82F6',
          secondary: state.extractedBrand.colors.secondary || '#1E293B',
          accent: state.extractedBrand.colors.accent || '#06B6D4',
        });
      }
      if (state.extractedBrand?.fonts) {
        setFonts({
          heading: state.extractedBrand.fonts.heading || 'Inter',
          body: state.extractedBrand.fonts.body || 'Inter',
        });
      }
      
      // Run validation
      runValidation();
    }
  }, [isOpen]);
  
  const runValidation = async () => {
    if (!messages || messages.length === 0) return;
    
    await validateBrief(
      messages.map(m => ({ role: m.role, content: m.content })),
      editedFields,
      { 
        companyName: state.businessCard?.companyName,
        website: state.businessCard?.website,
      }
    );
  };
  
  // Handle field changes
  const handleFieldChange = (field: string, value: string) => {
    setEditedFields(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveField = () => {
    setEditingField(null);
  };
  
  // Handle accepting a suggestion
  const handleAcceptSuggestion = (fieldKey: string, suggestionId: string) => {
    const newValue = getSuggestionValue(fieldKey, suggestionId);
    if (newValue) {
      setEditedFields(prev => ({ ...prev, [fieldKey]: newValue }));
    }
  };
  
  // Handle accepting a missed extraction
  const handleAcceptMissed = (extractionId: string) => {
    const missed = getMissedExtraction(extractionId);
    if (missed) {
      setEditedFields(prev => ({
        ...prev,
        [missed.fieldKey]: prev[missed.fieldKey] 
          ? `${prev[missed.fieldKey]}\n\n${missed.value}`
          : missed.value,
      }));
    }
  };
  
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setLogoPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };
  
  // Handle generate
  const handleGenerate = async () => {
    setIsGenerating(true);
    
    const briefData: BriefData = {
      intelligence: editedFields,
      brand: {
        logo: logoPreview,
        colors: brandColors,
        fonts: fonts,
      },
      aiSeo: {
        schemaType: inferSchemaType(editedFields.industry),
        generateFaqs: true,
        citationOptimized: true,
      },
      validationScore: validation?.overallQuality || 0,
    };
    
    // Save edits to context
    if (updateExtracted) {
      updateExtracted({
        industry: editedFields.industry || null,
        audience: editedFields.audience || null,
        valueProp: editedFields.valueProp || null,
        competitorDifferentiator: editedFields.edge || null,
        painPoints: editedFields.painPoints || null,
        buyerObjections: editedFields.objections || null,
        proofElements: editedFields.results || null,
        socialProof: editedFields.socialProof || null,
      });
    }
    
    // Trigger generation
    await onGenerate(briefData);
    setIsGenerating(false);
  };
  
  const score = state.readiness || 0;
  
  // Section definitions
  const sections = [
    { 
      id: 'who', title: 'WHO YOU ARE', icon: '🎯',
      fields: [
        { key: 'industry', label: 'Industry', required: true, placeholder: 'e.g., B2B SaaS, Healthcare cybersecurity' },
        { key: 'audience', label: 'Target Audience', required: true, placeholder: 'e.g., CISOs at mid-size healthcare organizations' },
      ]
    },
    {
      id: 'offer', title: 'WHAT YOU OFFER', icon: '💎',
      fields: [
        { key: 'valueProp', label: 'Value Proposition', required: true, placeholder: 'The main benefit you deliver' },
        { key: 'edge', label: 'Your Edge', required: false, placeholder: 'What makes you different' },
      ]
    },
    {
      id: 'buyer', title: 'BUYER REALITY', icon: '🧠',
      fields: [
        { key: 'painPoints', label: 'Pain Points', required: false, placeholder: 'Problems your audience faces' },
        { key: 'objections', label: 'Objections', required: false, placeholder: 'Why they hesitate' },
      ]
    },
    {
      id: 'proof', title: 'PROOF & CREDIBILITY', icon: '✅',
      fields: [
        { key: 'results', label: 'Results', required: false, placeholder: 'Specific outcomes (with numbers)' },
        { key: 'socialProof', label: 'Social Proof', required: false, placeholder: 'Testimonials, logos, case studies' },
      ]
    },
  ];
  
  const missedExtractions = validation?.missedExtractions || [];
  const globalWarnings = validation?.globalWarnings?.filter(w => w.severity !== 'info') || [];
  const aiSeoScore = calculateAiSeoScore(editedFields, logoPreview);
  const generatedFaqs = generateFaqPreviews(editedFields);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 bg-slate-900 rounded-2xl border border-slate-700/50 z-50 flex flex-col overflow-hidden"
          >
            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
                  <FileText className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-white">Strategy Brief</h2>
                  <p className="text-xs md:text-sm text-slate-400">Review and enhance before generating</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {isValidating && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </div>
                )}
                {validation && !isValidating && (
                  <QualityBadge score={validation.overallQuality} />
                )}
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            
            {/* ===== SCORE BAR ===== */}
            <div className="px-4 md:px-6 py-3 bg-slate-800/50 border-b border-slate-700/30">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-slate-400">Brief Completeness</span>
                <span className="text-white font-medium">{score}/100</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                />
              </div>
            </div>
            
            {/* ===== WARNINGS BANNER ===== */}
            {globalWarnings.length > 0 && (
              <div className="mx-4 md:mx-6 mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-300">
                    {globalWarnings.length} issue{globalWarnings.length > 1 ? 's' : ''} to review
                  </span>
                </div>
                <div className="space-y-1">
                  {globalWarnings.map((w) => (
                    <p key={w.id} className="text-xs text-amber-200/80 pl-6">
                      •{w.message}
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {/* ===== MISSED EXTRACTIONS BANNER ===== */}
            {missedExtractions.length > 0 && (
              <div className="mx-4 md:mx-6 mt-4 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <button
                  onClick={() => setShowMissedExtractions(!showMissedExtractions)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-cyan-300">
                      Found {missedExtractions.length} item{missedExtractions.length > 1 ? 's' : ''} we may have missed
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform ${showMissedExtractions ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showMissedExtractions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2">
                        {missedExtractions.map((item) => (
                          <div key={item.id} className="flex items-start justify-between gap-3 p-2 rounded-lg bg-slate-800/50">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-200 line-clamp-2">{item.value}</p>
                              <p className="text-xs text-slate-500 mt-0.5">→ Add to {item.fieldKey}</p>
                            </div>
                            <button
                              onClick={() => handleAcceptMissed(item.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-cyan-500/20 rounded text-cyan-300 hover:bg-cyan-500/30"
                            >
                              <Plus className="w-3 h-3" /> Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {/* ===== SCROLLABLE CONTENT ===== */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              
              {/* Intelligence Sections */}
              {sections.map((section) => (
                <div key={section.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{section.icon}</span>
                    <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                      {section.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {section.fields.map((field) => (
                      <ValidatedField
                        key={field.key}
                        label={field.label}
                        value={editedFields[field.key] || ''}
                        placeholder={field.placeholder}
                        required={field.required}
                        validation={validation?.fieldsValidation[field.key]}
                        isEditing={editingField === field.key}
                        onEdit={() => setEditingField(field.key)}
                        onChange={(v) => handleFieldChange(field.key, v)}
                        onSave={() => handleSaveField()}
                        onCancel={() => setEditingField(null)}
                        onAcceptSuggestion={(id) => handleAcceptSuggestion(field.key, id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
              
              {/* ===== BRAND ELEMENTS ===== */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎨</span>
                  <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">BRAND ELEMENTS</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  {/* Logo */}
                  <div className="flex items-center gap-3">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="relative w-20 h-20 rounded-xl bg-slate-700/50 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden group hover:border-cyan-500/50 transition-all"
                    >
                      {logoPreview ? (
                        <>
                          <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Pencil className="w-4 h-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="text-center">
                          <Image className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                          <span className="text-[10px] text-slate-500">Upload</span>
                        </div>
                      )}
                    </button>
                    <div className="text-xs">
                      <p className="text-slate-300">{logoPreview ? 'Click to change' : 'Upload logo'}</p>
                      <p className="text-slate-500">PNG, JPG, or SVG</p>
                    </div>
                  </div>
                  
                  {/* Colors */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500">
                      <Palette className="w-3 h-3 inline mr-1" /> Brand Colors
                    </label>
                    <div className="flex gap-2">
                      <ColorPicker label="Primary" value={brandColors.primary} onChange={(c) => setBrandColors(p => ({ ...p, primary: c }))} />
                      <ColorPicker label="Secondary" value={brandColors.secondary} onChange={(c) => setBrandColors(p => ({ ...p, secondary: c }))} />
                      <ColorPicker label="Accent" value={brandColors.accent} onChange={(c) => setBrandColors(p => ({ ...p, accent: c }))} />
                    </div>
                  </div>
                  
                  {/* Fonts */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500">Typography</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <select 
                          value={fonts.heading} 
                          onChange={(e) => setFonts(p => ({ ...p, heading: e.target.value }))} 
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Playfair Display">Playfair Display</option>
                          <option value="Montserrat">Montserrat</option>
                        </select>
                        <span className="text-[10px] text-slate-500 mt-1 block">Headings</span>
                      </div>
                      <div>
                        <select 
                          value={fonts.body} 
                          onChange={(e) => setFonts(p => ({ ...p, body: e.target.value }))} 
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Lato">Lato</option>
                        </select>
                        <span className="text-[10px] text-slate-500 mt-1 block">Body</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* ===== AI SEO PREVIEW ===== */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">AI SEO</h3>
                  </div>
                  <span className="text-xs text-slate-500">Auto-generated</span>
                </div>
                
                <div className="space-y-3">
                  {/* Score */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-slate-300">AI Discoverability</span>
                    </div>
                    <span className="text-sm font-medium text-purple-300">{aiSeoScore}/100</span>
                  </div>
                  
                  {/* Schema */}
                  <div className="p-3 rounded-lg bg-slate-900/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-500">Schema (JSON-LD)</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 space-y-0.5">
                      <p><span className="text-cyan-400">@type:</span> {inferSchemaType(editedFields.industry)}</p>
                      <p>name: {state.businessCard?.companyName || '[Company]'}</p>
                      <p>description: {editedFields.valueProp?.slice(0, 40) || '[Value prop]'}...</p>
                    </div>
                  </div>
                  
                  {/* FAQs */}
                  <div className="p-3 rounded-lg bg-slate-900/50">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-500">Auto FAQs ({generatedFaqs.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {generatedFaqs.slice(0, 2).map((faq, i) => (
                        <p key={i} className="text-xs text-slate-400">
                          <span className="text-cyan-400">Q:</span> {faq.question}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* ===== FOOTER ===== */}
            <div className="flex items-center justify-between p-4 md:p-6 border-t border-slate-700/50 bg-slate-900/95">
              <div className="flex items-center gap-3">
                <button
                  onClick={runValidation}
                  disabled={isValidating}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
                  Re-analyze conversation
                </button>
                {validation?.suggestedActions && (
                  <span className="text-xs text-slate-600">
                    {validation.suggestedActions.length} suggestions
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Keep Editing
                </button>
                
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-medium disabled:opacity-50 transition-all"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  ) : (
                    <><FileText className="w-4 h-4" /> Generate Your Page</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ==================== SUB-COMPONENTS ====================

function ValidatedField({ label, value, placeholder, required, validation, isEditing, onEdit, onChange, onSave, onCancel, onAcceptSuggestion }: {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  validation?: FieldValidation;
  isEditing: boolean;
  onEdit: () => void;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onAcceptSuggestion: (id: string) => void;
}) {
  const quality = validation?.quality || 'good';
  const suggestions = validation?.suggestions || [];
  const isEmpty = !value?.trim();

  if (isEditing) {
    return (
      <div className="space-y-3 p-3 rounded-xl bg-slate-800/60 border border-cyan-500/30">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{label}</span>
          {required && <span className="text-amber-400">*</span>}
          {validation && <QualityIndicator quality={quality} size="sm" />}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-cyan-500"
          rows={3}
          autoFocus
        />
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 uppercase">AI Suggestions</span>
            {suggestions.slice(0, 2).map((s) => (
              <div key={s.id} className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs text-purple-300 line-clamp-2">{s.suggestedValue}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-500">{s.reason}</span>
                  <button onClick={() => { onChange(s.suggestedValue); onAcceptSuggestion(s.id); }} className="text-[10px] text-cyan-400 hover:text-cyan-300">
                    Use this
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Cancel</button>
          <button onClick={onSave} className="px-3 py-1.5 text-xs bg-cyan-500 text-white rounded-lg">Save</button>
        </div>
      </div>
    );
  }

  const borderClass = isEmpty 
    ? 'border-slate-700/30 border-dashed' 
    : quality === 'weak' ? 'border-amber-500/30' 
    : quality === 'strong' ? 'border-emerald-500/30' 
    : 'border-slate-700/50';

  return (
    <div className="space-y-2">
      <div onClick={onEdit} className={`p-3 rounded-xl bg-slate-800/40 border cursor-pointer hover:border-cyan-500/30 transition-all group ${borderClass}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-xs text-slate-500">{label}{required && <span className="text-amber-400 ml-1">*</span>}</label>
              {validation && <QualityIndicator quality={quality} size="sm" />}
            </div>
            {isEmpty ? (
              <p className="text-sm text-slate-600 italic">{placeholder}</p>
            ) : (
              <p className="text-sm text-slate-200 line-clamp-2">{value}</p>
            )}
          </div>
          <Pencil className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
        </div>
      </div>
      
      {suggestions.length > 0 && !isEditing && (
        <div className="flex flex-wrap gap-2 pl-3">
          {suggestions.slice(0, 1).map((s) => (
            <button key={s.id} onClick={() => onAcceptSuggestion(s.id)} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 hover:bg-purple-500/20">
              <Sparkles className="w-3 h-3" />
              <span className="truncate max-w-[180px]">{s.suggestedValue.slice(0, 25)}...</span>
              <Plus className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function QualityIndicator({ quality, size = 'md' }: { quality: 'weak' | 'good' | 'strong'; size?: 'sm' | 'md' }) {
  const config = {
    weak: { color: 'text-amber-400 bg-amber-400/10', icon: AlertTriangle, label: 'Needs work' },
    good: { color: 'text-slate-400 bg-slate-400/10', icon: Check, label: 'Good' },
    strong: { color: 'text-emerald-400 bg-emerald-400/10', icon: Zap, label: 'Strong' },
  };
  const { color, icon: Icon, label } = config[quality];
  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${color} ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      <span>{label}</span>
    </div>
  );
}

function QualityBadge({ score }: { score: number }) {
  const config = score >= 80 ? { label: 'Excellent', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' }
    : score >= 60 ? { label: 'Good', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' }
    : score >= 40 ? { label: 'Fair', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' }
    : { label: 'Needs Work', color: 'text-red-400 bg-red-400/10 border-red-400/30' };
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${config.color}`}>
      <span className="text-xs font-medium">{config.label}</span>
      <span className="text-xs opacity-70">{score}</span>
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <input 
        type="color" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-10 h-10 rounded-lg border-2 border-slate-600 cursor-pointer" 
        style={{ backgroundColor: value }} 
      />
      <span className="text-[10px] text-slate-500">{label}</span>
    </div>
  );
}

// ==================== HELPER FUNCTIONS ====================

function inferSchemaType(industry?: string): string {
  if (!industry) return 'ProfessionalService';
  const lower = industry.toLowerCase();
  if (lower.includes('saas') || lower.includes('software')) return 'SoftwareApplication';
  if (lower.includes('healthcare') || lower.includes('medical')) return 'MedicalBusiness';
  if (lower.includes('legal')) return 'LegalService';
  if (lower.includes('financial')) return 'FinancialService';
  return 'ProfessionalService';
}

function calculateAiSeoScore(fields: Record<string, string>, logo: string | null): number {
  let score = 0;
  if (fields.industry?.trim()) score += 10;
  if (fields.audience?.trim()) score += 10;
  if (fields.valueProp?.trim()) score += 15;
  if (fields.edge?.trim()) score += 10;
  if (fields.painPoints?.trim()) score += 10;
  if (fields.results?.trim()) score += 15;
  if (fields.socialProof?.trim()) score += 10;
  if (logo) score += 10;
  if (fields.results?.match(/\d+%|\$[\d,]+|\d+x/)) score += 10;
  return Math.min(100, score);
}

function generateFaqPreviews(fields: Record<string, string>): { question: string }[] {
  const faqs: { question: string }[] = [];
  if (fields.valueProp) faqs.push({ question: 'What makes your solution different?' });
  if (fields.painPoints) faqs.push({ question: 'What problems do you solve?' });
  if (fields.results) faqs.push({ question: 'What results can I expect?' });
  if (fields.audience) faqs.push({ question: 'Who is this for?' });
  return faqs;
}
