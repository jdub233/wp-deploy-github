import { Dialog, Button, Box, Flex, Text, Portal, VStack } from "@chakra-ui/react";
import { HiCheckCircle, HiXCircle, HiExternalLink } from "react-icons/hi";
import ChangedPackages from './confirmationModal/changedPackages';
import RemovedPackages from './confirmationModal/removedPackages';
import AddedPackages from './confirmationModal/addedPackages';

export default function ConfirmationModal({ handleValidate, cancelValidation, validationResults = {}, env, install, commitWorkingManifest, isCommitting = false, commitResult = null }) {
    const isOpen = Object.keys(validationResults).length !== 0 || commitResult !== null;
    const numChangedPackages =
        (validationResults.changed_packages?.length ?? 0) +
        (validationResults.removed_packages?.length ?? 0) +
        (validationResults.added_packages?.length ?? 0);

    function handleDeploy(event) {
        event.preventDefault();
        commitWorkingManifest();
    }

    function handleCloseAndRefresh() {
        window.location.reload();
    }

    // Success state
    if (commitResult?.status === 'success') {
        const { validationResults, commitMessage, commitSha } = commitResult;
        const numChangedPackages =
            (validationResults.changed_packages?.length ?? 0) +
            (validationResults.removed_packages?.length ?? 0) +
            (validationResults.added_packages?.length ?? 0);
        
        // For single-package deploys, get the specific package that changed
        let singlePackageChange = null;
        if (numChangedPackages === 1) {
            if (validationResults.changed_packages?.length === 1) {
                const pkg = validationResults.changed_packages[0];
                singlePackageChange = {
                    id: pkg.id,
                    old_refspec: pkg.old_attributes.refspec,
                    new_refspec: pkg.changed_attributes.refspec
                };
            } else if (validationResults.added_packages?.length === 1) {
                const pkg = validationResults.added_packages[0];
                singlePackageChange = {
                    id: pkg.id,
                    refspec: pkg.changed_attributes.refspec
                };
            } else if (validationResults.removed_packages?.length === 1) {
                singlePackageChange = {
                    id: validationResults.removed_packages[0] // removed_packages is an array of strings
                };
            }
        }

        return (
            <Box>
                <Box mb="4">
                    <Button colorPalette="blue" onClick={handleValidate}>Validate</Button>
                </Box>

                <Dialog.Root open={true} onOpenChange={(e) => { if (!e.open) cancelValidation(); }}>
                    <Portal>
                        <Dialog.Backdrop bg="blackAlpha.600" />
                        <Dialog.Positioner display="flex" alignItems="center" justifyContent="center">
                            <Dialog.Content maxW="640px" shadow="2xl" rounded="md">
                                <Dialog.Header px="6" pt="5" pb="4" bg="green.50" roundedTop="md" borderBottomWidth="1px" borderColor="green.200">
                                    <Flex align="center" gap="3">
                                        <Box color="green.600" fontSize="5xl" flexShrink={0}>
                                            <HiCheckCircle />
                                        </Box>
                                        <Dialog.Title fontSize="3xl" fontWeight="bold" color="green.900">
                                            Deployment successful
                                        </Dialog.Title>
                                    </Flex>
                                </Dialog.Header>
                                <Dialog.Body bg="gray.50" px="6" py="6">
                                    <VStack align="stretch" gap="4">
                                        {/* Commit message */}
                                        {commitMessage && (
                                            <Box
                                                bg="white"
                                                borderWidth="1px"
                                                borderColor="gray.200"
                                                rounded="md"
                                                p="4"
                                            >
                                                <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" mb="1">
                                                    Commit Message
                                                </Text>
                                                <Text fontSize="md" color="gray.900" fontWeight="medium">
                                                    {commitMessage}
                                                </Text>
                                            </Box>
                                        )}

                                        {/* Changes summary */}
                                        <Box
                                            bg="white"
                                            borderWidth="1px"
                                            borderColor="gray.200"
                                            rounded="md"
                                            p="4"
                                        >
                                            <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" mb="2">
                                                Changes Committed
                                            </Text>
                                            
                                            {singlePackageChange ? (
                                                /* Single package - show details */
                                                <Box>
                                                    <Flex align="center" gap="2" mb="1">
                                                        <Text fontSize="md" fontWeight="bold" color="gray.900">
                                                            {singlePackageChange.id}
                                                        </Text>
                                                        {validationResults.changed_packages?.length > 0 && (
                                                            <Text fontSize="xs" color="orange.600" fontWeight="semibold" px="2" py="0.5" bg="orange.50" rounded="full">
                                                                UPDATED
                                                            </Text>
                                                        )}
                                                        {validationResults.added_packages?.length > 0 && (
                                                            <Text fontSize="xs" color="green.600" fontWeight="semibold" px="2" py="0.5" bg="green.50" rounded="full">
                                                                ADDED
                                                            </Text>
                                                        )}
                                                        {validationResults.removed_packages?.length > 0 && (
                                                            <Text fontSize="xs" color="red.600" fontWeight="semibold" px="2" py="0.5" bg="red.50" rounded="full">
                                                                REMOVED
                                                            </Text>
                                                        )}
                                                    </Flex>
                                                    {singlePackageChange.old_refspec && singlePackageChange.new_refspec && (
                                                        <Text fontSize="sm" color="gray.600">
                                                            {singlePackageChange.old_refspec} → {singlePackageChange.new_refspec}
                                                        </Text>
                                                    )}
                                                    {singlePackageChange.refspec && (
                                                        <Text fontSize="sm" color="gray.600">
                                                            {singlePackageChange.refspec}
                                                        </Text>
                                                    )}
                                                </Box>
                                            ) : (
                                                /* Multiple packages - show counts */
                                                <Flex gap="4">
                                                    {validationResults.changed_packages?.length > 0 && (
                                                        <Text fontWeight="semibold" color="orange.600">
                                                            {validationResults.changed_packages.length} Changed
                                                        </Text>
                                                    )}
                                                    {validationResults.added_packages?.length > 0 && (
                                                        <Text fontWeight="semibold" color="green.600">
                                                            {validationResults.added_packages.length} Added
                                                        </Text>
                                                    )}
                                                    {validationResults.removed_packages?.length > 0 && (
                                                        <Text fontWeight="semibold" color="red.600">
                                                            {validationResults.removed_packages.length} Removed
                                                        </Text>
                                                    )}
                                                </Flex>
                                            )}
                                            
                                            <Text fontSize="sm" color="gray.700" mt="2">
                                                <Text as="span" fontWeight="bold">{commitResult.install}</Text> on{' '}
                                                <Text as="span" fontWeight="bold">{commitResult.env}</Text>
                                            </Text>
                                        </Box>

                                        {/* Commit SHA */}
                                        {commitSha && (
                                            <Box
                                                bg="white"
                                                borderWidth="1px"
                                                borderColor="gray.200"
                                                rounded="md"
                                                p="4"
                                            >
                                                <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" mb="1">
                                                    Manifest Commit SHA
                                                </Text>
                                                <a
                                                    href={`https://github.com/${process.env.NEXT_PUBLIC_MANIFEST_REPO}/commit/${commitSha}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.875rem',
                                                        color: '#2563eb',
                                                        textDecoration: 'none',
                                                        display: 'block',
                                                        wordBreak: 'break-all'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                                >
                                                    {commitSha}
                                                </a>
                                                <Text fontSize="xs" color="gray.500" mt="1">
                                                    The Docker image will be tagged with this manifest commit hash
                                                </Text>
                                            </Box>
                                        )}

                                        {/* GitHub Actions link */}
                                        <Box
                                            bg="blue.50"
                                            borderWidth="1px"
                                            borderColor="blue.200"
                                            borderLeftWidth="3px"
                                            borderLeftColor="blue.500"
                                            rounded="sm"
                                            p="4"
                                        >
                                            <Text fontSize="md" fontWeight="semibold" fontFamily="heading" color="blue.800" mb="2">
                                                Monitor build progress
                                            </Text>
                                            <Text fontSize="sm" color="blue.800" mb="3">
                                                The build pipeline will create a container image and deploy it to the cluster.
                                            </Text>
                                            <Button
                                                as="a"
                                                href={commitResult.actionsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                colorPalette="blue"
                                                size="sm"
                                                w="full"
                                            >
                                                <Flex align="center" gap="2">
                                                    <Text>View GitHub Actions</Text>
                                                    <HiExternalLink />
                                                </Flex>
                                            </Button>
                                        </Box>
                                    </VStack>
                                </Dialog.Body>
                                <Dialog.Footer px="6" pt="4" pb="5" bg="gray.50" roundedBottom="md" borderTopWidth="1px" borderColor="gray.200">
                                    <Button
                                        colorPalette="green"
                                        onClick={handleCloseAndRefresh}
                                    >
                                        Close & Refresh
                                    </Button>
                                </Dialog.Footer>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            </Box>
        );
    }

    // Error state
    if (commitResult?.status === 'error') {
        const { validationResults, commitMessage } = commitResult;
        const numChangedPackages = validationResults
            ? (validationResults.changed_packages?.length ?? 0) +
              (validationResults.removed_packages?.length ?? 0) +
              (validationResults.added_packages?.length ?? 0)
            : 0;

        return (
            <Box>
                <Box mb="4">
                    <Button colorPalette="blue" onClick={handleValidate}>Validate</Button>
                </Box>

                <Dialog.Root open={true} onOpenChange={(e) => { if (!e.open) cancelValidation(); }}>
                    <Portal>
                        <Dialog.Backdrop bg="blackAlpha.600" />
                        <Dialog.Positioner display="flex" alignItems="center" justifyContent="center">
                            <Dialog.Content maxW="640px" shadow="2xl" rounded="md">
                                <Dialog.Header px="6" pt="5" pb="4" bg="red.50" roundedTop="md" borderBottomWidth="1px" borderColor="red.200">
                                    <Flex align="center" gap="3">
                                        <Box color="red.600" fontSize="5xl" flexShrink={0}>
                                            <HiXCircle />
                                        </Box>
                                        <Dialog.Title fontSize="3xl" fontWeight="bold" color="red.900">
                                            Deployment failed
                                        </Dialog.Title>
                                    </Flex>
                                </Dialog.Header>
                                <Dialog.Body bg="gray.50" px="6" py="6">
                                    <VStack align="stretch" gap="4">
                                        <Text fontSize="md" color="gray.700">
                                            {commitResult.message}
                                        </Text>

                                        {/* Show what was attempted */}
                                        {commitMessage && (
                                            <Box
                                                bg="white"
                                                borderWidth="1px"
                                                borderColor="gray.200"
                                                rounded="md"
                                                p="4"
                                            >
                                                <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" mb="1">
                                                    Attempted Commit Message
                                                </Text>
                                                <Text fontSize="md" color="gray.900" fontWeight="medium">
                                                    {commitMessage}
                                                </Text>
                                            </Box>
                                        )}

                                        {validationResults && numChangedPackages > 0 && (
                                            <Box
                                                bg="white"
                                                borderWidth="1px"
                                                borderColor="gray.200"
                                                rounded="md"
                                                p="4"
                                            >
                                                <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" mb="2">
                                                    Changes Not Committed
                                                </Text>
                                                <Flex gap="4" mb="2">
                                                    {validationResults.changed_packages?.length > 0 && (
                                                        <Text fontWeight="semibold" color="orange.600">
                                                            {validationResults.changed_packages.length} Changed
                                                        </Text>
                                                    )}
                                                    {validationResults.added_packages?.length > 0 && (
                                                        <Text fontWeight="semibold" color="green.600">
                                                            {validationResults.added_packages.length} Added
                                                        </Text>
                                                    )}
                                                    {validationResults.removed_packages?.length > 0 && (
                                                        <Text fontWeight="semibold" color="red.600">
                                                            {validationResults.removed_packages.length} Removed
                                                        </Text>
                                                    )}
                                                </Flex>
                                                <Text fontSize="sm" color="gray.700">
                                                    <Text as="span" fontWeight="bold">{commitResult.install}</Text> on{' '}
                                                    <Text as="span" fontWeight="bold">{commitResult.env}</Text>
                                                </Text>
                                            </Box>
                                        )}

                                        <Box
                                            bg="red.50"
                                            borderWidth="1px"
                                            borderColor="red.200"
                                            borderLeftWidth="3px"
                                            borderLeftColor="red.500"
                                            rounded="sm"
                                            p="4"
                                        >
                                            <Text fontSize="sm" color="red.800">
                                                Check the browser console for more details about the error.
                                            </Text>
                                        </Box>
                                    </VStack>
                                </Dialog.Body>
                                <Dialog.Footer px="6" pt="4" pb="5" bg="gray.50" roundedBottom="md" borderTopWidth="1px" borderColor="gray.200" gap="3">
                                    <Button
                                        colorPalette="blue"
                                        onClick={cancelValidation}
                                    >
                                        Try Again
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCloseAndRefresh}
                                    >
                                        Close & Refresh
                                    </Button>
                                </Dialog.Footer>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            </Box>
        );
    }

    // Validation results state (default)
    return (
        <Box>
            <Box mb="4">
                <Button colorPalette="blue" onClick={handleValidate}>Validate</Button>
            </Box>

            <Dialog.Root
                open={isOpen}
                onOpenChange={(e) => { if (!e.open && !isCommitting) cancelValidation(); }}
            >
                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.600" />
                    <Dialog.Positioner display="flex" alignItems="center" justifyContent="center">
                        <Dialog.Content maxW="640px" shadow="2xl" rounded="md">
                            <Dialog.Header px="6" pt="5" pb="4" bg="gray.100" roundedTop="md" borderBottomWidth="1px" borderColor="gray.200">
                                <Dialog.Title fontSize="3xl" fontWeight="bold">Validation results</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body bg="gray.200" px="4" py="4">
                                {isOpen && (
                                    <>
                                        <Text mb="2" px="2">
                                            You are about to build{' '}
                                            <Text as="span" fontWeight="bold">{numChangedPackages}</Text>{' '}
                                            update{numChangedPackages !== 1 ? 's' : ''} for{' '}
                                            <Text as="span" fontWeight="bold">{install}</Text> on{' '}
                                            <Text as="span" fontWeight="bold">{env}</Text>.
                                        </Text>
                                        <Flex gap="4" mb="3" px="2">
                                            <Text fontWeight="bold" color="orange.500">
                                                {validationResults.changed_packages.length} Changed
                                            </Text>
                                            <Text fontWeight="bold" color="green.600">
                                                {validationResults.added_packages.length} Added
                                            </Text>
                                            <Text fontWeight="bold" color="red.500">
                                                {validationResults.removed_packages.length} Removed
                                            </Text>
                                        </Flex>
                                        <Box bg="white" rounded="md" borderWidth="1px" borderColor="gray.200" px="5" py="4" overflowY="auto" maxH="360px">
                                            <ChangedPackages changedPackages={validationResults.changed_packages} />
                                            <RemovedPackages removedPackages={validationResults.removed_packages} />
                                            <AddedPackages addedPackages={validationResults.added_packages} />
                                        </Box>
                                    </>
                                )}
                            </Dialog.Body>
                            <Dialog.Footer px="6" pt="4" pb="5" bg="gray.50" roundedBottom="md" borderTopWidth="1px" borderColor="gray.200" gap="3">
                                <Button
                                    colorPalette="blue"
                                    onClick={handleDeploy}
                                    disabled={isCommitting}
                                    loading={isCommitting}
                                    loadingText="Deploying..."
                                >
                                    Deploy {numChangedPackages} {numChangedPackages !== 1 ? 'updates' : 'update'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={cancelValidation}
                                    disabled={isCommitting}
                                >
                                    Cancel
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </Box>
    );
}
