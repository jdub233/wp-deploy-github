export default function ManifestListUIControls( {setFilterCriteria, filterCriteria} ) {
    return (
        <div className="manifest-list-ui-controls">
            <div className="list-ui-controls-inner">
                <input type="search" className="manifest-list-search" placeholder="Search..." />
                <button type="button" onClick={() => setFilterCriteria(null)} className={`manifest-list-filter show-all${!filterCriteria ? ' filter-active' : ''}`}>Show All</button>
                <button type="button" onClick={() => setFilterCriteria('outdatedProd')} className={`manifest-list-filter${filterCriteria == 'outdatedProd' ? ' filter-active' : ''}`}>Show outdated only</button>
                <button type="button" className="manifest-list-filter">Show	mismatched SCM</button>
                <button type="button" className="manifest-list-action manifest-list-add-from-prod">Replace all with Prod</button>
            </div>
        </div>
    );
}