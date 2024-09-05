import { useState, useEffect } from "react";

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
        try {
            const response = await fetch(`/api/fetchIniFile?path=${env}/${install}.ini`);
            const data = await response.json();
            console.log('data:', data);
            setWorkingManifest(data);

            // Set the loaded manifest to a copy of the working manifest now, before it is mutated.
            setLoadedManifest(JSON.parse(JSON.stringify(data)));

        } catch (error) {
            console.error('Error fetching data:', error);
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

    async function commitWorkingManifest() {
        // Commit the working manifest to the appropriate ini file.
        // This will require a POST request to the API endpoint commitIniFile.
        // The body of the request should include the manifest as a stringified object.
        // The path of the ini file should be included as a query parameter.
        const commitResponse = await fetch(`/api/commitIniFile?path=${env}/${install}.ini`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: commitMessage, manifest: workingManifest}),
        });

        // Display the response to the user.
        console.log('commitResponse:', commitResponse);
   
    }

    return (
        <div id="preexisting" className="tab-content">
            <form id="form_build_old">
                <fieldset className="border-top step-1">
                    <legend><span className="step">1</span> Parameters</legend>
                    <p>
                        Configure the build details by selecting an environment and the install locations.
                    </p>
                    <fieldset className="boxy">
                        <legend>Environment</legend>
                        <p className="helper info">
                            The source environment where install is located.
                        </p>
                        <ul className="radio-group">
                            <li>
                                <input type="radio" name="build_env" id="build_env_devl" value="devl" 
                                    onChange={handleEnvChange}
                                    checked={env === "devl"}
                                />
                                <label htmlFor="build_env_devl" title="Development">Development</label>
                            </li>
                            <li>
                                <input type="radio" name="build_env" id="build_env_test" value="test"
                                    onChange={handleEnvChange}
                                    checked={env === "test"}
                                />
                                <label htmlFor="build_env_test" title="Test">Test</label>
                            </li>
                            <li>
                                <input type="radio" name="build_env" id="build_env_syst" value="syst"
                                    onChange={handleEnvChange}
                                    checked={env === "syst"}
                                />
                                <label htmlFor="build_env_syst" title="Systems">Systems</label>
                            </li>
                            <li>
                                <input type="radio" name="build_env" id="build_env_prod" value="prod"
                                    onChange={handleEnvChange}
                                    checked={env === "prod"}
                                />
                                <label htmlFor="build_env_prod" title="Production">Production</label>
                            </li>

                            <li>
                                <input type="radio" name="build_env" id="build_env_cloud" value="cloud"
                                    onChange={handleEnvChange}
                                    checked={env === "cloud"}
                                />
                                <label htmlFor="build_env_cloud" title="Cloud">Cloud</label>
                            </li>
                        </ul>
                    </fieldset>
                    <fieldset className="boxy">
                        <legend>Install</legend>
                        <p className="helper info">
                            The install which is being built.
                        </p>
                        <ul className="radio-group">
                            <li>
                                <input type="radio" name="build_inst" id="build_inst_blogs" value="blogs"
                                    onChange={handleInstallChange}
                                    checked={install === "blogs"}
                                />
                                <label htmlFor="build_inst_blogs">Blogs</label>
                            </li>
                            <li>
                                <input type="radio" name="build_inst" id="build_inst_cms" value="cms"
                                    onChange={handleInstallChange}
                                    checked={install === "cms"}
                                />
                                <label htmlFor="build_inst_cms">CMS</label>
                            </li>
                            <li>
                                <input type="radio" name="build_inst" id="build_inst_sandbox"
                                    value="sandbox" className="show-options"
                                    data-additional-container="build_sandbox"
                                    onChange={handleInstallChange}
                                    checked={install === "sandbox"}    
                                />
                                <label htmlFor="build_inst_sandbox">Sandbox</label>
                            </li>
                        </ul>

                        {(install === "sandbox" && env ) && 
                            <div id="build_sandbox" className="sandbox-chooser additional-container">
                                <label htmlFor="sandbox_id_select">Select sandbox:</label>
                                <select type="text" name="sandbox_id_new" id="sandbox_id_new"
                                    className="sandbox-select input-text"
                                    onChange={handleSandboxChange}
                                >
                                    <option value="" disabled selected hidden>Select a sandbox</option>
                                    { envInstalls[env].filter(sandbox => sandbox !== "cms" && sandbox !== "blogs").map((sandbox, index) => (
                                        <option key={index} value={sandbox}>{sandbox}</option>
                                    ))}
                                </select>
                            </div>
                        }
                    </fieldset>
                </fieldset>
                <ManifestList
                    workingManifest={workingManifest}
                    setWorkingManifest={setWorkingManifest}
                    loadedManifest={loadedManifest}
                    prodManifest={prodManifest}
                    devlManifest={devlManifest}
                />
                <fieldset className="optional">
                    <CommitMessage 
                        message={commitMessage}
                        handleMessageChange={handleMessageChange}
                    />
                </fieldset>

                <ConfirmationModal
                    handleValidate={handleValidate}
                    cancelValidation={cancelValidation}
                    validationResults={validationResults}
                    env={env}
                    install={install}
                    commitWorkingManifest={commitWorkingManifest}
                />

            </form>
        </div>
    );
}