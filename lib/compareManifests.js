// This function takes two manifests and compares them to determine what has changed between them.
function compareManifests(originalManifest, changedManifest) {

    // Find the packages that have been removed, and get their IDs.
   const removedPackages = originalManifest.filter(({ id: originalId }) => 
       !changedManifest.some(({ id: changedId }) => changedId === originalId));
   const removedIDs = removedPackages.map(({ id }) => id);

   // Reduce the changedManifest to the packages that have been added or changed.
   // Should return an array of objects with the following structure:
   // { changed_pkgs: [ pkg, ...], added_pkgs: [ pkg, ...] }
   const result = changedManifest.reduce((acc, pkg) => {
       const originalPkg = originalManifest.find(({ id }) => id === pkg.id);
       if (!originalPkg) {
           // If the package is not in the original manifest, put a record of it in the added_packages array of the accumulator.
           // Construct an object with the id and attributes of the added package.
           const { scm, source, refspec, rev, dest } = pkg;
           acc.added_packages.push({ id: pkg.id, changed_attributes: { scm, source, refspec, rev, dest } });
       } else {
           // If the package is in the original manifest, check if the attributes have changed.

           // Destructure for both pkg and originalPkg to simplify comparisons
           const { scm, source, refspec, rev, dest } = pkg;
           const { scm: originalScm, source: originalSource, refspec: originalRefspec, rev: originalRev, dest: originalDest } = originalPkg;

           if (scm !== originalScm || source !== originalSource || refspec !== originalRefspec || rev !== originalRev || dest !== originalDest) {
               // If the attributes have changed, add the package to the changed_packages array of the accumulator.
               acc.changed_packages.push({
                   id: pkg.id,
                   changed_attributes: { scm, source, refspec, rev, dest },
                   old_attributes: { scm: originalScm, source: originalSource, refspec: originalRefspec, rev: originalRev, dest: originalDest }
               });
           }
       }
       return acc;
   }, { added_packages: [], changed_packages: [] });

   return {
       status: 'success',
       removed_packages: removedIDs,
       changed_packages: result.changed_packages,
       added_packages: result.added_packages
   };
}

export { compareManifests };
