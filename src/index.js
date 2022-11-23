const core = require('@actions/core');
const fs = require('fs');
const github = require('@actions/github');
const InfoGatherer = require('./info-gatherer');


try {

	const outputFile = core.getInput('output-name', { required: false });
	const format = core.getInput('format', { required: false });

	if (!outputFile) {
		console.error("parameter 'out-name' not set.");
		throw new Error("parameter 'out-name' not set.");
	}
	if (!format || format !== 'json') {
		console.error(`Parameter 'format' not valid, expected 'json', found '${format}'`);
		throw new Error(`Parameter 'format' not valid, expected 'json', found '${format}'`);
	}

	const repoName = process.env.GITHUB_REPOSITORY;
	const info = new InfoGatherer(repoName, github.context);

	const buildInfo = info.BuildInformation;
	const buildString = JSON.stringify(buildInfo, null, 2);

	fs.open(outputFile, 'wx', (err, fd) => {
		if (err) {
			if (err.code === 'EEXIST') {
				console.error('myfile already exists');
				return;
			}

			throw err;
		}

		fs.writeFile(outputFile, buildString, (err) => {
			if (err) throw err;
		});

	})


} catch (error) {
	core.setFailed(error.message);
}
