import { Box, Flex, Text } from "@chakra-ui/react";
import { HiArrowCircleRight, HiArrowSmRight } from "react-icons/hi";

export default function ChangedPackages({ changedPackages }) {
    if (!changedPackages || changedPackages.length === 0) return null;
    return (
        <Box mb="4">
            <Text fontSize="lg" fontWeight="bold" mb="2">Changed Packages</Text>
            <Box as="ul" listStyleType="none" m="0" p="0">
                {changedPackages.map((pkg) => (
                    <ChangedPackage key={pkg.id} pkg={pkg} />
                ))}
            </Box>
        </Box>
    );
}

function ChangedPackage({ pkg }) {
    return (
        <Box as="li" mb="3">
            <Flex align="center" gap="1" fontWeight="bold" color="orange.500" mb="1">
                <HiArrowCircleRight /> {pkg.id}
            </Flex>
            <Box as="ul" ml="4" pl="4" listStyleType="disc">
                {pkg.changed_attributes?.refspec && (
                    <Box as="li" fontSize="sm" my="1">
                        refspec:{' '}
                        <Text as="span" fontStyle="italic" color="gray.500">{pkg.old_attributes.refspec}</Text>
                        {' '}<HiArrowSmRight style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                        <Text as="span" fontWeight="bold">{pkg.changed_attributes.refspec}</Text>
                    </Box>
                )}
                {pkg.changed_attributes?.rev && (
                    <Box as="li" fontSize="sm" my="1">
                        rev:{' '}
                        <Text as="span" fontStyle="italic" color="gray.500">{pkg.old_attributes.rev.substring(0, 10)}</Text>
                        {' '}<HiArrowSmRight style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                        <Text as="span" fontWeight="bold">{pkg.changed_attributes.rev.substring(0, 10)}</Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
