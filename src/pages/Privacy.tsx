import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          
          <p className="text-gray-400 text-sm mb-8">
            <strong>Effective Date:</strong> January 1, 2026<br />
            <strong>Last Updated:</strong> January 1, 2026
          </p>
          
          <p className="text-gray-300 leading-relaxed">
            Hyperbrand Creative, Ltd ("Company," "we," "us," or "our") operates PageConsult AI. This Privacy Policy explains how we collect, use, disclose, and protect your information.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">1. Information We Collect</h2>
          
          <h3 className="text-lg font-medium text-white mt-6 mb-3">1.1 Information You Provide</h3>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li><strong>Account Information:</strong> Name, email address, password</li>
            <li><strong>Billing Information:</strong> Payment details (processed by Stripe)</li>
            <li><strong>Business Information:</strong> Company name, website URL, industry, and other consultation inputs</li>
            <li><strong>Content:</strong> Text, images, and other materials you upload or generate</li>
          </ul>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">1.2 Information Collected Automatically</h3>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent</li>
            <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
            <li><strong>Log Data:</strong> IP address, access times, referring URLs</li>
            <li><strong>Cookies:</strong> Session and preference cookies (see Section 6)</li>
          </ul>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">1.3 Information from Third Parties</h3>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li><strong>Website Analysis:</strong> When you provide a URL, we extract publicly available information (colors, text, images) to assist with page generation</li>
            <li><strong>Authentication Providers:</strong> If you sign in via Google or other providers</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We use your information to:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Provide, maintain, and improve the Service</li>
            <li>Process transactions and send billing information</li>
            <li>Generate landing pages and strategic recommendations</li>
            <li>Send service updates and marketing communications (with consent)</li>
            <li>Analyze usage patterns to improve our AI models</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">3. AI Processing</h2>
          
          <h3 className="text-lg font-medium text-white mt-6 mb-3">3.1 How AI Uses Your Data</h3>
          <p className="text-gray-300 leading-relaxed">
            Your consultation inputs and content are processed by AI systems to generate landing pages and recommendations. This processing is essential to providing the Service.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">3.2 AI Training</h3>
          <p className="text-gray-300 leading-relaxed">
            We may use anonymized, aggregated data to improve our AI models. We do NOT use your identifiable business information to train AI models that serve other customers.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">4. Information Sharing</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We share your information only as follows:
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">4.1 Service Providers</h3>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>Supabase:</strong> Database and authentication</li>
            <li><strong>Anthropic/OpenAI:</strong> AI processing</li>
            <li><strong>Vercel:</strong> Hosting and delivery</li>
            <li><strong>Analytics providers:</strong> Usage analysis</li>
          </ul>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">4.2 Legal Requirements</h3>
          <p className="text-gray-300 leading-relaxed">
            We may disclose information if required by law, court order, or government request.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">4.3 Business Transfers</h3>
          <p className="text-gray-300 leading-relaxed">
            In the event of a merger, acquisition, or sale of assets, your information may be transferred.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">4.4 With Your Consent</h3>
          <p className="text-gray-300 leading-relaxed">
            We may share information with your explicit consent.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">5. Data Retention</h2>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li><strong>Account Data:</strong> Retained while your account is active, plus 30 days after deletion</li>
            <li><strong>Generated Content:</strong> Retained until you delete it or close your account</li>
            <li><strong>Billing Records:</strong> Retained for 7 years for tax/legal compliance</li>
            <li><strong>Usage Logs:</strong> Retained for 12 months</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">6. Cookies & Tracking</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We use cookies for:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li><strong>Essential:</strong> Authentication, security, preferences</li>
            <li><strong>Analytics:</strong> Understanding how you use the Service</li>
            <li><strong>Marketing:</strong> With consent, for relevant advertising</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            You can control cookies through your browser settings. Disabling essential cookies may affect Service functionality.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">7. Your Rights</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Depending on your location, you may have rights to:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li><strong>Access:</strong> Request a copy of your data</li>
            <li><strong>Correction:</strong> Update inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your data</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing emails</li>
            <li><strong>Restriction:</strong> Limit how we process your data</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            To exercise these rights, contact us at{" "}
            <a href="mailto:support@pageconsult.ai" className="text-cyan-400 hover:text-cyan-300">
              support@pageconsult.ai
            </a>.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">7.1 California Residents (CCPA)</h3>
          <p className="text-gray-300 leading-relaxed">
            California residents have additional rights under the CCPA, including the right to know what personal information is collected and the right to opt-out of the sale of personal information. We do not sell personal information.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">8. Data Security</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We implement industry-standard security measures including:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Encryption in transit (TLS/SSL)</li>
            <li>Encryption at rest</li>
            <li>Access controls and authentication</li>
            <li>Regular security assessments</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            However, no system is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">9. International Transfers</h2>
          <p className="text-gray-300 leading-relaxed">
            Your data may be transferred to and processed in the United States. By using the Service, you consent to this transfer.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">10. Children's Privacy</h2>
          <p className="text-gray-300 leading-relaxed">
            The Service is not intended for children under 18. We do not knowingly collect information from children.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">11. Third-Party Links</h2>
          <p className="text-gray-300 leading-relaxed">
            The Service may contain links to third-party websites. We are not responsible for their privacy practices.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">12. Changes to This Policy</h2>
          <p className="text-gray-300 leading-relaxed">
            We may update this Privacy Policy periodically. Material changes will be communicated via email or in-app notification.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">13. Contact Us</h2>
          <p className="text-gray-300 leading-relaxed">
            For privacy-related questions or to exercise your rights:
          </p>
          <p className="text-gray-300 mt-2">
            <strong>Email:</strong>{" "}
            <a href="mailto:support@pageconsult.ai" className="text-cyan-400 hover:text-cyan-300">
              support@pageconsult.ai
            </a>
          </p>

          <hr className="border-white/10 my-10" />

          <p className="text-gray-400 text-sm italic">
            By using PageConsult AI, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </article>
      </div>
    </div>
  );
};

export default Privacy;
