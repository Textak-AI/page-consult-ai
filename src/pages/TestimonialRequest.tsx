import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Star, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function TestimonialRequest() {
  const { businessSlug } = useParams();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    beforeSituation: '',
    results: '',
    recommendation: '',
    name: '',
    title: '',
    company: '',
    photo: null as File | null
  });

  // Convert slug back to business name (basic version)
  const businessName = businessSlug
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'This Business';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.beforeSituation || !formData.results) {
      toast.error('Please fill in the required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Thank you for your testimonial!');
  };

  const handleChange = (field: keyof typeof formData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 rounded-2xl p-8 max-w-md text-center border border-slate-700"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Thank You!</h1>
          <p className="text-slate-400">
            Your testimonial has been submitted. {businessName} will be thrilled!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-6 h-6 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Share Your Experience with {businessName}
          </h1>
          <p className="text-slate-400">
            Your feedback helps others make informed decisions
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              What was your situation before working with {businessName}? *
            </label>
            <Textarea
              placeholder="Before working together, I was struggling with..."
              value={formData.beforeSituation}
              onChange={(e) => handleChange('beforeSituation', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 min-h-24"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              What specific results did you achieve? *
            </label>
            <Textarea
              placeholder="After working together, I saw..."
              value={formData.results}
              onChange={(e) => handleChange('results', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 min-h-24"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              What would you tell someone considering {businessName}?
            </label>
            <Textarea
              placeholder="I would say..."
              value={formData.recommendation}
              onChange={(e) => handleChange('recommendation', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 min-h-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Name *
              </label>
              <Input
                placeholder="Jane Smith"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title / Company
              </label>
              <Input
                placeholder="CEO at Acme Inc"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Photo (optional)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-700 border border-slate-600 border-dashed rounded-lg cursor-pointer hover:bg-slate-600 transition-colors">
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-400">
                  {formData.photo ? formData.photo.name : 'Upload a photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleChange('photo', e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white py-6 text-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            By submitting, you agree to let {businessName} use your testimonial on their website.
          </p>
        </motion.form>
      </div>
    </div>
  );
}
