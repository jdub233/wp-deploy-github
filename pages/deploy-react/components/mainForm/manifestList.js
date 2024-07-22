import Package from "./manifestList/package";
import ManifestListUIControls from "./manifestList/manifestListUIControls";

export default function ManifestList({
    workingManifest,
    setWorkingManifest,
    loadedManifest,
    prodManifest,
    devlManifest,
}) {

    function manifestNotEmpty(workingManifest) {
        if (typeof window !== "undefined") {
            return workingManifest.length > 0;
        }
    }

    return (
        <>
            <fieldset>
                <legend><span className="step">2</span>Manifest Packages</legend>
                <p>
                    Make any adjustments or modifications to the manifest file to fine-tune this build.
                </p>
                <div className="boxy manifest-packages-outer cf" style={{ position: "relative" }}>
                    <div style={{ clear: "both" }}>
                        <div className="notifications-wrapper">notify</div>
                        { !manifestNotEmpty(workingManifest) && <div className="select-env-message">
                            <h3>Select an environment &amp; a build...</h3>
                        </div> }
                    </div>
                    <div id="manifest-list-app" className="clearfix">
                        <div id="manifest-list-results-overlay">&nbsp;</div>
                        <div className="manifest-results-wrapper">
                            { manifestNotEmpty(workingManifest) && <h3 className="working-manifest-title">Working manifest</h3>}
                            <div id="manifest-list-results">
                                { manifestNotEmpty(workingManifest) && workingManifest.map((manifestItem, index) => (
                                    <Package
                                        key={index}
                                        manifestItem={manifestItem}
                                        index={index}
                                        workingManifest={workingManifest}
                                        setWorkingManifest={setWorkingManifest}
                                        prodManifest={prodManifest}
                                        devlManifest={devlManifest}
                                    />
                                ))}
                            </div>
                            <div className="add-new-package closed">
                                <div>
                                    <span className="add-package-icon">
                                        <span className="collapsed">&#43;</span>
                                        <span className="expanded">&#45;</span>
                                    </span>
                                    <h4 className="add-new-package-header">Add new package</h4>
                                </div>

                            </div>
                            <div className="add-package-details">
                                <input type="text" id="add-new-package-id"
                                    placeholder="Package ID" />
                                <select id="add-new-package-scm">
                                    <option value="">SCM...</option>
                                    <option value="svn">SVN</option>
                                    <option value="git">GIT</option>
                                </select>
                                <button type="button" className="button primary"
                                    id="go-add-new-package">Add package</button>
                            </div>
                        </div>
                        {manifestNotEmpty(workingManifest) && <ManifestListUIControls />}
                    </div>
                </div>
            </fieldset>
        </>
    );
}