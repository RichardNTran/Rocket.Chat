import { Meteor } from 'meteor/meteor';

import {
	defaultIdentifierFormat,
	defaultMetadataCertificateTemplate,
	defaultMetadataTemplate,
	SAMLUtils,
} from '../Utils';
import { IServiceProviderOptions } from '../../definition/IServiceProviderOptions';

/*
	The metadata will be available at the following url:
	[rocketchat-url]/_saml/metadata/[provider-name]
*/

export class ServiceProviderMetadata {
	static generate(serviceProviderOptions: IServiceProviderOptions): string {
		const data = this.getData(serviceProviderOptions);
		return SAMLUtils.fillTemplateData(this.metadataTemplate(serviceProviderOptions), data);
	}

	static certificateTagTemplate(serviceProviderOptions: IServiceProviderOptions): string {
		if (!serviceProviderOptions.privateKey) {
			return '';
		}

		if (!serviceProviderOptions.privateCert) {
			throw new Error('Missing certificate while generating metadata for decrypting service provider');
		}

		return serviceProviderOptions.metadataCertificateTemplate || defaultMetadataCertificateTemplate;
	}

	static metadataTemplate(serviceProviderOptions: IServiceProviderOptions): string {
		const data = {
			certificateTag: this.certificateTagTemplate(serviceProviderOptions),
		};

		const template = serviceProviderOptions.metadataTemplate || defaultMetadataTemplate;
		return SAMLUtils.fillTemplateData(template, data);
	}

	static getData(serviceProviderOptions: IServiceProviderOptions): Record<string, any> {
		if (!serviceProviderOptions.callbackUrl) {
			throw new Error('Unable to generate service provider metadata when callbackUrl option is not set');
		}

		return {
			issuer: serviceProviderOptions.issuer,
			certificate: SAMLUtils.normalizeCert(serviceProviderOptions.privateCert),
			identifierFormat: serviceProviderOptions.identifierFormat || defaultIdentifierFormat,
			callbackUrl: serviceProviderOptions.callbackUrl,
			sloLocation: `${ Meteor.absoluteUrl() }_saml/logout/${ serviceProviderOptions.provider }/`,
		};
	}
}
