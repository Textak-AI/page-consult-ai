// TEMPORARY verification harness — deleted after the logo-audit check.
import { BrandCustomization } from '@/components/consultation/BrandCustomization';
export default function BrandMatchHarness() {
  const logo = new URLSearchParams(location.search).get('logo');
  return <BrandCustomization websiteIntelligence={{ url: 'https://x.com', logoUrl: logo, colors: ['#ff1f5a', '#00d9ff'] }} onComplete={(b) => { (window as any).__brandResult = b; }} />;
}
