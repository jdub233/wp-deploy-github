import { useSession } from 'next-auth/react';
import { Box, Container, Text } from "@chakra-ui/react";
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
            <Box bg="gray.50">
                <Container maxW="7xl" px="8" py="6">
                    <Text as="h1" fontSize="3xl" fontWeight="bold" mb="6" display="flex" alignItems="center" gap="3">
                        <Box as={ImHammer} display="inline-block" boxSize="0.85em" /> Deploy
                    </Text>
                    <MainForm />
                </Container>
            </Box>
            <Footer />
        </>
    );
}
