export default function ManifestListUIControls() {
    return (
        <div className="manifest-list-ui-controls">
            <div className="list-ui-controls-inner">
                <input type="search" className="manifest-list-search" placeholder="Search..." />
                <button type="button" className="manifest-list-filter show-all">Show All</button>
                <button type="button" className="manifest-list-filter">Show outdated only</button>
                <button type="button" className="manifest-list-filter">Show	mismatched SCM</button>
                <button type="button" className="manifest-list-action manifest-list-add-from-prod">Replace all with Prod</button>
            </div>
        </div>
    );
}