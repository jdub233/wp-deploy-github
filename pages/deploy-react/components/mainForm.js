import { useState, useEffect } from "react";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";

import { compareManifests } from "../../../lib/compareManifests";

import ManifestList from './mainForm/manifestList';
import ConfirmationModal from "./mainForm/confirmationModal";
import CommitMessage from './mainForm/commitMessage';

export default function MainForm() {
    // Track the overall installs available in the manifest repo.
    const [envInstalls, setEnvInstalls] = useState([]);

    // UI Components
    const [env, setEnv] = useState("");
    const [install, setInstall] = useState("");
    const [sandbox, setSandbox] = useState("");

    // Validation
    const [validationResults, setValidationResults] = useState({});
    const [isCommitting, setIsCommitting] = useState(false);
    const [isLoadingManifest, setIsLoadingManifest] = useState(false);


    // Manifest state
    const [workingManifest, setWorkingManifest] = useState([]);

    // Track the commit message
    const [commitMessage, setCommitMessage] = useState('');

    // Reference manifests (prod, devl, and a copy of the working manifest as it was originally loaded).
    const [prodManifest, setProdManifest] = useState([]);
    const [devlManifest, setDevlManifest] = useState([]);
    const [loadedManifest, setLoadedManifest] = useState([]);

    useEffect(() => {
        // This code runs only on the client side
        if (typeof window !== "undefined") {
            const fetchData = async () => {
                try {
                    // Fetch the environment installs from the API
                    const envResponse = await fetch("/api/fetchFiles");
                    const envData = await envResponse.json();
                    setEnvInstalls(envData);

                    // Fetch the prod manifest
                    const prodResponse = await fetch("/api/fetchIniFile?path=prod/cms.ini");
                    const prodData = await prodResponse.json();
                    setProdManifest(prodData);

                    // Fetch the devl manifest
                    const devlResponse = await fetch("/api/fetchIniFile?path=devl/cms.ini");
                    const devlData = await devlResponse.json();
                    setDevlManifest(devlData);

                } catch (error) {
                    console.error("Failed to fetch environment installs:", error);
                }
            };

            fetchData();
        }
    }, []);

    const handleEnvChange = (event) => {
        // Get the new environment value and update the state.
        const { target: { value: newEnv } } = event;
        setEnv(newEnv);

        // If there are both an env and install, then fetch to corresponding ini file.
        if (install && (install !== "sandbox" || sandbox)) {
            getNewWorkingManifest(newEnv, install);
        }
    };

    const handleInstallChange = (event) => {
        // Get the new install value and update the state.
        const { target: { value: newInstall } } = event;
        setInstall(newInstall);

        // If there are both an env and install, then fetch to corresponding ini file.
        if (env && newInstall != "sandbox") {
            getNewWorkingManifest(env, newInstall);
        }

        console.log('hey install is now this:', newInstall);
    }

    const handleSandboxChange = (event) => {
        // Get the new sandbox value and update the state.
        const { target: { value: newSandbox } } = event;
        setSandbox(newSandbox);

        // If there are both an env and install, then fetch to corresponding ini file.
        if (env && install === "sandbox") {
            getNewWorkingManifest(env, newSandbox);
        }

        console.log('hey sandbox is now this:', newSandbox);
    };

    const handleMessageChange = (event) => {
        // Get the new commit message value and update the state.
        const { target: { value: newMessage } } = event;
        setCommitMessage(newMessage);
    };

    async function getNewWorkingManifest(env, install) {
        setIsLoadingManifest(true);
        try {
            const response = await fetch(`/api/fetchIniFile?path=${env}/${install}.ini`);
            const data = await response.json();
            console.log('data:', data);
            setWorkingManifest(data);

            // Set the loaded manifest to a copy of the working manifest now, before it is mutated.
            setLoadedManifest(JSON.parse(JSON.stringify(data)));

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoadingManifest(false);
        }
    }

    function handleValidate(event) {
        event.preventDefault();

        // Compare the loaded manifest to the working manifest to determine what has changed.
        const comparison = compareManifests(loadedManifest, workingManifest);
            console.log('comparison:', comparison);

            // If there are no changes, then display a message to the user.
            /*if (comparison.status === 'success' && comparison.removed_packages.length === 0 && comparison.changed_packages.length === 0 && comparison.added_packages.length === 0) {
                console.log('No changes detected.');
                return;
            }
            */

            // If there are changes, then display a modal to the user with the changes.
            // The modal should have a button to confirm the changes, which will then trigger the build process.
            // The modal should also have a button to cancel the changes, which will then dismiss the modal.

            setValidationResults(comparison);

    }

    function cancelValidation() {
        setValidationResults({});
    }

    // Commit the working manifest to the appropriate ini file.
    async function commitWorkingManifest() {
        setIsCommitting(true);

        // Distinguish between sandboxes and other installs like blogs and cms.
        const fileRoot = (install == 'sandbox') ? sandbox : install;

        // Send the commit data as POST to the commitIniFile API endpoint, with the path as a query parameter.
        const commitResponse = await fetch(`/api/commitIniFile?path=${env}/${fileRoot}.ini`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: commitMessage, manifest: workingManifest}),
        });

        setIsCommitting(false);

        // Display the response to the user.
        console.log('commitResponse:', commitResponse);

        // Provide feedback and link to GitHub Actions
        if (commitResponse.status === 200) {
            const actionsUrl = `https://github.com/${process.env.NEXT_PUBLIC_MANIFEST_REPO}/actions`;
            alert(`Commit successful!\n\nView build status at:\n${actionsUrl}`);
            // Reload page to clear state and show fresh data
            window.location.reload();
        } else {
            alert('Error committing file. Please check the console for details.');
        }

    }

    const envOptions = [
        { value: "devl", label: "Development" },
        { value: "test", label: "Test" },
        { value: "syst", label: "Systems" },
        { value: "prod", label: "Production" },
    ];

    return (
        <Box>
            <form>
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
                            1
                        </Box>
                        <Text fontSize="lg" fontWeight="bold" textTransform="uppercase">Parameters</Text>
                    </Flex>
                    <Text fontSize="sm" color="gray.600" mb="5" ml="9">
                        Configure the build details by selecting an environment and the install locations.
                    </Text>

                    {/* Environment */}
                    <Box p="4" borderWidth="1px" borderBottomWidth="3px" borderColor="gray.300" bg="gray.100" rounded="sm" mb="4">
                        <Text fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" mb="3">Environment</Text>
                        <Flex gap="4" align="flex-start">
                            <Stack flex="1">
                                {envOptions.map(({ value, label }) => (
                                    <Flex key={value} align="center" gap="2">
                                        <input
                                            type="radio"
                                            name="build_env"
                                            id={`build_env_${value}`}
                                            value={value}
                                            onChange={handleEnvChange}
                                            checked={env === value}
                                        />
                                        <label htmlFor={`build_env_${value}`}>{label}</label>
                                    </Flex>
                                ))}
                            </Stack>
                            <Box
                                bg="yellow.50"
                                color="yellow.800"
                                borderWidth="1px"
                                borderColor="yellow.200"
                                borderLeftWidth="3px"
                                borderLeftColor="yellow.400"
                                rounded="sm"
                                p="4"
                                fontSize="sm"
                                w="50%"
                            >
                                The source environment where install is located.
                            </Box>
                        </Flex>
                    </Box>

                    {/* Install */}
                    <Box p="4" borderWidth="1px" borderBottomWidth="3px" borderColor="gray.300" bg="gray.100" rounded="sm" mb="4">
                        <Text fontSize="sm" fontWeight="bold" color="gray.700" textTransform="uppercase" mb="3">Install</Text>
                        <Flex gap="4" align="flex-start">
                            <Stack spacing="1" flex="1">
                                <Flex align="center" gap="2">
                                    <input
                                        type="radio"
                                        name="build_inst"
                                        id="build_inst_blogs"
                                        value="blogs"
                                        onChange={handleInstallChange}
                                        checked={install === "blogs"}
                                    />
                                    <label htmlFor="build_inst_blogs">Blogs</label>
                                </Flex>
                                <Flex align="center" gap="2">
                                    <input
                                        type="radio"
                                        name="build_inst"
                                        id="build_inst_cms"
                                        value="cms"
                                        onChange={handleInstallChange}
                                        checked={install === "cms"}
                                    />
                                    <label htmlFor="build_inst_cms">CMS</label>
                                </Flex>
                                <Flex align="center" gap="2">
                                    <input
                                        type="radio"
                                        name="build_inst"
                                        id="build_inst_sandbox"
                                        value="sandbox"
                                        onChange={handleInstallChange}
                                        checked={install === "sandbox"}
                                    />
                                    <label htmlFor="build_inst_sandbox">Sandbox</label>
                                </Flex>

                                {(install === "sandbox" && env) &&
                                    <Box mt="2">
                                        <label htmlFor="sandbox_id_new">Select sandbox:</label>
                                        <select
                                            name="sandbox_id_new"
                                            id="sandbox_id_new"
                                            value={sandbox}
                                            onChange={handleSandboxChange}
                                            style={{ display: 'block', marginTop: '0.5em', fontSize: '1em' }}
                                        >
                                            <option value="" disabled hidden>Select a sandbox</option>
                                            {envInstalls[env].filter(sb => sb !== "cms" && sb !== "blogs").map((sb, index) => (
                                                <option key={index} value={sb}>{sb}</option>
                                            ))}
                                        </select>
                                    </Box>
                                }
                            </Stack>
                            <Box
                                bg="yellow.50"
                                color="yellow.800"
                                borderWidth="1px"
                                borderColor="yellow.200"
                                borderLeftWidth="3px"
                                borderLeftColor="yellow.400"
                                rounded="sm"
                                p="4"
                                fontSize="sm"
                                w="50%"
                            >
                                The install which is being built.
                            </Box>
                        </Flex>
                    </Box>
                </Box>

                <ManifestList
                    workingManifest={workingManifest}
                    setWorkingManifest={setWorkingManifest}
                    prodManifest={prodManifest}
                    devlManifest={devlManifest}
                    isLoadingManifest={isLoadingManifest}
                />

                <Box>
                    <CommitMessage
                        message={commitMessage}
                        handleMessageChange={handleMessageChange}
                    />
                </Box>

                <ConfirmationModal
                    handleValidate={handleValidate}
                    cancelValidation={cancelValidation}
                    validationResults={validationResults}
                    env={env}
                    install={install}
                    commitWorkingManifest={commitWorkingManifest}
                    isCommitting={isCommitting}
                />

            </form>
        </Box>
    );
}
