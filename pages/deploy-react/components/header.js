import Link from 'next/link';
import Image from "next/image";
import { Box, Container } from "@chakra-ui/react";

export default function Header() {
  return (
    <Box as="header" bg="gray.900">
      <Container maxWidth="container.xl" py="5" px="8">
        <Link href="/">
          <Image
            src="/bu-wp-deploy-tool-logo.png"
            alt="Logo"
            width={443}
            height={22}
          />
        </Link>
      </Container>
    </Box>
  );
}