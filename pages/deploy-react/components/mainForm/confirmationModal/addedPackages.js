import { HiPlusCircle } from "react-icons/hi";

export default function AddedPackages({addedPackages}) {

    if (!addedPackages || addedPackages.length === 0) {
        return null;
    }

    return (
        <div className="package-list added-packages">
            <h3>Added Packages</h3>
            <ul>
                {addedPackages.map((pkg, index) => (
                    <AddedPackage key={index} pkg={pkg} />
                ))}
            </ul>
        </div>
    );
}

function AddedPackage({ pkg: { id, changed_attributes: { scm, source, refspec, rev, dest } } }) {
    return (
        <li className="package added">
            <h4><HiPlusCircle /> {id}</h4>
            <ul>
                <li>scm: {scm}</li>
                <li>source: {source}</li>
                {scm === 'git' && <li>refspec: {refspec}</li>}
                <li>rev: {rev}</li>
                <li>dest: {dest}</li>
            </ul>
        </li>
    );
}