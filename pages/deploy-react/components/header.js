import Link from 'next/link';
import Image from "next/image";

export default function Header() {
  return (
    <header>
        <div className='wrapper'>
            <div className="logo">
                <p>
                    <Link href="/">
                        <Image
                            src="/bu-wp-deploy-tool-logo.png"
                            alt="Logo"
                            width={443}
                            height={22}
                        />
                    </Link>
                </p>
            </div>
        </div>
    </header>
  );
}