import { useEffect, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";

export default function Package({
    manifestItem,
    index,
    workingManifest,
    setWorkingManifest,
    prodManifest,
    devlManifest,
}) {
    const [expanded, setExpanded] = useState(false);
    
    const [starred, setStarred] = useState(false);

    const [repoTags, setRepoTags] = useState([]);

    const [referenceProdPackage, setReferenceProdPackage] = useState({});

    useEffect(() => {
        if(typeof window !== "undefined") {
            const findReferenceProdPackage = () => {
                setReferenceProdPackage(prodManifest.find((prodPackage) => prodPackage.id === manifestItem.id));
            };
            findReferenceProdPackage();
        }
    }, [prodManifest, manifestItem]);

    // Handler method to toggle the expanded state
    const toggleExpand = async () => {
        if (typeof window !== "undefined") {

            setExpanded(!expanded);

            // If the package is being expanded and repoTags is empty, then fetch the tags for the repo.
            if (!expanded && repoTags.length === 0) {
                const fetchTags = async () => {
                    try {
                        // The source values stores the full repo location starting with git@github.com/ and ending with .git, so wee need to remove those before querying the API.
                        const repo = manifestItem.source.replace('git@github.com:', '').replace('.git', '');

                        const response = await fetch(`/api/fetchTags?repo=${repo}`);
                        const data = await response.json();
                        setRepoTags(data);
                        console.log(data);
                    } catch (error) {
                        console.error('Failed to fetch tags:', error);
                    }
                };
            
                fetchTags();
            }
        }
    };

    // Handler method to toggle the starred state, should store results in cookie or local storage
    const toggleStar = () => {
        setStarred(!starred);
    };

    // If the manifestItem is not defined, return null
    if ( !manifestItem ) {
        return null;
    }

    return (
        <div className={`package-listing ${ !referenceProdPackage || (referenceProdPackage.rev !== manifestItem.rev) ? 'old-version' : 'current-version'}`}>
            <div className="summary-info cf">
                <div className="img layout"></div>
                <div className="center-content layout">
                    <h3>{manifestItem.id}</h3>
                    <p className="pkg-details">{manifestItem.rev.substr(0,6)}</p>
                </div>
                <div className="expand-arrow layout" onClick={toggleExpand}>
                    {!expanded && <span className="collapsed">&#x25C0;</span>}
                    { expanded && <span className="collapsed">&#x25BC;</span>}
                </div>
                <div className="favorite-star layout" onClick={toggleStar}>
                    {!starred && <span className="star star-outline">&#9734;</span>}
                    { starred && <span className="star star-filled">&#9733;</span>}
                </div>
            </div>
            
            <div className="expanded-info cf" style={expanded ? {display: 'block'} : {display: 'none'} }>
                <div>
                    <span className="info-label">SCM:</span> 
                    <label>
                        <input type="radio" class="scm-radio scm-svn" name={`scm-radio-${manifestItem.id}`} value="svn" checked={manifestItem == 'svn'} />
                        SVN
                    </label>
                    <label>
                        <input type="radio" class="scm-radio scm-git" name={`scm-radio-${manifestItem.id}`} value="git" checked={manifestItem.scm == 'git'} /> 
                        GIT
                    </label>
                </div>
                <div className="refspec-line">
                    <span className="info-label">Refspec:</span>
                            <input type="text" className="current-refspec" value={manifestItem.refspec} />
                    <Popover 
                        placement='right'
                    >
                        <PopoverTrigger>
                            <span className="info-icon">&#9432;</span>
                        </PopoverTrigger>
                        <PopoverContent>
                            <h4>Tags</h4>
                            <ul>
                                {repoTags.map((tag, index) => (
                                    <li key={index}>{tag}</li>
                                ))}
                            </ul>

                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <span className="info-label">Rev:</span>
                    <input type="text" className="current-rev" value={manifestItem.rev} /> 
                    <span className="set-one-rev-to-prod">set to prod</span>
                </div>
                <div>
                    <span className="info-label">Source:</span>
                    <input type="text" class="current-source" value={manifestItem.source} />
                </div>
                <div>
                    <span className="info-label">Destination:</span>
                    <input type="text" className="current-dest" value={manifestItem.dest} />
                </div>
                <div className="remove-package"><span class="do-remove">remove package</span></div>
            </div>
        </div>
    );
}