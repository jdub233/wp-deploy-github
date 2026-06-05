import Image from 'next/image';
import { Box, Container } from "@chakra-ui/react";

export default function Footer() {
    return (
        <Box as="footer" bg="gray.900">
            <Container maxWidth="container.xl" py="6" px="8">
                <Image
                    src="/master-logo-small.gif"
                    width={112}
                    height={50}
                    alt="BU Logo"
                />
            </Container>
        </Box>
    );
}