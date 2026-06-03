import { Box, VStack, Input, Button } from "@chakra-ui/react";

export default function ManifestListUIControls({
    filterCriteria,
    setFilterCriteria,
    searchTerm,
    setSearchTerm,
    setAllToProd,
}) {
    return (
        <Box style={{ float: 'right', width: '30%' }}>
            <VStack align="stretch" maxWidth="260px" pl="6" pr="2.5" mt="12" gap="4">
                <Input
                    type="search"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    bg="white"
                    borderRadius="sm"
                    mb="5"
                />
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setFilterCriteria(null)}
                    width="full"
                    justifyContent="flex-start"
                    fontSize="sm"
                    borderRadius="sm"
                    py="6"
                    bg={!filterCriteria ? "cyan.50" : "white"}
                    borderLeftWidth="6px"
                    borderLeftColor={!filterCriteria ? "cyan.700" : "transparent"}
                    _hover={{ borderLeftColor: "cyan.700", bg: "cyan.50" }}
                >
                    Show All
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setFilterCriteria('outdatedProd')}
                    width="full"
                    justifyContent="flex-start"
                    fontSize="sm"
                    borderRadius="sm"
                    py="6"
                    bg={filterCriteria === 'outdatedProd' ? "cyan.50" : "white"}
                    borderLeftWidth="6px"
                    borderLeftColor={filterCriteria === 'outdatedProd' ? "cyan.700" : "transparent"}
                    _hover={{ borderLeftColor: "cyan.700", bg: "cyan.50" }}
                >
                    Show outdated only
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    width="full"
                    justifyContent="flex-start"
                    fontSize="sm"
                    borderRadius="sm"
                    py="6"
                    bg="white"
                    borderLeftWidth="6px"
                    borderLeftColor="transparent"
                    _hover={{ borderLeftColor: "cyan.700", bg: "cyan.50" }}
                >
                    Show mismatched SCM
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setAllToProd()}
                    width="full"
                    justifyContent="flex-start"
                    fontSize="sm"
                    borderRadius="sm"
                    py="6"
                    mt="10"
                    bg="white"
                    border="1px solid"
                    borderColor="red.700"
                    _hover={{ bg: "red.50" }}
                >
                    Replace all with Prod
                </Button>
            </VStack>
        </Box>
    );
}
