import { Box, Flex, Text } from "@chakra-ui/react";
import { HiMinusCircle } from "react-icons/hi";

export default function RemovedPackages({ removedPackages }) {
    if (!removedPackages || removedPackages.length === 0) return null;
    return (
        <Box mb="4">
            <Text fontSize="lg" fontWeight="bold" mb="2">Removed Packages</Text>
            <Box as="ul" listStyleType="none" m="0" p="0">
                {removedPackages.map((pkg, index) => (
                    <RemovedPackage key={index} pkg={pkg} />
                ))}
            </Box>
        </Box>
    );
}

function RemovedPackage({ pkg }) {
    return (
        <Box as="li" mb="2">
            <Flex align="center" gap="1" fontWeight="bold" color="red.500">
                <HiMinusCircle /> {pkg}
            </Flex>
        </Box>
    );
}
