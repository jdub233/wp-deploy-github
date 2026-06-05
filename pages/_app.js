import "@/styles/fonts.css";
import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { system } from "../lib/theme";
import { Toaster } from "../components/ui/toaster";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <ChakraProvider value={system}>
        <Component {...pageProps} />
        <Toaster />
      </ChakraProvider>
    </SessionProvider>
  );
}
