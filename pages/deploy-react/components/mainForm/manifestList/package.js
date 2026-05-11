import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Popover, Portal, Box, Stack, Button, Text } from "@chakra-ui/react";

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

    // Function to update the manifest item in the working manifest.
    // It works by making a new copy of the working manifest, changing out the one item that needs to be updated.
    function updateManifestItem(updatedItem) {
        // This method of maintaining immutability should work well for data set of a few hundred items.
        setWorkingManifest(currentManifest =>
            currentManifest.map(item =>
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item // Not sure why the original code uses ...item to spread the original properties of the item
        ));
    }

    // For radio buttons (SCM selection)
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

    // For Rev input
    function handleRevChange(event) {
        const { target: { value } } = event;
        const updatedItem = { ...manifestItem, rev: value };
        updateManifestItem(updatedItem);
    }

    // For Source input
    function handleSourceChange(event) {
        const { target: { value } } = event;
        const updatedItem = { ...manifestItem, source: value };
        updateManifestItem(updatedItem);
    }

    // For Destination input
    function handleDestinationChange(event) {
        const { target: { value } } = event;
        const updatedItem = { ...manifestItem, dest: value };
        updateManifestItem(updatedItem);
    }
    
    // Handler method to toggle the expanded state
    const toggleExpand = async () => {
        if (typeof window !== "undefined") {

            setExpanded(!expanded);

            // If the package is being expanded and repoTags is empty, then fetch the tags for the repo.
            // And only do this if the scm is git.
            if (!expanded && Object.keys( repoTags ).length === 0 && manifestItem.scm === 'git') {
                const fetchTags = async () => {
                    try {
                        // The source values stores the full repo location starting with git@github.com/ and ending with .git, so wee need to remove those before querying the API.
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
        }
    };

    // Handler method to toggle the starred state, should store results in cookie or local storage
    const toggleStar = () => {
        setStarred(!starred);
    };

    // Updates the current manifest item with all the settings from the reference prod package.
    function setPackageToProd() {
        const updatedItem = { ...manifestItem, ...referenceProdPackage };
        updateManifestItem(updatedItem);
    }

    // Removes the current package from the working manifest.
    function removePackage() {
        setWorkingManifest(currentManifest =>
            currentManifest.filter(item => item.id !== manifestItem.id)
        );
    }

    // Update the manifest item with the refspec and rev from the tag.
    function handleTagClick(tag) {
        const updatedItem = { ...manifestItem, refspec: tag.name, rev: tag.sha };
        updateManifestItem(updatedItem);
        // Close the popover.
        setIsPopoverOpen(false);
    }

    // If the manifestItem is not defined, return null
    if ( !manifestItem ) {
        return null;
    }

    return (
        <div className={`package-listing ${ !referenceProdPackage || (referenceProdPackage.rev !== manifestItem.rev) ? 'old-version' : 'current-version'}`}>
            <div className="summary-info cf">
                <div className="img layout">
                    <Image
                        src={manifestItem.scm === 'git' ? '/git.png' : '/svn.png'}
                        alt={manifestItem.scm === 'git' ? 'Git' : 'SVN'}
                        width={40}
                        height={40}
                    />
                </div>
                <div className="center-content layout">
                    <h3>{manifestItem.id}</h3>
                    <p className="pkg-details">
                        {manifestItem.rev.substr(0,6)}
                        { referenceProdPackage && referenceProdPackage.rev && referenceProdPackage.rev !== manifestItem.rev && 
                            ` (Prod: ${referenceProdPackage.rev.substr(0,6)} )`
                        }
                    </p>
                </div>
                <div className="expand-arrow layout" onClick={toggleExpand}>
                    {!expanded && <span className="collapsed">&#x25C0;</span>}
                    { expanded && <span className="collapsed">&#x25BC;</span>}
                </div>
                <div className="favorite-star layout" onClick={toggleStar}>
                    {!starred && <span className="star star-outline">&#9734;</span>}
                    { starred && <span className="star star-filled">&#9733;</span>}
                </div>
            </div>
            
            <div className="expanded-info cf" style={expanded ? {display: 'block'} : {display: 'none'} }>
                <div>
                    <span className="info-label">SCM:</span> 
                    <label>
                        <input type="radio" onChange={handleSCMChange} className="scm-radio scm-svn" name={`scm-radio-${manifestItem.id}`} value="svn" checked={manifestItem.scm == 'svn'} />
                        SVN
                    </label>
                    <label>
                        <input type="radio" onChange={handleSCMChange} className="scm-radio scm-git" name={`scm-radio-${manifestItem.id}`} value="git" checked={manifestItem.scm == 'git'} /> 
                        GIT
                    </label>
                </div>
                { manifestItem.scm === 'git' && 
                    <div className="refspec-line">
                        <span className="info-label">Refspec:</span>
                                <input type="text" onChange={handleRefSpecChange} className="current-refspec" value={manifestItem.refspec} />
                        {  (repoTags.tags?.length > 0 || repoTags.branches?.length > 0) &&
                            <Popover.Root
                                open={isPopoverOpen}
                                onOpenChange={(e) => setIsPopoverOpen(e.open)}
                                positioning={{ placement: "right" }}
                            >
                                <Popover.Trigger asChild>
                                    <button
                                        type="button"
                                        className="info-icon"
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
                                                    {/* Tags Column */}
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
                                                                '&::-webkit-scrollbar': {
                                                                    width: '8px',
                                                                },
                                                                '&::-webkit-scrollbar-track': {
                                                                    background: '#f1f1f1',
                                                                },
                                                                '&::-webkit-scrollbar-thumb': {
                                                                    background: '#cbd5e0',
                                                                    borderRadius: '4px',
                                                                },
                                                                '&::-webkit-scrollbar-thumb:hover': {
                                                                    background: '#a0aec0',
                                                                },
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
                                                                        _hover={{
                                                                            bg: 'blue.50',
                                                                            borderColor: 'blue.400',
                                                                        }}
                                                                    >
                                                                        {tag.name}
                                                                    </Button>
                                                                ))}
                                                            </Stack>
                                                        </Box>
                                                    </Box>
                                                    
                                                    {/* Branches Column */}
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
                                                                '&::-webkit-scrollbar': {
                                                                    width: '8px',
                                                                },
                                                                '&::-webkit-scrollbar-track': {
                                                                    background: '#f1f1f1',
                                                                },
                                                                '&::-webkit-scrollbar-thumb': {
                                                                    background: '#cbd5e0',
                                                                    borderRadius: '4px',
                                                                },
                                                                '&::-webkit-scrollbar-thumb:hover': {
                                                                    background: '#a0aec0',
                                                                },
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
                                                                        _hover={{
                                                                            bg: 'blue.50',
                                                                            borderColor: 'blue.400',
                                                                        }}
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
                    </div>
                }
                <div>
                    <span className="info-label">Rev:</span>
                    <input type="text" onChange={handleRevChange} className="current-rev" value={manifestItem.rev} /> 
                    <span className="set-one-rev-to-prod" onClick={setPackageToProd}>
                        { referenceProdPackage ? 'set to prod' : 'not a prod package' } 
                    </span>
                </div>
                <div>
                    <span className="info-label">Source:</span>
                    <input type="text" onChange={handleSourceChange} className="current-source" value={manifestItem.source} />
                </div>
                <div>
                    <span className="info-label">Destination:</span>
                    <input type="text" onChange={handleDestinationChange} className="current-dest" value={manifestItem.dest} />
                </div>
                <div className="remove-package" onClick={removePackage}><span className="do-remove">remove package</span></div>
            </div>
        </div>
    );
}