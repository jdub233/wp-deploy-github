import Head from "next/head";
import Link from "next/link";

import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { ImHammer } from "react-icons/im";

import { useSession, signIn, signOut } from "next-auth/react";

import Header from "./deploy-react/components/header";
import Footer from "./deploy-react/components/footer";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {

  const { data: session } = useSession();

  return (
    <div className={styles.container}>
      <Head>
        <title>BU WP Deploy Github app</title>
        <meta name="description" content="Tool for updating a build manifest in a GitHub repo." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!session ? (
        <>
          <p>Not signed in</p>
          <br />
          <button onClick={() => signIn()}>Sign in</button>
        </>
      ) : (
        <>
          <Header />
          <div id="main" role="main">
            <div className="container" style={{marginLeft: '2em'}}>
              <div className="left">
                <div className="title">
                  <h1><ImHammer /> WP Deploy</h1>
                </div>
                <div className="content" style={{paddingBottom: '3em'}}>
                  <div>
                    <div>Signed in to GitHub</div>
                    <span>
                      <img src={session.user.image} width={20} height={20} alt="github avatar" />
                    </span> {session.user.name}
                   
                    <button
                      className="button secondary"
                      onClick={() => signOut()}
                      style={{fontSize: '0.8em', padding: '0.5em 1em', marginLeft: '1em'}}
                    >Sign out</button>
                  </div>
                  <div className="button-row">
                    <Link href="/deploy-react">
                      <button className="button primary">Deploy</button>
                    </Link>
                    Manifest repo: {process.env.NEXT_PUBLIC_MANIFEST_REPO}, branch: {process.env.NEXT_PUBLIC_MANIFEST_BRANCH}
                  </div>
                </div>

              </div>
            </div>
          </div>
          <Footer />
        </>
      )}
    </div>
  );
}
