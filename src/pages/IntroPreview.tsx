import { ConsultationIntro } from '@/components/consultation';

export default function IntroPreview() {
  return (
    <ConsultationIntro onComplete={() => alert('Intro completed - would navigate to consultation')} />
  );
}
