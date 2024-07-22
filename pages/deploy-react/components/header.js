import Link from 'next/link';

export default function Header() {
  return (
    <header>
        <div className='wrapper'>
            <div className="logo">
                <p>
                    <Link href="/">
                        <img src="/images/logo.png" alt="Logo" />
                    </Link>
                </p>
            </div>
        </div>
    </header>
  );
}