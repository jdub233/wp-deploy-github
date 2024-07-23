export default function CommitMessage() {
    return (
        <fieldset className="boxy">
            <legend>Commit message / Comments <span>Optional</span></legend>
            <label className="at" htmlFor="commit-message">Commit message (optional)</label>
            <textarea name="commit_message" id="commit-message"
                className="log prettyprint"></textarea>
        </fieldset>
    );
}