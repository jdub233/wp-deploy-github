import { useState, useEffect } from 'react';
import { Box, Flex, Text } from "@chakra-ui/react";

import Package from "./manifestList/package";
import ManifestListUIControls from "./manifestList/manifestListUIControls";

export default function ManifestList({
    workingManifest,
    setWorkingManifest,
    prodManifest,
    devlManifest,
}) {

    const [filterCriteria, setFilterCriteria] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredWorkingManifest, setFilteredWorkingManifest] = useState(workingManifest);

    function manifestNotEmpty(workingManifest) {
        if (typeof window !== "undefined") {
            return workingManifest.length > 0;
        }
    }

    function applyFilter(manifest) {
        if (!filterCriteria && searchTerm == '') return manifest;

        if (searchTerm !== '') {
            const matchingItems = manifest.filter(item => {
                return item.id.toLowerCase().includes(searchTerm.toLowerCase());
            });
            return matchingItems;
        }

        if (filterCriteria === 'outdatedProd') {
            return manifest.filter(item => {
                const prodItem = prodManifest.find(prod => prod.id === item.id);
                return prodItem && item.rev !== prodItem.rev;
            });
        }
    }

    useEffect(() => {
        setFilteredWorkingManifest(applyFilter(workingManifest));
    }, [workingManifest, filterCriteria, searchTerm]);

    function setAllToProd() {
        setWorkingManifest(prodManifest);
    }

    return (
        <fieldset>
            <legend><span className="step">2</span>Manifest Packages</legend>
            <p>
                Make any adjustments or modifications to the manifest file to fine-tune this build.
            </p>
            <Box
                position="relative"
                minHeight="150px"
                p="4"
                bg="gray.100"
                border="1px solid"
                borderColor="gray.300"
                borderRadius="sm"
                borderBottomWidth="3px"
            >
                {!manifestNotEmpty(workingManifest) && (
                    <Box px="2" py="6">
                        <Text fontSize="2xl" color="gray.300">Select an environment &amp; a build...</Text>
                    </Box>
                )}
                <Flex align="flex-start">
                    <Box flex="1" position="relative">
                        {manifestNotEmpty(workingManifest) && (
                            <Text fontSize="xl" fontWeight="semibold" mb="5" mx="1">Working manifest</Text>
                        )}
                        <Box maxHeight="600px" overflowY="auto">
                            {manifestNotEmpty(workingManifest) && filteredWorkingManifest.map((manifestItem, index) => (
                                <Package
                                    key={index}
                                    manifestItem={manifestItem}
                                    setWorkingManifest={setWorkingManifest}
                                    prodManifest={prodManifest}
                                    devlManifest={devlManifest}
                                />
                            ))}
                        </Box>
                        <Box mt="2">
                            <input type="text" id="add-new-package-id" placeholder="Package ID" />
                            <select id="add-new-package-scm">
                                <option value="">SCM...</option>
                                <option value="svn">SVN</option>
                                <option value="git">GIT</option>
                            </select>
                            <button type="button" id="go-add-new-package">Add package</button>
                        </Box>
                    </Box>
                    {manifestNotEmpty(workingManifest) && (
                        <ManifestListUIControls
                            filterCriteria={filterCriteria}
                            setFilterCriteria={setFilterCriteria}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            setAllToProd={setAllToProd}
                        />
                    )}
                </Flex>
            </Box>
        </fieldset>
    );
}
