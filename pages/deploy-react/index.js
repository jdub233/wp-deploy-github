import { useSession } from 'next-auth/react';

import Header from "./components/header";
import MainForm from "./components/mainForm";

export default function Deploy() {
    // This can be done elsewhere, but we are just verifying that the user is signed in and is a collaborator.
    const { data: session } = useSession();

    if (!session || !session.isCollaborator) {
        return <div>Not signed in or not authorized.</div>;
    }

    return (
        <>
            <Header />
            <div id="main" role="main">
                <div className="container" style={{marginLeft: '2em'}}>
                    <div className="left">
                        <div className="title">
                            <h1><span className="icon">&#xe000;</span> Build</h1>
                        </div>
                        <MainForm />
                    </div>
                </div>
            </div>
        </>
    );
}
