import { useSession } from 'next-auth/react';

import { ImHammer } from "react-icons/im";

import Header from "./components/header";
import MainForm from "./components/mainForm";
import Footer from "./components/footer";

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
                            <h1><ImHammer /> Deploy</h1>
                        </div>
                        <MainForm />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
