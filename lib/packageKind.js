// Derive a package's type from its destination path.
// The type is already implicit in the manifest data -- `dest` carries
// wp-content/plugins/..., wp-content/mu-plugins/..., or wp-content/themes/... --
// so no manifest schema change is needed to facet on it.
function kindOf(dest) {
    const match = /^wp-content\/(plugins|mu-plugins|themes)\//.exec(dest || '');
    if (!match) return 'other';
    return match[1] === 'plugins' ? 'plugin' : match[1] === 'mu-plugins' ? 'mu-plugin' : 'theme';
}

// Status facets are named for what the code actually does: mainForm.js hardcodes
// prod/cms.ini as the reference manifest, so these compare against prod cms and
// nothing else.
function matchesStatus(status, pkg, prodPkg) {
    if (status === 'notInProd') return !prodPkg;
    if (status === 'outdated') return !!prodPkg && prodPkg.rev !== pkg.rev;
    return true;
}

const KIND_ORDER = ['theme', 'plugin', 'mu-plugin', 'other'];

const KIND_LABELS = {
    theme: 'Themes',
    plugin: 'Plugins',
    'mu-plugin': 'mu-Plugins',
    other: 'Other',
};

export { kindOf, matchesStatus, KIND_ORDER, KIND_LABELS };
