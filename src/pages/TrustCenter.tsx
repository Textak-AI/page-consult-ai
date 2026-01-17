import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Server, Database, CreditCard, Brain, Globe, Lock, Key,
  ShieldCheck, FileText, UserCheck, Activity, Award, CheckCircle2,
  Download, FileCheck, Mail, AlertTriangle, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageFooter } from '@/components/PageFooter';

export default function TrustCenter() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Helmet>
        <title>Trust Center | PageConsult AI Security & Compliance</title>
        <meta name="description" content="Learn about PageConsult AI's enterprise-grade security practices, data protection measures, and compliance standards. Your business intelligence is protected by industry-leading security." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-slate-900 to-blue-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Enterprise-Grade Security
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">
              Trust & Security at PageConsult AI
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Your strategic business intelligence is our top priority. We implement industry-leading security 
              practices to protect your competitive data at every layer.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
          >
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center backdrop-blur-sm">
              <div className="text-3xl font-bold text-green-400">99.9%</div>
              <div className="text-sm text-gray-400 mt-1">Uptime SLA</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center backdrop-blur-sm">
              <div className="text-3xl font-bold text-purple-400">AES-256</div>
              <div className="text-sm text-gray-400 mt-1">Encryption at Rest</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center backdrop-blur-sm">
              <div className="text-3xl font-bold text-blue-400">TLS 1.3</div>
              <div className="text-sm text-gray-400 mt-1">Encryption in Transit</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center backdrop-blur-sm">
              <div className="text-3xl font-bold text-cyan-400">SOC 2</div>
              <div className="text-sm text-gray-400 mt-1">Framework Compliant</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Infrastructure Security */}
      <section className="py-16 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-purple-400 font-semibold mb-4">
              <Server className="w-5 h-5" />
              Infrastructure Security
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We partner with industry-leading, certified providers to ensure your data is protected 
              by best-in-class security infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Supabase */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <Database className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">Supabase</h3>
                    <span className="text-xs px-2 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                      SOC 2 Type II Certified
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">Database, Authentication & Storage</p>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Row-level security (RLS) on all data tables
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      AES-256 encryption at rest
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Automated daily backups with 7-day retention
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Point-in-time recovery
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Stripe */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">Stripe</h3>
                    <span className="text-xs px-2 py-1 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
                      PCI DSS Level 1
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">Payment Processing</p>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      PCI DSS Level 1 certified
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Payment data never touches our servers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      SOC 1, SOC 2 Type II compliant
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Advanced fraud detection
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Anthropic */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">Anthropic Claude</h3>
                    <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                      Enterprise Security
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">AI Processing</p>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Zero data retention on API calls
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Your prompts not used for model training
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      SOC 2 Type II compliant
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      HIPAA-eligible infrastructure
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Hosting */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <Globe className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">Application Hosting</h3>
                    <span className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
                      Enterprise Infrastructure
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">Global CDN & Edge Compute</p>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      DDoS protection included
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      TLS 1.3 encryption enforced
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      Automatic SSL certificate renewal
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      99.9% uptime SLA
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Security */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-blue-400 font-semibold mb-4">
              <Lock className="w-5 h-5" />
              Application Security
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built-in security controls at every layer of the application protect your strategic data from unauthorized access.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Data Isolation */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg w-fit mb-4">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Data Isolation</h3>
              <p className="text-sm text-gray-400 mb-4">
                Your consultation data is completely isolated from other users through database-level row security.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Row-level security (RLS) on all tables
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  User-scoped queries enforced at database level
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  No cross-user data leakage possible
                </li>
              </ul>
            </div>

            {/* Authentication */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg w-fit mb-4">
                <Key className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Authentication</h3>
              <p className="text-sm text-gray-400 mb-4">
                Secure, industry-standard authentication with automatic session management.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  JWT-based session tokens (1-hour expiration)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Bcrypt password hashing
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  OAuth social login support
                </li>
              </ul>
            </div>

            {/* API Security */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg w-fit mb-4">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">API Security</h3>
              <p className="text-sm text-gray-400 mb-4">
                All third-party API keys are secured server-side, never exposed to client browsers.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  API keys stored in encrypted secrets
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  All AI requests proxy through secure endpoints
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  CORS restricted to authorized domains
                </li>
              </ul>
            </div>

            {/* Audit Logging */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg w-fit mb-4">
                <FileText className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Audit Logging</h3>
              <p className="text-sm text-gray-400 mb-4">
                Complete audit trail of all data access and modifications for compliance and security monitoring.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  All data access events logged
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  User actions tracked with timestamps
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Immutable audit log retention
                </li>
              </ul>
            </div>

            {/* Access Control */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg w-fit mb-4">
                <UserCheck className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Access Control</h3>
              <p className="text-sm text-gray-400 mb-4">
                Fine-grained permissions ensure users only access their own data and authorized resources.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Role-based access control (RBAC)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Least privilege principle enforced
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Authorization checks on every request
                </li>
              </ul>
            </div>

            {/* Monitoring */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg w-fit mb-4">
                <Activity className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Monitoring & Response</h3>
              <p className="text-sm text-gray-400 mb-4">
                Real-time monitoring and alerting to detect and respond to security incidents quickly.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  24/7 uptime monitoring
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Error tracking and alerting
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  Automatic security patch deployment
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Standards */}
      <section className="py-16 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-green-400 font-semibold mb-4">
              <Award className="w-5 h-5" />
              Compliance & Standards
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We follow industry-leading security frameworks and work with certified infrastructure partners.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* SOC 2 Framework */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">SOC 2 Framework Compliance</h3>
              <p className="text-sm text-gray-400 mb-6">
                PageConsult AI implements security controls aligned with SOC 2 Trust Service Criteria:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Security</div>
                    <div className="text-xs text-gray-500">Protected against unauthorized access</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                  <Activity className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Availability</div>
                    <div className="text-xs text-gray-500">99.9% uptime SLA with redundancy</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                  <Lock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Confidentiality</div>
                    <div className="text-xs text-gray-500">Data encrypted and access-controlled</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Processing Integrity</div>
                    <div className="text-xs text-gray-500">Accurate, timely AI processing</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Privacy */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3">Data Privacy & Protection</h3>
              <p className="text-sm text-gray-400 mb-6">
                We respect your data rights and comply with international data protection standards:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">GDPR Aligned</div>
                    <div className="text-xs text-gray-500">European data protection standards</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                  <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">CCPA Compliant</div>
                    <div className="text-xs text-gray-500">California consumer privacy rights</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                  <Download className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Data Portability</div>
                    <div className="text-xs text-gray-500">Export your data at any time</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                  <FileText className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Right to Deletion</div>
                    <div className="text-xs text-gray-500">Request complete data removal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certified Partners Banner */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
            <h3 className="text-center font-semibold text-gray-300 mb-6">
              Our Infrastructure Partners Maintain These Certifications
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                <div className="font-semibold text-purple-300">SOC 2 Type II</div>
                <div className="text-xs text-gray-500 mt-1">Supabase, Stripe, Anthropic</div>
              </div>
              <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                <div className="font-semibold text-blue-300">ISO 27001</div>
                <div className="text-xs text-gray-500 mt-1">Supabase</div>
              </div>
              <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                <div className="font-semibold text-green-300">HIPAA</div>
                <div className="text-xs text-gray-500 mt-1">Supabase, Anthropic</div>
              </div>
              <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                <div className="font-semibold text-cyan-300">PCI DSS</div>
                <div className="text-xs text-gray-500 mt-1">Stripe Level 1</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Documentation */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-cyan-400 font-semibold mb-4">
              <FileCheck className="w-5 h-5" />
              Security Documentation
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Download our security documentation for procurement and compliance reviews.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <a 
              href="#" 
              className="block bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/30 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 group-hover:text-purple-300 transition-colors">
                    Security Overview (PDF)
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    High-level summary of our security architecture and practices.
                  </p>
                  <span className="text-sm text-purple-400 flex items-center gap-1">
                    Download PDF <Download className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </a>

            <a 
              href="#" 
              className="block bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/30 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <FileCheck className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 group-hover:text-blue-300 transition-colors">
                    Security Questionnaire Responses
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Pre-filled responses to common security assessment questions.
                  </p>
                  <span className="text-sm text-blue-400 flex items-center gap-1">
                    Download PDF <Download className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </a>

            <a 
              href="#" 
              className="block bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 hover:border-green-500/30 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <FileText className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 group-hover:text-green-300 transition-colors">
                    Data Processing Agreement
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Standard DPA for GDPR and data protection compliance.
                  </p>
                  <span className="text-sm text-green-400 flex items-center gap-1">
                    Download PDF <Download className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Contact & Support */}
      <section className="py-16 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Questions About Security?</h2>
          <p className="text-gray-400 mb-8">
            Our security team is here to address your concerns and support your compliance requirements.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg w-fit mx-auto mb-4">
                <Mail className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Security Team</h3>
              <p className="text-sm text-gray-400 mb-3">
                For security inquiries, vulnerability reports, or compliance questions
              </p>
              <a 
                href="mailto:security@pageconsult.ai" 
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                security@pageconsult.ai
              </a>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg w-fit mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-semibold mb-2">Report Security Issue</h3>
              <p className="text-sm text-gray-400 mb-3">
                Found a vulnerability? We appreciate responsible disclosure.
              </p>
              <a 
                href="mailto:security@pageconsult.ai?subject=Security%20Vulnerability%20Report" 
                className="text-red-400 hover:text-red-300 font-semibold"
              >
                Report Vulnerability
              </a>
            </div>
          </div>

          {/* Response Times */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-green-400">&lt; 1 Hour</div>
                <div className="text-sm text-gray-400">Critical Security Issues</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">&lt; 24 Hours</div>
                <div className="text-sm text-gray-400">Security Inquiries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">&lt; 48 Hours</div>
                <div className="text-sm text-gray-400">Questionnaire Responses</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">
            Ready to see PageConsult AI in action?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Try Free Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/contact')}
              variant="outline"
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
