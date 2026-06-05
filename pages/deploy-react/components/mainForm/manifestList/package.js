import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Box, Flex, Input, Popover, Portal, Stack, Button, Text } from "@chakra-ui/react";

export default function Package({
    manifestItem,
    setWorkingManifest,
    prodManifest,
    devlManifest,
}) {
    const [expanded, setExpanded] = useState(false);
    const [starred, setStarred] = useState(false);
    const [repoTags, setRepoTags] = useState({});
    const [referenceProdPackage, setReferenceProdPackage] = useState({});
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    useEffect(() => {
        if(typeof window !== "undefined") {
            const findReferenceProdPackage = () => {
                setReferenceProdPackage(prodManifest.find((prodPackage) => prodPackage.id === manifestItem.id));
            };
            findReferenceProdPackage();
        }
    }, [prodManifest, manifestItem]);

    function updateManifestItem(updatedItem) {
        setWorkingManifest(currentManifest =>
            currentManifest.map(item =>
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item
        ));
    }

    function handleSCMChange(event) {
        const { value } = event.target;
        const updatedItem = { ...manifestItem, scm: value };
        updateManifestItem(updatedItem);
    }

    function handleRefSpecChange(event) {
        const { target: { value } } = event;
        const updatedItem = { ...manifestItem, refspec: value };
        updateManifestItem(updatedItem);
    }

    function handleRevChange(event) {
        const { target: { value } } = event;
        const updatedItem = { ...manifestItem, rev: value };
        updateManifestItem(updatedItem);
    }

    function handleSourceChange(event) {
        const { target: { value } } = event;
        const updatedItem = { ...manifestItem, source: value };
        updateManifestItem(updatedItem);
    }

    function handleDestinationChange(event) {
        const { target: { value } } = event;
        const updatedItem = { ...manifestItem, dest: value };
        updateManifestItem(updatedItem);
    }

    const toggleExpand = async () => {
        if (typeof window !== "undefined") {
            setExpanded(prevExpanded => {
                const nextExpanded = !prevExpanded;
                
                // Fetch tags if we're expanding and haven't fetched yet
                if (nextExpanded && Object.keys(repoTags).length === 0 && manifestItem.scm === 'git') {
                    const fetchTags = async () => {
                        try {
                            const repo = manifestItem.source.replace('git@github.com:', '').replace('.git', '');
                            const response = await fetch(`/api/fetchTags?repo=${repo}`);
                            const data = await response.json();
                            setRepoTags(data);
                        } catch (error) {
                            console.error('Failed to fetch tags:', error);
                        }
                    };
                    fetchTags();
                }
                
                return nextExpanded;
            });
        }
    };

    const toggleStar = () => {
        setStarred(!starred);
    };

    function setPackageToProd() {
        const updatedItem = { ...manifestItem, ...referenceProdPackage };
        updateManifestItem(updatedItem);
    }

    function removePackage() {
        setWorkingManifest(currentManifest =>
            currentManifest.filter(item => item.id !== manifestItem.id)
        );
    }

    function handleTagClick(tag) {
        const updatedItem = { ...manifestItem, refspec: tag.name, rev: tag.sha };
        updateManifestItem(updatedItem);
        setIsPopoverOpen(false);
    }

    if (!manifestItem) return null;

    const isOldVersion = !referenceProdPackage || referenceProdPackage?.rev !== manifestItem.rev;

    return (
        <Box
            mb="2.5"
            border="1px solid"
            borderColor="gray.300"
            borderRadius="sm"
            p="2"
            mr="4"
            bg="white"
            minWidth="450px"
            position="relative"
        >
            {/* Summary row */}
            <Flex align="center">
                <Box mr="2" flexShrink={0}>
                    <Image
                        src={manifestItem.scm === 'git' ? '/git.png' : '/svn.png'}
                        alt={manifestItem.scm === 'git' ? 'Git' : 'SVN'}
                        width={40}
                        height={40}
                    />
                </Box>
                <Box flex="1">
                    <Text fontSize="md" fontWeight="semibold" my="1" color={isOldVersion ? "red.600" : "inherit"}>
                        {manifestItem.id}
                    </Text>
                    <Text fontSize="xs" pb="2">
                        {manifestItem.rev.substr(0, 6)}
                        {referenceProdPackage?.rev && referenceProdPackage.rev !== manifestItem.rev &&
                            ` (Prod: ${referenceProdPackage.rev.substr(0, 6)} )`
                        }
                    </Text>
                </Box>
                <Box px="3" pt="4" cursor="pointer" onClick={toggleExpand} flexShrink={0}>
                    {!expanded ? <span>&#x25C0;</span> : <span>&#x25BC;</span>}
                </Box>
                <Box px="3" py="1" fontSize="xl" cursor="pointer" onClick={toggleStar} flexShrink={0}>
                    {!starred ? <span>&#9734;</span> : <span>&#9733;</span>}
                </Box>
            </Flex>

            {/* Expanded form */}
            {expanded && (
                <Box px="3" pt="2" pb="8">
                    <Box mb="2">
                        <Text as="span" minWidth="100px" display="inline-block" fontSize="sm">SCM:</Text>
                        <label>
                            <input type="radio" onChange={handleSCMChange} name={`scm-radio-${manifestItem.id}`} value="svn" checked={manifestItem.scm === 'svn'} />
                            {' '}SVN
                        </label>
                        {' '}
                        <label>
                            <input type="radio" onChange={handleSCMChange} name={`scm-radio-${manifestItem.id}`} value="git" checked={manifestItem.scm === 'git'} />
                            {' '}GIT
                        </label>
                    </Box>

                    {manifestItem.scm === 'git' && (
                        <Flex align="center" mb="2">
                            <Text as="span" minWidth="100px" flexShrink={0} fontSize="sm">Refspec:</Text>
                            <Input
                                size="sm"
                                width="28"
                                onChange={handleRefSpecChange}
                                value={manifestItem.refspec}
                            />
                            {(repoTags.tags?.length > 0 || repoTags.branches?.length > 0) &&
                                <Popover.Root
                                    open={isPopoverOpen}
                                    onOpenChange={(e) => setIsPopoverOpen(e.open)}
                                    positioning={{ placement: "right" }}
                                >
                                    <Popover.Trigger asChild>
                                        <button
                                            type="button"
                                            aria-label="Show available tags and branches"
                                            style={{
                                                cursor: "pointer",
                                                background: "none",
                                                border: "none",
                                                padding: 0,
                                            }}
                                        >
                                            &#9432;
                                        </button>
                                    </Popover.Trigger>
                                    <Portal>
                                        <Popover.Positioner>
                                            <Popover.Content width="600px" maxHeight="500px">
                                                <Popover.Body padding="0">
                                                    <Stack direction="row" gap="0" height="100%">
                                                        <Box
                                                            flex="1"
                                                            padding="4"
                                                            borderRightWidth="1px"
                                                            borderRightColor="gray.200"
                                                        >
                                                            <Text
                                                                fontSize="xs"
                                                                fontWeight="semibold"
                                                                color="gray.600"
                                                                textTransform="uppercase"
                                                                letterSpacing="wider"
                                                                marginBottom="3"
                                                            >
                                                                Tags
                                                            </Text>
                                                            <Box
                                                                maxHeight="420px"
                                                                overflowY="auto"
                                                                css={{
                                                                    '&::-webkit-scrollbar': { width: '8px' },
                                                                    '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                                                                    '&::-webkit-scrollbar-thumb': { background: '#cbd5e0', borderRadius: '4px' },
                                                                    '&::-webkit-scrollbar-thumb:hover': { background: '#a0aec0' },
                                                                }}
                                                            >
                                                                <Stack gap="1">
                                                                    {repoTags.tags.map((tag) => (
                                                                        <Button
                                                                            key={tag.sha}
                                                                            onClick={() => handleTagClick(tag)}
                                                                            variant="outline"
                                                                            size="sm"
                                                                            width="full"
                                                                            justifyContent="flex-start"
                                                                            fontFamily="mono"
                                                                            fontSize="xs"
                                                                            height="auto"
                                                                            padding="2"
                                                                            _hover={{ bg: 'blue.50', borderColor: 'blue.400' }}
                                                                        >
                                                                            {tag.name}
                                                                        </Button>
                                                                    ))}
                                                                </Stack>
                                                            </Box>
                                                        </Box>

                                                        <Box flex="1" padding="4">
                                                            <Text
                                                                fontSize="xs"
                                                                fontWeight="semibold"
                                                                color="gray.600"
                                                                textTransform="uppercase"
                                                                letterSpacing="wider"
                                                                marginBottom="3"
                                                            >
                                                                Branches
                                                            </Text>
                                                            <Box
                                                                maxHeight="420px"
                                                                overflowY="auto"
                                                                css={{
                                                                    '&::-webkit-scrollbar': { width: '8px' },
                                                                    '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                                                                    '&::-webkit-scrollbar-thumb': { background: '#cbd5e0', borderRadius: '4px' },
                                                                    '&::-webkit-scrollbar-thumb:hover': { background: '#a0aec0' },
                                                                }}
                                                            >
                                                                <Stack gap="1">
                                                                    {repoTags.branches.map((branch) => (
                                                                        <Button
                                                                            key={branch.sha}
                                                                            onClick={() => handleTagClick(branch)}
                                                                            variant="outline"
                                                                            size="sm"
                                                                            width="full"
                                                                            justifyContent="flex-start"
                                                                            fontFamily="mono"
                                                                            fontSize="xs"
                                                                            height="auto"
                                                                            padding="2"
                                                                            _hover={{ bg: 'blue.50', borderColor: 'blue.400' }}
                                                                        >
                                                                            {branch.name}
                                                                        </Button>
                                                                    ))}
                                                                </Stack>
                                                            </Box>
                                                        </Box>
                                                    </Stack>
                                                </Popover.Body>
                                            </Popover.Content>
                                        </Popover.Positioner>
                                    </Portal>
                                </Popover.Root>
                            }
                        </Flex>
                    )}

                    <Flex align="center" mb="2">
                        <Text as="span" minWidth="100px" flexShrink={0} fontSize="sm">Rev:</Text>
                        <Input
                            size="sm"
                            onChange={handleRevChange}
                            value={manifestItem.rev}
                        />
                        {isOldVersion && (
                            <Text as="span" color="blue.600" cursor="pointer" ml="2" fontSize="sm" whiteSpace="nowrap" onClick={setPackageToProd}>
                                {referenceProdPackage ? 'set to prod' : 'not a prod package'}
                            </Text>
                        )}
                    </Flex>

                    <Flex align="center" mb="2">
                        <Text as="span" minWidth="100px" flexShrink={0} fontSize="sm">Source:</Text>
                        <Input
                            size="sm"
                            onChange={handleSourceChange}
                            value={manifestItem.source}
                        />
                    </Flex>

                    <Flex align="center" mb="2">
                        <Text as="span" minWidth="100px" flexShrink={0} fontSize="sm">Destination:</Text>
                        <Input
                            size="sm"
                            onChange={handleDestinationChange}
                            value={manifestItem.dest}
                        />
                    </Flex>

                    <Text
                        position="absolute"
                        bottom="2.5"
                        right="2.5"
                        fontSize="xs"
                        color="red.600"
                        cursor="pointer"
                        onClick={removePackage}
                    >
                        remove package
                    </Text>
                </Box>
            )}
        </Box>
    );
}
