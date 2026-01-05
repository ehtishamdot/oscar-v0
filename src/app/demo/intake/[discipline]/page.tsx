import IntakeClient from './client';

// Generate static params for all known disciplines
export function generateStaticParams() {
  return [
    { discipline: 'fysiotherapie' },
    { discipline: 'ergotherapie' },
    { discipline: 'dietetiek' },
    { discipline: 'stoppen_met_roken' },
  ];
}

export default function IntakeDisciplinePage({ params }: { params: Promise<{ discipline: string }> }) {
  return <IntakeClient params={params} />;
}
