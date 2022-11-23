const github = require('@actions/github');
const context = github.context;

const TRIGGER_PULL_REQUEST = 'pull_request';
const TRIGGER_PUSH = 'push';
const TRIGGER_WORKFLOW_DISPATCH = 'workflow_dispatch'


class InfoGatherer {

	_context = null;
	_repositoryName = null;
	_repositoryOwner = null;

	/**
	 * Create and initialize the InfoGatherer object
	 *
	 * @param {string} repositoryName The name of the repository (owner/repo) where the action is running.
	 * @param {object} context The context object representing the workflow which triggered the action (from @actions/github).
	 */
	constructor(repositoryName, context) {

		if (!repositoryName || repositoryName.constructor !== String)
			throw new Error('The repository parameter is required and must be a string');

		const fragments = repositoryName.match(/([^/]+)\/(.*)/)
		if (!fragments || fragments.length !== 3)
			throw new Element(`Unexpected epository name format '${repositoryName}'.`)
		this._repositoryOwner = fragments[1]
		this._repositoryName = fragments[2]

		switch (context.eventName) {
			case TRIGGER_PULL_REQUEST:
			case TRIGGER_PUSH:
			case TRIGGER_WORKFLOW_DISPATCH:
				this._context = context;
				break;

			default:
				throw new Error(`Unsupported event '${context.eventName}'.`);
		}

	}

	/**
	 * Returns an object encapsulating the entire set of build information.
	 */
	get BuildInformation() {
		return {
				build_name: this.BuildName,
				branch_name: this.BranchName,
				commit_hash: this.CommitHash,
				repo_owner: this.RepoOwner,
				repo_name: this.RepoName
			}
		};

	/**
	 * Returns a string containing the build name.
	 *
	 * For a push or manual build, this will be the name of the branch being built.
	 * For a pull request, the pull request number in the format pr-###.
	 */
	get BuildName() {
		switch (this._context.eventName) {
			case TRIGGER_PUSH:
			case TRIGGER_WORKFLOW_DISPATCH:
				{
					let ref = this._context.ref;
					return ref.replace(/refs\/(heads|tags)\//, '').replace(/\//,'__');
				}

			case TRIGGER_PULL_REQUEST:
				{
					const digits = this._context.payload?.pull_request?.number;
					if(digits)
						return `pr-${digits}`;
					else
					{
						console.error('Path context.payload.pull_request.number is not defined.')
						throw new Error('Path context.payload.pull_request.number is not defined.');
					}
				}

			default:
				throw new Error(`Unsupported event '${this._context.eventName}'.`);
		}
	}

	/**
	 * Returns a string containing the branch being built.
	 *
	 * For a push or manual build, contains the name of the branch being built.
	 * For a pull request, the pull request number in the format pr-###.
	 */
	get BranchName() {
		switch (this._context.eventName) {
			case TRIGGER_PUSH:
			case TRIGGER_WORKFLOW_DISPATCH:
				{
					let ref = this._context.ref;
					return ref.replace(/refs\/(heads|tags)\//, '');
				}

			case TRIGGER_PULL_REQUEST:
				{
					const digits = this._context.payload?.pull_request?.number;
					if (digits)
						return `pr-${digits}`;
					else {
						console.error('Path context.payload.pull_request.number is not defined.')
						throw new Error('Path context.payload.pull_request.number is not defined.');
					}
				}

			default:
				throw new Error(`Unsupported event '${this._context.eventName}'.`);
		}
	}

	/**
	 * Gets the commit hash for the code being built.
	 */
	get CommitHash() {
		switch (this._context.eventName) {
			case TRIGGER_PUSH:
			case TRIGGER_WORKFLOW_DISPATCH:
				return this._context.sha;

			case TRIGGER_PULL_REQUEST:
				const hash = this._context.payload?.pull_request?.head?.sha;
					if(hash)
						return hash;
					else {
						console.error('Path context.payload.pull_request.head.sha is not defined.')
						throw new Error('Path context.payload.pull_request.head.sha is not defined.');
					}

			default:
				throw new Error(`Unsupported event '${this._context.eventName}'.`);
		}
	}

	/**
	 * Returns the name of the repository where the build is being run.
	 */
	get RepoName() {
 		return this._repositoryName
	}

	/**
	 * Returns a string containing the repository owner's name.
	 */
	get RepoOwner() {
		return this._repositoryOwner;
	}

	// Constants used by the class.
	get TRIGGER_PULL_REQUEST() { return TRIGGER_PULL_REQUEST; }
	get TRIGGER_PUSH() { return TRIGGER_PUSH; }
	get TRIGGER_WORKFLOW_DISPATCH() { return TRIGGER_WORKFLOW_DISPATCH; }
}

module.exports = InfoGatherer;
