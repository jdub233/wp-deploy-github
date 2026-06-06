import { Box, Flex, Text } from "@chakra-ui/react";
import { HiPlusCircle } from "react-icons/hi";

export default function AddedPackages({ addedPackages }) {
    if (!addedPackages || addedPackages.length === 0) return null;
    return (
        <Box mb="4">
            <Text fontSize="lg" fontWeight="bold" mb="2">Added Packages</Text>
            <Box as="ul" listStyleType="none" m="0" p="0">
                {addedPackages.map((pkg) => (
                    <AddedPackage key={pkg.id} pkg={pkg} />
                ))}
            </Box>
        </Box>
    );
}

function AddedPackage({ pkg: { id, changed_attributes: { scm, source, refspec, rev, dest } } }) {
    return (
        <Box as="li" mb="3">
            <Flex align="center" gap="1" fontWeight="bold" color="green.600" mb="1">
                <HiPlusCircle /> {id}
            </Flex>
            <Box as="ul" ml="4" pl="4" listStyleType="disc" fontSize="sm">
                <Box as="li" my="1">scm: {scm}</Box>
                <Box as="li" my="1">source: {source}</Box>
                {scm === 'git' && <Box as="li" my="1">refspec: {refspec}</Box>}
                <Box as="li" my="1">rev: {rev}</Box>
                <Box as="li" my="1">dest: {dest}</Box>
            </Box>
        </Box>
    );
}
