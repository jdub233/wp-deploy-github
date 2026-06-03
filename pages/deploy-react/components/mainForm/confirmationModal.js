import { Dialog, Button, Box, Flex, Text, Portal } from "@chakra-ui/react";
import ChangedPackages from './confirmationModal/changedPackages';
import RemovedPackages from './confirmationModal/removedPackages';
import AddedPackages from './confirmationModal/addedPackages';

export default function ConfirmationModal({ handleValidate, cancelValidation, validationResults = {}, env, install, commitWorkingManifest, isCommitting = false }) {
    const isOpen = Object.keys(validationResults).length !== 0;
    const numChangedPackages =
        (validationResults.changed_packages?.length ?? 0) +
        (validationResults.removed_packages?.length ?? 0) +
        (validationResults.added_packages?.length ?? 0);

    function handleDeploy(event) {
        event.preventDefault();
        commitWorkingManifest();
    }

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
