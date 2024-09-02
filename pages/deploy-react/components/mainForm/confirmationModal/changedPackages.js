import { HiArrowCircleRight, HiArrowSmRight } from "react-icons/hi";

export default function ChangedPackages({changedPackages}) {

    if (!changedPackages || changedPackages.length === 0) {
        return null;
    }

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

    return (
        <li className="package changed" >
            <h4>
            <HiArrowCircleRight />{pkg.id}
            </h4>
            <ul>
                { pkg.changed_attributes?.refspec && 
                    <li>
                        refspec: <span className="old-value">{pkg.old_attributes.refspec}</span> <HiArrowSmRight /> <span className="new-value">{pkg.changed_attributes.refspec}</span>
                    </li>
                }
                { pkg.changed_attributes?.rev &&
                    <li>
                        rev: <span className="old-value">{pkg.old_attributes.rev.substring(0,10)}</span> <HiArrowSmRight /> <span className="new-value">{pkg.changed_attributes.rev.substring(0,10)}</span>
                    </li>
                }
            </ul>
        </li>
    );
}
