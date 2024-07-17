import { useEffect } from 'react';
import { useSession } from "next-auth/react";
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(() => import('./ClientOnlyComponent'), {
    ssr: false, // This component will not be server-side rendered
  });

export default function Deploy() {
    const { data: session } = useSession();

    useEffect(() => {
        // This code runs only on the client side
        if (typeof window !== "undefined") {
            window.session = session;
        }
    }, [session]); // Run the effect when `session` changes

    if (!session) {
        return <div>Not signed in</div>;
    }

    return (
        <div>
            <h1>Deploy</h1>
            <ClientOnlyComponent user={session.user} />
        </div>

    );
}