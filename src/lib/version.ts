import rawPkg from '../../package.json';

interface PackageJson {
	version: string;
}

const pkg = rawPkg as PackageJson;

export const APP_VERSION = pkg.version;
