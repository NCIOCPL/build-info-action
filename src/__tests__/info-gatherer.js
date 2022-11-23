'use strict'

const InfoGatherer = require('../info-gatherer');
const path = require('path');

const push_context =
Object.freeze({
	eventName: 'push',
	sha: 'a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1',
	ref: 'refs/heads/some_pushed_branch_name',
	workflow: null,
	action: null,
	actor: null,
	job: null,
	runNumber: 0,
	runId: 0,
	apiUrl: null,
	serverUrl: null,
	graphqlUrl: null,
	payload: require(path.join(__dirname, 'mock-push-payload.json'))
});

const pull_request_context =
Object.freeze({
	eventName: 'pull_request',
	sha: 'b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2',
	ref: 'refs/heads/pr_21',
	workflow: null,
	action: null,
	actor: null,
	job: null,
	runNumber: 0,
	runId: 0,
	apiUrl: null,
	serverUrl: null,
	graphqlUrl: null,
	payload: require(path.join(__dirname, 'mock-pull_request-payload.json'))
});

const wf_dispatch_context =
Object.freeze({
	eventName: 'workflow_dispatch',
	sha: 'c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3',
	ref: 'refs/heads/some_static_branch_name',
	workflow: null,
	action: null,
	actor: null,
	job: null,
	runNumber: 0,
	runId: 0,
	apiUrl: null,
	serverUrl: null,
	graphqlUrl: null,
	payload: require(path.join(__dirname, 'mock-workflow_dispatch-payload.json'))
});


describe('constructor', () => {

	it.each([
		[
			'succeeds for push',
			push_context
		],
		[
			'succeeds for pull_request',
			pull_request_context
		],
		[
			'succeeds for workflow_dispatch',
			wf_dispatch_context
		],
	])(
		'%s',
		(name, context) => {

			const instance = new InfoGatherer('some/repo', context);
			expect(instance).not.toBeNull();
		}
	);

	it('fails for unknown events', () => {

		expect(() => {
			const failureContext =
			{
				eventName: 'chicken',
				sha: 'ffac537e6cbbf934b08745a378932722df287a53',
				ref: 'refs/heads/some_branch_name',
				repository: 'repo_owner/repo_name',
				workflow: null,
				action: null,
				actor: null,
				job: null,
				runNumber: 0,
				runId: 0,
				apiUrl: null,
				serverUrl: null,
				graphqlUrl: null,
				payload: require(path.join(__dirname, 'mock-workflow_dispatch-payload.json'))
			};

			new InfoGatherer('some/repo', failureContext);
		})
			.toThrowError("Unsupported event 'chicken'.")

	});
});


describe('BuildInformation', () => {

	it.each([
		[
			'succeeds for push',
			'push_repo_owner/push_repo_name',
			push_context,
			{
				build_name: "some_pushed_branch_name",
				branch_name: "some_pushed_branch_name",
				commit_hash: "a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
				repo_owner: "push_repo_owner",
				repo_name: "push_repo_name"
			}
		],
		[
			'succeeds for pull_request',
			'pull_repo_owner/pull_repo_name',
			pull_request_context,
			{
				build_name: "pr-21",
				branch_name: "pr-21",
				commit_hash: "34725efb0cd7a71afb5e2a48a9731c526e9a9e89",
				repo_owner: "pull_repo_owner",
				repo_name: "pull_repo_name"
			}
		],
		[
			'succeeds for workflow_dispatch',
			'static_repo_owner/static_repo_name',
			wf_dispatch_context,
			{
				build_name: "some_static_branch_name",
				branch_name: "some_static_branch_name",
				commit_hash: "c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3",
				repo_owner: "static_repo_owner",
				repo_name: "static_repo_name"
			}
		],
	])(
		'%s',
		(name, repoName, context, expected) => {

			const instance = new InfoGatherer(repoName, context);
			const actual = instance.BuildInformation;

			expect(actual).toStrictEqual(expected);
		}
	);

});


describe('CommitHash', () => {

	it.each([
		[
			'succeeds for push',
			push_context,
			'a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1'
		],
		[
			'succeeds for pull_request',
			pull_request_context,
			'34725efb0cd7a71afb5e2a48a9731c526e9a9e89'
		],
		[
			'succeeds for workflow_dispatch',
			wf_dispatch_context,
			'c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3'
		],
	])(
		'%s',
		(name, context, expected) => {

			const instance = new InfoGatherer('some/repo', context);
			const actual = instance.CommitHash;

			expect(actual).toBe(expected);
		}
	);

});


describe('BuildName', () => {

	it.each([
		[
			'succeeds for push',
			push_context,
			'some_pushed_branch_name'
		],
		[
			'succeeds for pull_request',
			pull_request_context,
			'pr-21'
		],
		[
			'succeeds for workflow_dispatch',
			wf_dispatch_context,
			'some_static_branch_name'
		],
	])(
		'%s',
		(name, context, expected) => {

			const instance = new InfoGatherer('some/repo', context);
			const actual = instance.BuildName;

			expect(actual).toBe(expected);
		}
	);

	it('replaces / in branch names with __', () => {

		const expected = 'ticket__123-branch-name'

		let context = {...push_context};
		context.ref = 'refs/heads/ticket/123-branch-name'

		const instance = new InfoGatherer('some/repo', context);
		const actual = instance.BuildName;

		expect(actual).toBe(expected);
	});

});


describe('BranchName', () => {

	it.each([
		[
			'succeeds for push',
			push_context,
			'some_pushed_branch_name'
		],
		[
			'succeeds for pull_request',
			pull_request_context,
			'pr-21'
		],
		[
			'succeeds for workflow_dispatch',
			wf_dispatch_context,
			'some_static_branch_name'
		],
	])(
		'%s',
		(name, context, expected) => {

			const instance = new InfoGatherer('some/repo', context);
			const actual = instance.BranchName;

			expect(actual).toBe(expected);
		}
	);

	it('does not replace / in branch names', () => {

		const expected = 'ticket/123-branch-name'

		let context = { ...push_context };
		context.ref = 'refs/heads/ticket/123-branch-name'

		const instance = new InfoGatherer('some/repo', context);
		const actual = instance.BranchName;

		expect(actual).toBe(expected);
	});


});


describe('RepoName', () => {

	it.each([
		[
			'succeeds for push',
			'push_repo_owner/push_repo_name',
			push_context,
			'push_repo_name'
		],
		[
			'succeeds for pull_request',
			'pull_repo_owner/pull_repo_name',
			pull_request_context,
			'pull_repo_name'
		],
		[
			'succeeds for workflow_dispatch',
			'static_repo_owner/static_repo_name',
			wf_dispatch_context,
			'static_repo_name'
		],
	])(
		'%s',
		(name, repoName, context, expected) => {

			const instance = new InfoGatherer(repoName, context);
			const actual = instance.RepoName;

			expect(actual).toBe(expected);
		}
	);

});


describe('RepoOwner', () => {

	it.each([
		[
			'succeeds for push',
			'push_repo_owner/push_repo_name',
			push_context,
			'push_repo_owner'
		],
		[
			'succeeds for pull_request',
			'pull_repo_owner/pull_repo_name',
			pull_request_context,
			'pull_repo_owner'
		],
		[
			'succeeds for workflow_dispatch',
			'static_repo_owner/static_repo_name',
			wf_dispatch_context,
			'static_repo_owner'
		],
	])(
		'%s',
		(name, repoName, context, expected) => {

			const instance = new InfoGatherer(repoName, context);
			const actual = instance.RepoOwner;

			expect(actual).toBe(expected);
		}
	);

});
