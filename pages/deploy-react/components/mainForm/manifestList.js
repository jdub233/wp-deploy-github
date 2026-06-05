import { useState, useEffect } from 'react';
import { Box, Flex, Text, Input, Button, HStack } from "@chakra-ui/react";
import { NativeSelectRoot, NativeSelectField } from "@chakra-ui/react";
import { toaster } from "../../../../components/ui/toaster";

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
    const [newPackageId, setNewPackageId] = useState('');
    const [newPackageScm, setNewPackageScm] = useState('');

    function manifestNotEmpty(workingManifest) {
        if (typeof window !== "undefined") {
            return workingManifest.length > 0;
        }
    }

    useEffect(() => {
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
        
        setFilteredWorkingManifest(applyFilter(workingManifest));
    }, [workingManifest, filterCriteria, searchTerm, prodManifest]);

    function setAllToProd() {
        setWorkingManifest(prodManifest);
    }

    function addNewPackage() {
        if (!newPackageId.trim() || !newPackageScm) {
            return;
        }

        // Check if package ID already exists
        const existingPackage = workingManifest.find(pkg => pkg.id === newPackageId.trim());
        if (existingPackage) {
            toaster.create({
                title: 'Package already exists',
                description: `Package "${newPackageId}" already exists in the manifest`,
                type: 'error',
                duration: 5000,
            });
            return;
        }

        // Create new package with sensible defaults
        const newPackage = {
            id: newPackageId.trim(),
            scm: newPackageScm,
            source: newPackageScm === 'git' ? 'git@github.com:bu-ist/' : 'https://scm.ist.bu.edu/svn/',
            refspec: newPackageScm === 'git' ? 'main' : '',
            rev: newPackageScm === 'git' ? '' : 'HEAD',
            dest: `wp-content/plugins/${newPackageId.trim()}`,
        };

        setWorkingManifest(currentManifest => [...currentManifest, newPackage]);
        
        toaster.create({
            title: 'Package added',
            description: `"${newPackageId.trim()}" has been added to the manifest`,
            type: 'success',
            duration: 3000,
        });
        
        // Clear inputs
        setNewPackageId('');
        setNewPackageScm('');
    }

    return (
        <Box borderTopWidth="1px" borderColor="gray.300" pt="8" mb="8">
            <Flex align="center" mb="3">
                <Box
                    bg="orange.400"
                    rounded="full"
                    w="7"
                    h="7"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontWeight="bold"
                    fontSize="sm"
                    mr="2"
                    flexShrink={0}
                >
                    2
                </Box>
                <Text fontSize="lg" fontWeight="bold" textTransform="uppercase">Manifest Packages</Text>
            </Flex>
            <Text fontSize="sm" color="gray.600" mb="5" ml="9">
                Make any adjustments or modifications to the manifest file to fine-tune this build.
            </Text>
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
                            <Text fontSize="xl" fontWeight="semibold" mb="5" mx="1" fontFamily="heading">Working manifest</Text>
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
                        <HStack mt="4" gap="2">
                            <Input
                                size="sm"
                                placeholder="Package ID"
                                value={newPackageId}
                                onChange={(e) => setNewPackageId(e.target.value)}
                                width="200px"
                            />
                            <NativeSelectRoot size="sm" width="120px">
                                <NativeSelectField
                                    value={newPackageScm}
                                    onChange={(e) => setNewPackageScm(e.target.value)}
                                >
                                    <option value="" disabled>SCM...</option>
                                    <option value="svn">SVN</option>
                                    <option value="git">GIT</option>
                                </NativeSelectField>
                            </NativeSelectRoot>
                            <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={addNewPackage}
                                disabled={!newPackageId.trim() || !newPackageScm}
                            >
                                Add package
                            </Button>
                        </HStack>
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
        </Box>
    );
}
