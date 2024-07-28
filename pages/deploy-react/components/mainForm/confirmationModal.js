import ChangedPackages from "./confirmationModal/changedPackages";

export default function ConfirmationModal({handleValidate, validationResults}) {
   
    return (
        <div className="confimation_modal">
            <div className="button-row">
                <button id="task_confirm_button" onClick={handleValidate} className="button primary show-modal">Validate</button>
            </div >

            { Object.keys( validationResults ).length != 0 &&

            <div id="task_confirm" className="reveal-modal">
                <div className="confirmation-status confirmation-success">
                    <div><hr style={{paddingTop: '3em'}} /></div>
                    <h1>Validation results</h1>
                    <p>You are about to build <span className="full_change_count">0</span> update<span
                            className="change_count_plural">s</span> for <span
                            className="destination_install"></span> on <span
                            className="destination_environment"></span>.</p>
                    <p>Please review the following changes:</p>
                    <div className="package-summary">
                        <span className="packages-changed"><span className="packages-changed-count">{validationResults.changed_packages.length}</span>
                            Changed</span> &nbsp;
                        <span className="packages-added"><span className="packages-added-count">0</span>
                            Added</span> &nbsp;
                        <span className="packages-removed"><span className="packages-removed-count">{validationResults.removed_packages.length}</span>
                            Removed</span>
                    </div>
                    <div id="validate-modal-success-tabs">
                        <ul>
                            <li><a href="#tab-summary-view">Summary</a></li>
                            <li><a href="#tab-full-log-view">Full Log</a></li>
                        </ul>
                        <div id="tab-summary-view">
                            <ChangedPackages changedPackages={validationResults.changed_packages} />
                            <div className="package-list removed-packages">
                                <h3>Removed Packages</h3>
                                <ul></ul>
                            </div>
                            <div className="package-list added-packages">
                                <h3>Added Packages</h3>
                                <ul></ul>
                            </div>
                        </div>
                        <div id="validate-modal-success-tabs">
                            <div id="tab-summary-view">
                                <ChangedPackages changedPackages={validationResults.changed_packages} />
                                <div className="package-list removed-packages">
                                    <h3>Removed Packages</h3>
                                    <ul></ul>
                                </div>
                                <div className="package-list added-packages">
                                    <h3>Added Packages</h3>
                                    <ul></ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="prettyprint" id="validation_results">
                        {validationResults && JSON.stringify(validationResults)}
                    </div>
                </div>
            </div>
            }

        </div>
    );
}