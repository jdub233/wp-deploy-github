import { HiMinusCircle } from "react-icons/hi";

export default function RemovedPackages({removedPackages}) {

    if (!removedPackages || removedPackages.length === 0) {
        return null;
    }

    return (
        <div className="package-list removed-packages">
            <h3>Removed Packages</h3>
            <ul>
                {removedPackages.map((pkg, index) => (
                    <RemovedPackage key={index} pkg={pkg} />
                ))}
            </ul>
        </div>
    );
}

function RemovedPackage({pkg}) {
    return (
        <li className="package removed" >
            <h4><HiMinusCircle />  {pkg}</h4>
        </li>
    );
}