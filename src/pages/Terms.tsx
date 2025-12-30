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
            <li>Use one account per business entity</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            You must be at least 18 years old to use this Service.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">3. Subscription Plans & Billing</h2>
          
          <h3 className="text-lg font-medium text-white mt-6 mb-3">3.1 Available Plans</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm text-gray-300 border border-white/10 rounded-lg overflow-hidden">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-white">Plan</th>
                  <th className="px-4 py-3 text-left font-medium text-white">Monthly Price</th>
                  <th className="px-4 py-3 text-left font-medium text-white">Included</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr>
                  <td className="px-4 py-3">Starter</td>
                  <td className="px-4 py-3">$29</td>
                  <td className="px-4 py-3">3 pages/month, 10 AI generations/day, 1GB storage</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Founding Member</td>
                  <td className="px-4 py-3">$69</td>
                  <td className="px-4 py-3">Unlimited pages*, 50 AI generations/day, 10GB storage</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Agency</td>
                  <td className="px-4 py-3">$397</td>
                  <td className="px-4 py-3">Unlimited pages*, 200 AI generations/day, 50GB storage</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-400 text-sm italic">*Subject to Fair Use Policy (Section 4)</p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">3.2 Free Trial</h3>
          <p className="text-gray-300 leading-relaxed">
            We offer a 14-day free trial on paid plans. At the end of the trial, your subscription will automatically convert to a paid plan unless you cancel. A valid payment method is required to start a trial.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">3.3 Founding Member Pricing</h3>
          <p className="text-gray-300 leading-relaxed">
            Founding Member pricing ($69/month) is locked in for the lifetime of your continuous subscription. If you cancel and resubscribe, standard pricing will apply at that time.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">3.4 Billing</h3>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Subscriptions are billed monthly in advance</li>
            <li>Prices are in USD and exclude applicable taxes</li>
            <li>Taxes are calculated and collected based on your location</li>
            <li>You authorize us to charge your payment method on file</li>
          </ul>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">3.5 Cancellation & Refunds</h3>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>You may cancel your subscription at any time from your account settings</li>
            <li>Cancellation takes effect at the end of the current billing period</li>
            <li>We offer a 30-day money-back guarantee on your first payment</li>
            <li>No refunds are provided for partial months after the first 30 days</li>
          </ul>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">3.6 Price Changes</h3>
          <p className="text-gray-300 leading-relaxed">
            We may change subscription prices with 30 days' notice. Founding Member pricing is locked for the duration of continuous subscription.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">4. Fair Use Policy</h2>
          
          <h3 className="text-lg font-medium text-white mt-6 mb-3">4.1 "Unlimited" Plans</h3>
          <p className="text-gray-300 leading-relaxed">
            Plans described as "unlimited" are subject to fair use. This means unlimited creation and publishing for legitimate business use by a single business entity.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">4.2 Fair Use Limits</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            To ensure quality service for all users, we maintain soft caps on usage:
          </p>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm text-gray-300 border border-white/10 rounded-lg overflow-hidden">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-white">Activity</th>
                  <th className="px-4 py-3 text-left font-medium text-white">Starter</th>
                  <th className="px-4 py-3 text-left font-medium text-white">Founding</th>
                  <th className="px-4 py-3 text-left font-medium text-white">Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr>
                  <td className="px-4 py-3">Pages Created/Month</td>
                  <td className="px-4 py-3">3</td>
                  <td className="px-4 py-3">50*</td>
                  <td className="px-4 py-3">200*</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">AI Generations/Day</td>
                  <td className="px-4 py-3">10</td>
                  <td className="px-4 py-3">50</td>
                  <td className="px-4 py-3">200</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Published Pages (Total)</td>
                  <td className="px-4 py-3">10</td>
                  <td className="px-4 py-3">100</td>
                  <td className="px-4 py-3">500</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Asset Storage</td>
                  <td className="px-4 py-3">1GB</td>
                  <td className="px-4 py-3">10GB</td>
                  <td className="px-4 py-3">50GB</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Team Members</td>
                  <td className="px-4 py-3">1</td>
                  <td className="px-4 py-3">1</td>
                  <td className="px-4 py-3">5</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-400 text-sm italic">*Soft cap — legitimate users can request increases</p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">4.3 What's NOT Permitted</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            "Unlimited" does not permit:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Automated or programmatic page generation (bots, scripts, API abuse)</li>
            <li>Reselling page generation as a service (without Agency plan)</li>
            <li>Generating pages for multiple unrelated businesses on one account</li>
            <li>Bulk generation intended to strain system resources</li>
            <li>Creating pages with no intent to publish or use</li>
            <li>Sharing account credentials with third parties</li>
            <li>Circumventing usage tracking or limits</li>
          </ul>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">4.4 Enforcement</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            If we detect usage patterns that appear to violate fair use:
          </p>
          <ol className="text-gray-300 space-y-2 list-decimal pl-6">
            <li>We will contact you to understand your use case</li>
            <li>We may temporarily limit generation while we review</li>
            <li>Legitimate high-volume users can request limit increases</li>
            <li>Repeated or intentional abuse may result in account suspension</li>
          </ol>
          <p className="text-gray-300 leading-relaxed mt-4">
            We want you to succeed — these limits exist to protect the community and maintain service quality, not to restrict legitimate business use.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">5. Acceptable Use</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            You agree NOT to:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Use the Service for any illegal purpose</li>
            <li>Generate content that is defamatory, obscene, or infringes on others' rights</li>
            <li>Attempt to reverse engineer, hack, or disrupt the Service</li>
            <li>Resell or redistribute the Service without authorization (Agency white-label excepted)</li>
            <li>Use automated systems to access the Service beyond normal use</li>
            <li>Generate content that violates third-party intellectual property rights</li>
            <li>Create misleading, fraudulent, or deceptive landing pages</li>
            <li>Generate content that promotes hate, violence, or discrimination</li>
            <li>Impersonate other businesses or individuals</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">6. Intellectual Property</h2>
          
          <h3 className="text-lg font-medium text-white mt-6 mb-3">6.1 Your Content</h3>
          <p className="text-gray-300 leading-relaxed">
            You retain ownership of content you create using the Service, including text, images, and business information you provide. By using the Service, you grant us a limited license to process your content solely to provide the Service.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">6.2 Generated Content</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            Landing pages and content generated through the Service are owned by you. However:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>AI-generated suggestions are provided "as-is" and may not be unique</li>
            <li>Similar outputs may be generated for other users with similar inputs</li>
            <li>You are responsible for ensuring generated content doesn't infringe third-party rights</li>
          </ul>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">6.3 Our Property</h3>
          <p className="text-gray-300 leading-relaxed">
            The Service, including its design, features, templates, underlying technology, and AI models, remains our exclusive property.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">6.4 White-Label Rights (Agency Plan)</h3>
          <p className="text-gray-300 leading-relaxed">
            Agency plan subscribers may remove PageConsult branding from generated pages for client delivery. This does not transfer ownership of the underlying technology or grant resale rights to the Service itself.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">7. AI-Generated Content Disclaimer</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Content generated by our AI tools is provided for assistance only. You are responsible for:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Reviewing all generated content before use</li>
            <li>Ensuring accuracy of claims and statements</li>
            <li>Compliance with advertising laws and regulations (FTC, etc.)</li>
            <li>Verifying that generated content does not infringe third-party rights</li>
            <li>Ensuring claims are truthful and substantiated</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4 mb-4">
            We do not guarantee that AI-generated content is:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Accurate or factually correct</li>
            <li>Original or unique</li>
            <li>Suitable for any particular purpose</li>
            <li>Compliant with industry-specific regulations</li>
            <li>Free from bias or errors</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4 font-semibold">
            You assume full responsibility for all content you publish using the Service.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">8. Data & Privacy</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Your use of the Service is governed by our <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>. By using the Service, you consent to our collection and use of data as described therein.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">8.1 Your Data</h3>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>You retain ownership of your business data and content</li>
            <li>We process your data solely to provide the Service</li>
            <li>You can export your data at any time</li>
            <li>Upon account deletion, your data is removed within 30 days</li>
          </ul>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">8.2 Published Pages</h3>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Pages you publish are hosted on our infrastructure</li>
            <li>Published pages are publicly accessible via their URLs</li>
            <li>Analytics data on published pages is provided to you</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">9. Third-Party Services</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            The Service integrates with third-party services including:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>AI Providers:</strong> Content generation (Anthropic, OpenAI, etc.)</li>
            <li><strong>Hosting Providers:</strong> Page delivery and storage</li>
            <li><strong>Analytics:</strong> Usage tracking</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            Your use of these integrations is subject to their respective terms. We are not responsible for third-party service availability or changes.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">10. Service Availability</h2>
          
          <h3 className="text-lg font-medium text-white mt-6 mb-3">10.1 Uptime</h3>
          <p className="text-gray-300 leading-relaxed">
            We strive for 99.9% uptime but do not guarantee uninterrupted service. Planned maintenance will be communicated in advance when possible.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">10.2 Changes to Service</h3>
          <p className="text-gray-300 leading-relaxed">
            We may modify, update, or discontinue features at any time. Material changes will be communicated via email or in-app notification.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">10.3 Support</h3>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li><strong>Starter:</strong> Email support (48-hour response)</li>
            <li><strong>Founding Member:</strong> Priority email support (24-hour response)</li>
            <li><strong>Agency:</strong> Dedicated support (4-hour response during business hours)</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">11. Limitation of Liability</h2>
          <p className="text-gray-300 leading-relaxed mb-4 uppercase font-medium">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED</li>
            <li>WE DISCLAIM ALL WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT</li>
            <li>WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
            <li>WE ARE NOT LIABLE FOR LOST PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES</li>
            <li>OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS</li>
            <li>WE ARE NOT RESPONSIBLE FOR BUSINESS OUTCOMES FROM USING GENERATED CONTENT</li>
            <li>WE ARE NOT LIABLE FOR THIRD-PARTY SERVICE FAILURES OR CHANGES</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">12. Indemnification</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            You agree to indemnify, defend, and hold harmless the Company, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, costs, or expenses (including reasonable attorneys' fees) arising from:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any third-party rights</li>
            <li>Content you create, publish, or distribute using the Service</li>
            <li>Your violation of any applicable laws or regulations</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">13. Termination</h2>
          
          <h3 className="text-lg font-medium text-white mt-6 mb-3">13.1 By You</h3>
          <p className="text-gray-300 leading-relaxed">
            You may cancel your subscription and close your account at any time through your account settings.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">13.2 By Us</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            We may suspend or terminate your account if you:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Violate these Terms or the Fair Use Policy</li>
            <li>Engage in fraudulent or illegal activity</li>
            <li>Abuse the Service or its users</li>
            <li>Fail to pay fees when due</li>
          </ul>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">13.3 Effect of Termination</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            Upon termination:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Your right to use the Service ceases immediately</li>
            <li>Your published pages will be unpublished within 7 days</li>
            <li>We may delete your data after 30 days</li>
            <li>You remain liable for any fees owed</li>
            <li>Provisions that should survive termination will remain in effect</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">14. Changes to Terms</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We may update these Terms at any time. We will provide notice of material changes via:
          </p>
          <ul className="text-gray-300 space-y-2 list-disc pl-6">
            <li>Email to your registered address</li>
            <li>In-app notification</li>
            <li>Banner on our website</li>
          </ul>
          <p className="text-gray-300 leading-relaxed mt-4">
            Continued use of the Service after changes constitutes acceptance of the new Terms. If you disagree with changes, you may cancel your subscription before they take effect.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">15. Governing Law</h2>
          <p className="text-gray-300 leading-relaxed">
            These Terms are governed by the laws of the State of Ohio, USA, without regard to conflict of law principles. You consent to the exclusive jurisdiction of state and federal courts in Cuyahoga County, Ohio.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">16. Dispute Resolution</h2>
          
          <h3 className="text-lg font-medium text-white mt-6 mb-3">16.1 Informal Resolution</h3>
          <p className="text-gray-300 leading-relaxed">
            Before filing any claim, you agree to contact us at{" "}
            <a href="mailto:support@pageconsult.ai" className="text-cyan-400 hover:text-cyan-300">
              support@pageconsult.ai
            </a>{" "}
            and attempt to resolve the dispute informally for at least 30 days.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">16.2 Arbitration</h3>
          <p className="text-gray-300 leading-relaxed">
            Any disputes not resolved informally shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. Arbitration shall take place in Cleveland, Ohio.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">16.3 Exceptions</h3>
          <p className="text-gray-300 leading-relaxed">
            Either party may seek injunctive relief in court for intellectual property violations or to prevent irreparable harm. Claims eligible for small claims court may be filed there.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">16.4 Class Action Waiver</h3>
          <p className="text-gray-300 leading-relaxed">
            You agree to resolve disputes individually and waive any right to participate in class action lawsuits or class-wide arbitration.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">17. General Provisions</h2>
          
          <h3 className="text-lg font-medium text-white mt-6 mb-3">17.1 Entire Agreement</h3>
          <p className="text-gray-300 leading-relaxed">
            These Terms, together with our <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>, constitute the entire agreement between you and the Company.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">17.2 Severability</h3>
          <p className="text-gray-300 leading-relaxed">
            If any provision is found unenforceable, the remaining provisions remain in effect.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">17.3 Waiver</h3>
          <p className="text-gray-300 leading-relaxed">
            Our failure to enforce any right or provision does not constitute a waiver of that right.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">17.4 Assignment</h3>
          <p className="text-gray-300 leading-relaxed">
            You may not assign these Terms without our consent. We may assign our rights to any successor in interest.
          </p>

          <h3 className="text-lg font-medium text-white mt-6 mb-3">17.5 Notices</h3>
          <p className="text-gray-300 leading-relaxed">
            We may send notices via email, in-app notification, or posting on the Service. You may contact us at the address below.
          </p>

          <h2 className="text-xl font-semibold text-white mt-10 mb-4">18. Contact</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Questions about these Terms? Contact us at:
          </p>
          <div className="text-gray-300">
            <p className="font-semibold text-white">Hyperbrand Creative, Ltd</p>
            <p>
              Email:{" "}
              <a href="mailto:support@pageconsult.ai" className="text-cyan-400 hover:text-cyan-300">
                support@pageconsult.ai
              </a>
            </p>
            <p>
              Website:{" "}
              <a href="https://pageconsult.ai" className="text-cyan-400 hover:text-cyan-300" target="_blank" rel="noopener noreferrer">
                https://pageconsult.ai
              </a>
            </p>
          </div>

          <hr className="border-white/10 my-10" />

          <p className="text-gray-400 text-sm italic">
            By using PageConsult AI, you acknowledge that you have read, understood, and agree to these Terms of Service.
          </p>

          <p className="text-gray-500 text-sm mt-4">
            © 2026 Hyperbrand Creative, Ltd. All rights reserved.
          </p>
        </article>
      </div>
    </div>
  );
};

export default Terms;
