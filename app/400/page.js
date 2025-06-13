export const metadata = {
  title: '400 – Bad Request',
};

import Link from 'next/link';

export default function BadRequest() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>400 – Bad Request</h1>
      <p>Invalid parameters provided.</p>
      <p>
        <Link href="/">Return to search</Link>
      </p>
    </div>
  );
}
