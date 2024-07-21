import { useState, useEffect } from "react";

export default function MainForm() {
    // Track the overall installs available in the manifest repo.
    const [envInstalls, setEnvInstalls] = useState([]);

    // UI Components
    const [env, setEnv] = useState("");
    const [install, setInstall] = useState("");


    // Manifest state
    const [workingManifest, setWorkingManifest] = useState({});

    useEffect(() => {
        // This code runs only on the client side
        if (typeof window !== "undefined") {
            // Fetch environment installs
            fetch("/api/fetchFiles")
                .then(response => response.json())
                .then(data => {setEnvInstalls(data)});
        }
    }, []);

    const handleEnvChange = (e) => {
        setEnv(e.target.value);

        // If there are both an env and install, then fetch to corresponding ini file.
        if (install) {
            getNewWorkingManifest(env, install);
        }

        console.log('hey env is now this:', e.target.value);
    };

    const handleInstallChange = (e) => {
        setInstall(e.target.value);

        // If there are both an env and install, then fetch to corresponding ini file.
        if (env) {
            getNewWorkingManifest(env, install);
        }

        console.log('hey install is now this:', e.target.value);
    }

    function getNewWorkingManifest(env, install) {
        console.log('should fetch an ini file base on env and install');
        console.log('env:', env, 'install:', install);
        fetch(`/api/fetchIniFile?path=${env}/${install}.ini`)
            .then(response => response.json())
            .then(data => {
                console.log('data:', data);
                setWorkingManifest(data)
            });
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
                        <p class="helper info">
                            The source environment where install is located.
                        </p>
                        <ul className="radio-group">
                            <li>
                                <input type="radio" name="build_env" id="build_env_devl" value="devl" 
                                    onChange={handleEnvChange}
                                    checked={env === "devl"}
                                />
                                <label for="build_env_devl" title="Development">Development</label>
                            </li>
                            <li>
                                <input type="radio" name="build_env" id="build_env_test" value="test"
                                    onChange={handleEnvChange}
                                    checked={env === "test"}
                                />
                                <label for="build_env_test" title="Test">Test</label>
                            </li>
                            <li>
                                <input type="radio" name="build_env" id="build_env_syst" value="syst"
                                    onChange={handleEnvChange}
                                    checked={env === "syst"}
                                />
                                <label for="build_env_syst" title="Systems">Systems</label>
                            </li>
                            <li>
                                <input type="radio" name="build_env" id="build_env_prod" value="prod"
                                    onChange={handleEnvChange}
                                    checked={env === "prod"}
                                />
                                <label for="build_env_prod" title="Production">Production</label>
                            </li>

                            <li>
                                <input type="radio" name="build_env" id="build_env_cloud" value="cloud"
                                    onChange={handleEnvChange}
                                    checked={env === "cloud"}
                                />
                                <label for="build_env_cloud" title="Cloud">Cloud</label>
                            </li>
                        </ul>
                    </fieldset>
                    <fieldset className="boxy">
                        <legend>Install</legend>
                        <p className="helper info">
                            The install which is being built.
                        </p>
                        <ul class="radio-group">
                            <li>
                                <input type="radio" name="build_inst" id="build_inst_blogs" value="blogs"
                                    onChange={handleInstallChange}
                                    checked={install === "blogs"}
                                />
                                <label for="build_inst_blogs">Blogs</label>
                            </li>
                            <li>
                                <input type="radio" name="build_inst" id="build_inst_cms" value="cms"
                                    onChange={handleInstallChange}
                                    checked={install === "cms"}
                                />
                                <label for="build_inst_cms">CMS</label>
                            </li>
                            <li>
                                <input type="radio" name="build_inst" id="build_inst_sandbox"
                                    value="sandbox" class="show-options"
                                    data-additional-container="build_sandbox"
                                    onChange={handleInstallChange}
                                    checked={install === "sandbox"}    
                                />
                                <label for="build_inst_sandbox">Sandbox</label>
                            </li>
                        </ul>
                        <div id="build_sandbox" className="sandbox-chooser additional-container">
                            <label htmlFor="sandbox_id_select">Select sandbox:</label>
                            <input type="text" name="sandbox_id_new" id="sandbox_id_new"
                                class="sandbox-select input-text" data-selected_install="" />
                        </div>
                    </fieldset>
                </fieldset>
            </form>
            <div className="tempDisplay">
                <p>Environment: {env}</p>
                <p>Install: {install}</p>
                {workingManifest && <pre>{JSON.stringify(workingManifest, null, 2)}</pre>}
            </div>
        </div>
    );
}