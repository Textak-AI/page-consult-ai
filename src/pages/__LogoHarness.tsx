// TEMPORARY verification harness — deleted after the logo-audit check.
import { PublicPageRenderer } from '@/components/public/PublicPageRenderer';
import data from './__logoHarnessData.json';
export default function LogoHarness() {
  const logo = new URLSearchParams(location.search).get('logo');
  const sections = (data as any).sections.map((s: any) => s.type === 'hero' ? { ...s, content: { ...s.content, logoUrl: logo, businessName: 'HyperBrand Creative' } } : s);
  return <PublicPageRenderer sections={sections} designIntelligence={(data as any).design_intelligence} brandSettings={{ companyName: 'HyperBrand Creative', logoUrl: logo }} businessName="HyperBrand Creative" showBadge={false} />;
}
