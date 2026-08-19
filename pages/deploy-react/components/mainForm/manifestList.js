import { useState, useMemo, useEffect, useRef, useCallback, useDeferredValue } from 'react';
import { Box, Flex, Text, Input, Button, HStack, Spinner, VStack } from "@chakra-ui/react";
import { NativeSelectRoot, NativeSelectField } from "@chakra-ui/react";
import { toaster } from "../../../../components/ui/toaster";
import { kindOf, matchesStatus, KIND_ORDER } from "../../../../lib/packageKind";
import { readFavorites, writeFavorites } from "../../../../lib/favorites";

import Package from "./manifestList/package";
import ManifestListUIControls from "./manifestList/manifestListUIControls";

// Note: this file lives under pages/, so Next's Pages Router also treats it as a route and
// prerenders it with no props. The array defaults keep that prerender from throwing now that
// filtering is derived during render rather than in an effect.
export default function ManifestList({
    workingManifest = [],
    setWorkingManifest,
    prodManifest = [],
    devlManifest,
    isLoadingManifest,
}) {

    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('any');
    const [starredOnly, setStarredOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newPackageId, setNewPackageId] = useState('');
    const [newPackageScm, setNewPackageScm] = useState('');

    const [favorites, setFavorites] = useState(() => new Set());

    useEffect(() => {
        setFavorites(new Set(readFavorites()));
    }, []);

    // The ref keeps toggleFavorite's identity stable, so starring one package re-renders
    // that row instead of all several hundred. Persisting here rather than in an effect
    // keyed on `favorites` avoids the mount-order trap where the effect would fire with the
    // empty initial set and overwrite stored favorites before the load effect lands.
    const favoritesRef = useRef(favorites);
    favoritesRef.current = favorites;

    const toggleFavorite = useCallback((id) => {
        const next = new Set(favoritesRef.current);
        if (next.has(id)) next.delete(id); else next.add(id);
        favoritesRef.current = next;
        setFavorites(next);
        writeFavorites(next);
    }, []);

    function manifestNotEmpty(workingManifest) {
        if (typeof window !== "undefined") {
            return workingManifest.length > 0;
        }
    }

    // Look up prod packages by id once, rather than scanning prodManifest per package.
    const prodById = useMemo(() => {
        const byId = new Map();
        prodManifest.forEach(prodPackage => byId.set(prodPackage.id, prodPackage));
        return byId;
    }, [prodManifest]);

    // Keyed lookup rather than decorating the manifest items themselves: decorating
    // would give every item a new object identity on each manifest change, which would
    // defeat the memo on Package and re-render the whole list on every keystroke.
    const kindById = useMemo(() => {
        const byId = new Map();
        workingManifest.forEach(item => byId.set(item.id, kindOf(item.dest)));
        return byId;
    }, [workingManifest]);

    // Counts are computed before the search term is applied, so they stay stable while typing.
    const counts = useMemo(() => {
        const type = { all: workingManifest.length };
        KIND_ORDER.forEach(kind => { type[kind] = 0; });

        const status = { any: workingManifest.length, outdated: 0, notInProd: 0 };

        // Counted over the current manifest only. Favorites for packages absent from this
        // manifest are kept in storage but are deliberately not counted here.
        let starred = 0;

        workingManifest.forEach(item => {
            const kind = kindById.get(item.id);
            type[kind] = (type[kind] || 0) + 1;

            const prodPackage = prodById.get(item.id);
            if (matchesStatus('outdated', item, prodPackage)) status.outdated += 1;
            if (matchesStatus('notInProd', item, prodPackage)) status.notInProd += 1;

            if (favorites.has(item.id)) starred += 1;
        });

        return { type, status, starred };
    }, [workingManifest, kindById, prodById, favorites]);

    // The facet state above stays immediate so buttons highlight the moment they're clicked;
    // the list derives from deferred copies, so re-rendering several hundred rows happens at
    // low priority and can be interrupted instead of blocking the click.
    const deferredTypeFilter = useDeferredValue(typeFilter);
    const deferredStatusFilter = useDeferredValue(statusFilter);
    const deferredStarredOnly = useDeferredValue(starredOnly);
    const deferredSearchTerm = useDeferredValue(searchTerm);

    const isFiltering =
        typeFilter !== deferredTypeFilter ||
        statusFilter !== deferredStatusFilter ||
        starredOnly !== deferredStarredOnly ||
        searchTerm !== deferredSearchTerm;

    // Type, status, and search compose. Note the behaviour change from the previous
    // implementation: search used to replace the active filter, and now narrows within it.
    const visibleManifest = useMemo(() => {
        const search = deferredSearchTerm.trim().toLowerCase();
        return workingManifest
            .filter(item => !deferredStarredOnly || favorites.has(item.id))
            .filter(item => deferredTypeFilter === 'all' || kindById.get(item.id) === deferredTypeFilter)
            .filter(item => matchesStatus(deferredStatusFilter, item, prodById.get(item.id)))
            .filter(item => !search || item.id.toLowerCase().includes(search));
    }, [workingManifest, deferredTypeFilter, deferredStatusFilter, deferredStarredOnly, favorites, deferredSearchTerm, kindById, prodById]);

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
            source: newPackageScm === 'git' 
                ? `git@github.com:bu-ist/${newPackageId.trim()}.git`
                : `https://plugins.svn.wordpress.org/${newPackageId.trim()}/trunk/`,
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
                {isLoadingManifest ? (
                    <VStack px="2" py="12" gap="4">
                        <Spinner size="lg" color="blue.500" />
                        <Text fontSize="lg" color="gray.600">Loading manifest...</Text>
                    </VStack>
                ) : !manifestNotEmpty(workingManifest) ? (
                    <Box px="2" py="6">
                        <Text fontSize="2xl" color="gray.300">Select an environment &amp; a build...</Text>
                    </Box>
                ) : null}
                <Flex align="flex-start">
                    {/* The facet rail leads the list: it scopes what follows, and putting it
                        first also makes DOM/tab order match reading order. */}
                    {manifestNotEmpty(workingManifest) && (
                        <ManifestListUIControls
                            typeFilter={typeFilter}
                            setTypeFilter={setTypeFilter}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            starredOnly={starredOnly}
                            setStarredOnly={setStarredOnly}
                            counts={counts}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            setAllToProd={setAllToProd}
                        />
                    )}
                    <Box flex="1" minWidth="0" position="relative">
                        {manifestNotEmpty(workingManifest) && (
                            <Flex align="baseline" justify="space-between" mb="5" mx="1" gap="4">
                                <Text fontSize="xl" fontWeight="semibold" fontFamily="heading">Working manifest</Text>
                                <Text fontSize="xs" color="gray.600">
                                    Showing {visibleManifest.length} of {workingManifest.length}. Filters affect
                                    this view only &mdash; validation always compares the whole manifest.
                                </Text>
                            </Flex>
                        )}
                        {/* Dim while the deferred list catches up. No spinner and no delay
                            threshold -- once rendering commits within a frame, isFiltering is
                            never true long enough to see. */}
                        <Box
                            maxHeight="600px"
                            overflowY="auto"
                            overflowX="hidden"
                            opacity={isFiltering ? 0.6 : 1}
                            transition="opacity 0.12s ease-out"
                        >
                            {manifestNotEmpty(workingManifest) && visibleManifest.map((manifestItem) => (
                                <Package
                                    key={manifestItem.id}
                                    manifestItem={manifestItem}
                                    kind={kindById.get(manifestItem.id)}
                                    prodPackage={prodById.get(manifestItem.id)}
                                    isStarred={favorites.has(manifestItem.id)}
                                    onToggleStar={toggleFavorite}
                                    setWorkingManifest={setWorkingManifest}
                                />
                            ))}
                            {manifestNotEmpty(workingManifest) && visibleManifest.length === 0 && (
                                <Box px="2" py="8">
                                    <Text fontSize="sm" color="gray.600">
                                        No packages match the current filters.
                                    </Text>
                                </Box>
                            )}
                        </Box>
                        <HStack mt="10" mb="6" gap="2">
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
                                type="button"
                                size="sm"
                                colorPalette="blue"
                                onClick={addNewPackage}
                                disabled={!newPackageId.trim() || !newPackageScm}
                            >
                                Add package
                            </Button>
                        </HStack>
                    </Box>
                </Flex>
            </Box>
        </Box>
    );
}
