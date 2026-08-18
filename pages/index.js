import Head from "next/head";
import Link from "next/link";
import { ImHammer } from "react-icons/im";
import { useSession, signIn, signOut } from "next-auth/react";
import { Box, Container, Button, Text, Flex, HStack, Image } from "@chakra-ui/react";

import Header from "./deploy-react/components/header";
import Footer from "./deploy-react/components/footer";

export default function Home() {

  const { data: session } = useSession();

  return (
    <Box bg="gray.50" minHeight="100vh" display="flex" flexDirection="column">
      <Head>
        <title>BU WP Deploy Github app</title>
        <meta name="description" content="Tool for updating a build manifest in a GitHub repo." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Box as="main" role="main" flex="1" py="12">
        <Container maxW="7xl" px="8">
          <Box mb="8">
            <Flex align="center" gap="3" mb="6">
              <Box as={ImHammer} fontSize="3xl" color="orange.500" />
              <Text as="h1" fontSize="3xl" fontWeight="semibold" fontFamily="heading">
                WP Deploy
              </Text>
            </Flex>
            {!session ? (
              <Box>
                <Text as="h2" fontSize="2xl" fontWeight="semibold" mb="4">
                  Sign in
                </Text>
                <Text mb="6" color="gray.700">
                  WP Deploy works with Github to manage build manifests
                </Text>
                <Button colorPalette="blue" size="lg" onClick={() => signIn()}>
                  Sign in with GitHub
                </Button>
              </Box>
            ) : (
              <Box>
                <Flex align="center" gap="3" mb="6" flexWrap="wrap">
                  <Text color="gray.700">Signed in to GitHub as:</Text>
                  <HStack gap="2">
                    <Image 
                      src={session.user.image} 
                      width="20px" 
                      height="20px" 
                      alt="github avatar"
                      borderRadius="full"
                    />
                    <Text fontWeight="medium">{session.user.name}</Text>
                  </HStack>
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="gray"
                    onClick={() => signOut()}
                  >
                    Sign out
                  </Button>
                </Flex>
                <Flex align="center" gap="4" flexWrap="wrap">
                  <Link href="/deploy-react">
                    <Button colorPalette="blue" size="lg">
                      Go to Deploy tool
                    </Button>
                  </Link>
                  <Text fontSize="sm" color="gray.600">
                    Manifest repo: {process.env.NEXT_PUBLIC_MANIFEST_REPO}, branch: {process.env.NEXT_PUBLIC_MANIFEST_BRANCH}
                  </Text>
                </Flex>
              </Box>
            )}
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
