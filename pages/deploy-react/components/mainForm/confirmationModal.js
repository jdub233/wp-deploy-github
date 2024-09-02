import ChangedPackages from './confirmationModal/changedPackages';
import RemovedPackages from './confirmationModal/removedPackages';
import AddedPackages from './confirmationModal/addedPackages';

export default function ConfirmationModal({handleValidate, validationResults = {}, env, install }) {
    const numChangedPackages = 
        (validationResults.changed_packages?.length ?? 0) + 
        (validationResults.removed_packages?.length ?? 0) + 
        (validationResults.added_packages?.length ?? 0);

    return (
        <div className="confimation_modal">
            <div className="button-row">
                <button id="task_confirm_button" onClick={handleValidate} className="button primary show-modal">Validate</button>
            </div >

            { Object.keys( validationResults ).length != 0 &&

            <div id="task_confirm" className="reveal-modal">
                <div className="confirmation-status confirmation-success">
                    <h1>Validation results</h1>
                    <p>You are about to build <span className="full_change_count">{numChangedPackages}</span> update{numChangedPackages > 1 ? 's' : ''} for 
                        <span className="destination_install"> {install}</span> on <span
                            className="destination_environment"> {env}</span>.
                    </p>
                    <div className="package-summary">
                        <span className="packages-changed"><span className="packages-changed-count">{validationResults.changed_packages.length} </span>
                            Changed</span> &nbsp;
                        <span className="packages-added"><span className="packages-added-count">{validationResults.added_packages.length} </span>
                            Added</span> &nbsp;
                        <span className="packages-removed"><span className="packages-removed-count">{validationResults.removed_packages.length} </span>
                            Removed</span>
                    </div>
                    <div id="validate-modal-success-tabs">
                        <ul>
                            <li>&nbsp;</li>
                        </ul>
                        <div id="tab-summary-view">
                            <ChangedPackages changedPackages={validationResults.changed_packages} />
                            <RemovedPackages removedPackages={validationResults.removed_packages} />
                            <AddedPackages addedPackages={validationResults.added_packages} />
                        </div>
                    </div>
                </div>
            </div>
            }

        </div>
    );
}