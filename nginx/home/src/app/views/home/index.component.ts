import { Component } from '@angular/core';

// Services
import { AppRouterService } from 'src/app/services';

//Types
import { ApiSource, EndpointSource, ValidApiSources } from 'src/app/types';

@Component({
	selector: 'app-home-view',
	templateUrl: './index.component.html',
})
export class HomeViewComponent {
	public apiSources = ValidApiSources;
	public activeApiSource = ValidApiSources[0];
	public activeEndpointSource = ValidApiSources[0].endpoints[0];
	public activeEndpointSourceVariant: EndpointSource | null = null;
	public responseCode: string = `
{}
`;

	private _emptyCodeTemplate = `
{}
`;
	constructor(private router: AppRouterService) {}

	public onApiSourceClick(target: ApiSource): void {
		if (!ValidApiSources.find((apiSource) => apiSource.name === target.name)) {
			return;
		}

		this.activeApiSource = target;
		this.activeEndpointSource = this.activeApiSource.endpoints[0];
		this.activeEndpointSourceVariant = null;

		this.responseCode = this._emptyCodeTemplate;
	}

	public onApiEndpointSourceClick(target: EndpointSource): void {
		if (
			!this.activeApiSource.endpoints.find(
				(endpointSource) => endpointSource.name === target.name,
			)
		) {
			return;
		}

		this.activeEndpointSource = target;
		this.activeEndpointSourceVariant = null;

		this.responseCode = this._emptyCodeTemplate;
	}

	public onApiEndpointSourceVariantClick(target: EndpointSource): void {
		if (
			!this.activeEndpointSource ||
			!this.activeEndpointSource.variants ||
			!this.activeEndpointSource.variants.find(
				(endpointSourceVariant) => endpointSourceVariant.name === target.name,
			)
		) {
			return;
		}

		this.activeEndpointSourceVariant = target;

		this.responseCode = this._emptyCodeTemplate;
	}

	public generateCodeExample(): string {
		if (!this.activeApiSource || !this.activeEndpointSource) {
			return this._emptyCodeTemplate;
		}

		let fetchTemplate = `fetch('${this.getUrl(
			this.activeEndpointSource,
		)}', {${this.getRequestParams(this.activeEndpointSource)}})`;

		if (this.activeEndpointSourceVariant) {
			this.activeEndpointSourceVariant.credentials = this.activeEndpointSource.credentials;

			fetchTemplate = `fetch('${this.getUrl(
				this.activeEndpointSourceVariant,
				this.activeEndpointSource,
			)}', {${this.getRequestParams(this.activeEndpointSourceVariant)}})`;
		}

		return `
${fetchTemplate}
.then(response => {
    return response.json();
})
.then(data => {
    console.log(data);
})
`;
	}

	public onFetchClick(): void {
		this.responseCode = this._emptyCodeTemplate;

		if (!this.activeApiSource || !this.activeEndpointSource) {
			return;
		}

		if (this.activeEndpointSourceVariant) {
			fetch(this.getUrl(this.activeEndpointSourceVariant, this.activeEndpointSource), {
				method: this.activeEndpointSourceVariant.method,
				body: this.activeEndpointSourceVariant.requestParams?.body,
				headers: this.activeEndpointSourceVariant.requestParams?.headers,
				credentials: this.activeEndpointSource.credentials,
			})
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					this.responseCode =
						'\n' + JSON.stringify(data, this.truncateBase64Strings, '   ');
				})
				.catch((error) => {
					this.responseCode =
						'\n' +
						JSON.stringify({ wasSuccess: false, error: error.message }, null, '   ');
				});

			return;
		}

		fetch(this.getUrl(this.activeEndpointSource, undefined), {
			method: this.activeEndpointSource.method,
			body: this.activeEndpointSource.requestParams?.body,
			headers: this.activeEndpointSource.requestParams?.headers,
			credentials: this.activeEndpointSource.credentials,
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				this.responseCode = '\n' + JSON.stringify(data, this.truncateBase64Strings, '   ');
			})
			.catch((error) => {
				this.responseCode =
					'\n' + JSON.stringify({ wasSuccess: false, error: error.message }, null, '   ');
			});
	}

	public logoOnClick(): void {
		this.router.navigateTo('/');
	}

	public loginOnClick(): void {
		this.router.navigateTo('dashboard');
	}

	public getUrl(target: EndpointSource, parentTarget?: EndpointSource): URL {
		let url = new URL(
			`${this.activeApiSource.isSecure ? 'https' : 'http'}://${
				this.activeApiSource.rootUrl
			}/${this.activeApiSource.rootPath}/api/v${target.version}${
				target.path ? `/${target.path}` : ''
			}`,
		);

		if (parentTarget) {
			url = new URL(
				`${this.activeApiSource.isSecure ? 'https' : 'http'}://${
					this.activeApiSource.rootUrl
				}/${this.activeApiSource.rootPath}/api/v${target.version}${
					parentTarget.path ? `/${parentTarget.path}` : ''
				}${target.path ? `/${target.path}` : ''}`,
			);
		}

		if (target.requestParams?.searchParams) {
			for (const [key, value] of Object.entries(target.requestParams.searchParams)) {
				url.searchParams.append(key, value);
			}
		}

		return url;
	}

	private getRequestParams(target: EndpointSource): string {
		let body = `body: {`;
		let headers = `headers: {`;

		const bodyTextDefaultSize = body.length;
		const headersTextDefaultSize = headers.length;

		if (target?.requestParams?.body) {
			for (const [key, value] of Object.entries(target?.requestParams?.body)) {
				body += `
		${key}: '${value}',`;
			}
		}

		body +=
			body.length > bodyTextDefaultSize
				? `
	},`
				: '}';

		if (target?.requestParams?.headers) {
			target?.requestParams?.headers?.forEach((value, key) => {
				headers += `
		${key}: '${value}',
`;
			});
		}

		headers +=
			headers.length > headersTextDefaultSize
				? `
	},`
				: '}';

		let result = `
	${`method: '${target.method}'`},`;

		if (headers.length > headersTextDefaultSize + 1) {
			result += `
	${headers}`;
		}

		if (body.length > bodyTextDefaultSize + 1) {
			result += `
	${body}`;
		}

		if (target.credentials) {
			result += `
	credentials: '${target.credentials}',`;
		}

		result += `
`;
		return result;
	}

	private truncateBase64Strings(key: string, value: any) {
		if (
			key.toLocaleLowerCase().includes('image') ||
			key.toLocaleLowerCase().includes('markdown')
		) {
			return value.substring(0, 25) + '...';
		}

		return value;
	}
}
