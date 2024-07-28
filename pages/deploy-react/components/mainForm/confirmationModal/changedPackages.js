export default function ChangedPackages({changedPackages}) {
    return (
        <div className="package-list changed-packages">
            <h3>Changed Packages</h3>
            <ul>
                {changedPackages.map((pkg, index) => (
                    <ChangedPackage key={index} pkg={pkg} />
                ))}
            </ul>
        </div>
    );
}

function ChangedPackage({pkg}) {

    console.log(pkg);

    return (
        <li className="package changed" >
            <h4>
                <span className="icon-arror-circle-right" />{pkg.id}
            </h4>
            <ul>
                { pkg.changed_attributes?.refspec && 
                    <li>
                        refspec: <span className="old-value">{pkg.old_attributes.refspec}</span>
                        <span className="icon-arrow-right" />
                        <span className="new-value">{pkg.changed_attributes.refspec}</span>
                    </li>
                }
            </ul>
        </li>
    );
}
