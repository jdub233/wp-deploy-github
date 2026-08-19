import { useState, memo } from 'react';
import { Badge, Box, Flex, Image, Input, Popover, Portal, Spacer, Stack, Button, Text, IconButton } from "@chakra-ui/react";

// prodPackage is resolved by the parent from its prodById Map rather than found here. Doing
// the lookup per row was O(n^2) across the list, and doing it in an effect meant every row
// rendered twice and flashed red before the real comparison landed.
const Package = memo(function Package({
    manifestItem,
    kind,
    prodPackage,
    isStarred = false,
    onToggleStar,
    setWorkingManifest,
}) {
    const [expanded, setExpanded] = useState(false);
    const [repoTags, setRepoTags] = useState({});
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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

    function setPackageToProd() {
        const updatedItem = { ...manifestItem, ...prodPackage };
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

    // Correct on the first render now that prodPackage arrives as a prop -- it used to
    // start as {} and settle after an effect, which flashed every row red on mount.
    const isOldVersion = !prodPackage || prodPackage.rev !== manifestItem.rev;

    return (
        <Box
            mb="1.5"
            border="1px solid"
            borderColor="gray.300"
            borderRadius="sm"
            px="2"
            py="1"
            mr="1"
            bg="white"
            position="relative"
        >
            {/* Collapsed summary row. The name is the only element allowed to shrink, so it
                needs minW=0 alongside minW=0 on this Flex and overflowX=hidden on the scroll
                container in manifestList.js -- all three, or the row clips at the panel edge. */}
            <Flex align="center" gap="2" minW="0">
                <IconButton
                    type="button"
                    aria-label={expanded ? `Collapse ${manifestItem.id}` : `Expand ${manifestItem.id}`}
                    aria-expanded={expanded}
                    onClick={toggleExpand}
                    size="xs"
                    variant="ghost"
                    flexShrink={0}
                >
                    <Text as="span" fontSize="sm" lineHeight="1">{expanded ? <>&#x25BC;</> : <>&#x25B6;</>}</Text>
                </IconButton>
                {/* Chakra's Image, not next/image: at 18px the srcset and lazy-load
                    machinery buys nothing and cost 276 component instances. boxSize is an
                    explicit px value so the row height never depends on image load. */}
                <Image
                    src={manifestItem.scm === 'git' ? '/git.png' : '/svn.png'}
                    alt={manifestItem.scm === 'git' ? 'Git' : 'SVN'}
                    boxSize="18px"
                    flexShrink={0}
                />
                <IconButton
                    type="button"
                    aria-label={isStarred ? `Unstar ${manifestItem.id}` : `Star ${manifestItem.id}`}
                    aria-pressed={isStarred}
                    onClick={() => onToggleStar?.(manifestItem.id)}
                    size="xs"
                    variant="ghost"
                    flexShrink={0}
                >
                    <Text as="span" fontSize="md" color={isStarred ? "yellow.500" : "gray.400"}>
                        {isStarred ? <>&#9733;</> : <>&#9734;</>}
                    </Text>
                </IconButton>
                <Text
                    minW="0"
                    flex="0 1 auto"
                    truncate
                    fontSize="md"
                    fontWeight="semibold"
                    fontFamily="heading"
                    lineHeight="short"
                    color={isOldVersion ? "red.600" : "inherit"}
                >
                    {manifestItem.id}
                </Text>
                {kind && (
                    <Badge size="sm" variant="subtle" flexShrink={0}>{kind}</Badge>
                )}
                <Spacer />
                {manifestItem.refspec && (
                    <Badge size="sm" variant="outline" flexShrink={0} maxWidth="32" truncate>
                        {manifestItem.refspec}
                    </Badge>
                )}
                <Text fontSize="xs" fontFamily="mono" color="gray.600" flexShrink={0} whiteSpace="nowrap">
                    {manifestItem.rev.substr(0, 7)}
                    {/* Non-colour cue for "differs from prod", so red text is not the only signal. */}
                    {prodPackage?.rev && prodPackage.rev !== manifestItem.rev && (
                        <Text as="span" color="red.600"> &ne; {prodPackage.rev.substr(0, 7)}</Text>
                    )}
                </Text>
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
                                        <IconButton
                                            aria-label="Show available tags and branches"
                                            size="sm"
                                            variant="ghost"
                                            ml="1"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                                <path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                                            </svg>
                                        </IconButton>
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
                            prodPackage ? (
                                <Button
                                    type="button"
                                    variant="plain"
                                    size="sm"
                                    color="blue.600"
                                    ml="2"
                                    px="1"
                                    height="auto"
                                    fontWeight="normal"
                                    whiteSpace="nowrap"
                                    onClick={setPackageToProd}
                                >
                                    set to prod
                                </Button>
                            ) : (
                                <Text as="span" ml="2" fontSize="sm" color="gray.600" whiteSpace="nowrap">
                                    not in prod cms
                                </Text>
                            )
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

                    <Button
                        type="button"
                        onClick={removePackage}
                        aria-label={`Remove ${manifestItem.id} from the manifest`}
                        position="absolute"
                        bottom="2"
                        right="2.5"
                        size="xs"
                        variant="ghost"
                        colorPalette="red"
                        fontSize="xs"
                        fontWeight="normal"
                    >
                        remove package
                    </Button>
                </Box>
            )}
        </Box>
    );
});

export default Package;
