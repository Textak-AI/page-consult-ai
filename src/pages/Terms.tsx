import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-8 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to PageConsult AI
        </Link>
        
        <article className="prose prose-invert prose-slate max-w-none">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Terms of Service</h1>
          
          <p className="text-gray-400 text-sm mb-8">
            <strong>Effective Date:</strong> January 1, 2026<br />
            <strong>Last Updated:</strong> January 1, 2026
          </p>
          
          <p className="text-gray-300 leading-relaxed">
            Welcome to PageConsult AI ("Service"), operated by Hyperbrand Creative, Ltd ("Company," "we," "us," or "our"). By accessing or using our Service, you agree to be bound by these Terms of Service ("Terms").
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">1. Service Description</h2>
          <p className="text-gray-300 leading-relaxed">
            PageConsult AI is an AI-powered landing page builder that provides strategic consultation, content generation, and page creation tools. The Service uses artificial intelligence to assist users in creating marketing materials.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">2. Account Registration</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            To use certain features, you must create an account. You agree to:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain the security of your password</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized access</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            You must be at least 18 years old to use this Service.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">3. Subscription Plans & Billing</h2>
          
          <h3 className="text-lg font-medium text-white mt-6 mb-3">3.1 Free Trial</h3>
          <p className="text-gray-300 leading-relaxed">
            We offer a 14-day free trial. At the end of the trial, your subscription will automatically convert to a paid plan unless you cancel.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">3.2 Billing</h3>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Subscriptions are billed monthly in advance</li>
            <li>Prices are in USD and exclude applicable taxes</li>
            <li>You authorize us to charge your payment method on file</li>
          </ul>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">3.3 Cancellation</h3>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>You may cancel your subscription at any time from your account settings</li>
            <li>Cancellation takes effect at the end of the current billing period</li>
            <li>No refunds are provided for partial months</li>
          </ul>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">3.4 Price Changes</h3>
          <p className="text-gray-300 leading-relaxed">
            We may change subscription prices with 30 days' notice. Founding Member pricing is locked for the duration of continuous subscription.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">4. Acceptable Use</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            You agree NOT to:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Use the Service for any illegal purpose</li>
            <li>Generate content that is defamatory, obscene, or infringes on others' rights</li>
            <li>Attempt to reverse engineer, hack, or disrupt the Service</li>
            <li>Resell or redistribute the Service without authorization</li>
            <li>Use automated systems to access the Service beyond normal use</li>
            <li>Generate content that violates third-party intellectual property rights</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">5. Intellectual Property</h2>
          
          <h3 className="text-lg font-medium text-white mt-6 mb-3">5.1 Your Content</h3>
          <p className="text-gray-300 leading-relaxed">
            You retain ownership of content you create using the Service. By using the Service, you grant us a limited license to process your content solely to provide the Service.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">5.2 Generated Content</h3>
          <p className="text-gray-300 leading-relaxed">
            Landing pages and content generated through the Service are owned by you. However, AI-generated suggestions are provided "as-is" and may not be unique.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">5.3 Our Property</h3>
          <p className="text-gray-300 leading-relaxed">
            The Service, including its design, features, and underlying technology, remains our exclusive property.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">6. AI-Generated Content Disclaimer</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Content generated by our AI tools is provided for assistance only. You are responsible for:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Reviewing all generated content before use</li>
            <li>Ensuring accuracy of claims and statements</li>
            <li>Compliance with advertising laws and regulations</li>
            <li>Verifying that generated content does not infringe third-party rights</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            We do not guarantee that AI-generated content is accurate, original, or suitable for any particular purpose.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">7. Data & Privacy</h2>
          <p className="text-gray-300 leading-relaxed">
            Your use of the Service is also governed by our <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>. By using the Service, you consent to our collection and use of data as described therein.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">8. Third-Party Services</h2>
          <p className="text-gray-300 leading-relaxed">
            The Service integrates with third-party services (payment processors, AI providers, analytics). Your use of these integrations is subject to their respective terms.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">9. Limitation of Liability</h2>
          <p className="text-gray-300 leading-relaxed mb-4 uppercase font-medium">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND</li>
            <li>WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES</li>
            <li>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS</li>
            <li>WE ARE NOT RESPONSIBLE FOR BUSINESS OUTCOMES FROM USING GENERATED CONTENT</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">10. Indemnification</h2>
          <p className="text-gray-300 leading-relaxed">
            You agree to indemnify and hold harmless the Company from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">11. Termination</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We may suspend or terminate your account if you violate these Terms. Upon termination:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Your right to use the Service ceases immediately</li>
            <li>We may delete your data after 30 days</li>
            <li>Provisions that should survive termination will remain in effect</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">12. Changes to Terms</h2>
          <p className="text-gray-300 leading-relaxed">
            We may update these Terms at any time. Material changes will be communicated via email or in-app notification. Continued use after changes constitutes acceptance.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">13. Governing Law</h2>
          <p className="text-gray-300 leading-relaxed">
            These Terms are governed by the laws of the State of Ohio, USA, without regard to conflict of law principles.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">14. Dispute Resolution</h2>
          <p className="text-gray-300 leading-relaxed">
            Any disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, except for claims eligible for small claims court.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">15. Contact</h2>
          <p className="text-gray-300 leading-relaxed">
            Questions about these Terms? Contact us at:
          </p>
          <p className="text-gray-300 mt-2">
            <strong>Email:</strong>{" "}
            <a href="mailto:support@pageconsult.ai" className="text-cyan-400 hover:text-cyan-300">
              support@pageconsult.ai
            </a>
          </p>

          <hr className="border-white/10 my-10" />

          <p className="text-gray-400 text-sm italic">
            By using PageConsult AI, you acknowledge that you have read, understood, and agree to these Terms of Service.
          </p>
        </article>
      </div>
    </div>
  );
};

export default Terms;
