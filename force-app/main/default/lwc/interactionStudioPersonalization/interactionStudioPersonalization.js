/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, api } from 'lwc';
export default class InteractionStudioPersonalization extends LightningElement {
	@api contentZone = '';

	get contentZoneSelector() {
		return '#' + this.contentZone;
	}

	showPlaceholder = false;
	receivedContent = false;

	get isContentZoneEmpty() {
		return this.contentZone == '';
	}

	connectedCallback() {
		/* Show placeholder content if we are in the Builder Context */
		document.addEventListener('interactionstudio_onbuildercontextdetected', (e) => {
			this.showPlaceholder = !this.receivedContent;
		});
	}

	renderedCallback() {
		this.addContentListener();
		this.dispatchComponentReadyEvent();
	}

	addContentListener() {
		document.addEventListener('interactionstudio_oncontentforcomponentready', (e) => {
			if (e.detail && e.detail.selector == this.contentZoneSelector) {
				/* Hide placeholder if content is received */
				this.receivedContent = true;
				this.showPlaceholder = false;

				/* Set real content of the LWC */
				this.template.querySelector('div.interactionstudio_content').innerHTML = e.detail.html;

				/* Send Impression stat if needed */
				if (e.detail.dontSendImpression !== true) {
					this.sendStat('Impression', this.template.querySelector('[data-evg-experience-id]'));
				}

				/* Send Clickthrough stat when clicked on anchor elements */
				this.addExperienceClickListener();
			}
		});
	}

	addExperienceClickListener() {
		/* Capture any clicks and send campaign stats */
		this.template.querySelector('div.interactionstudio_content a').addEventListener('click', (e) => {
			this.sendStat('Clickthrough', e?.toElement?.closest('[data-evg-experience-id]'));
		});
	}

	dispatchComponentReadyEvent() {
		document.dispatchEvent(new CustomEvent('lwc_oncomponentready', {
			bubbles: true,
			composed: true,
			detail: { contentZone: this.contentZone }
		}));
	}

	sendStat(stat, experienceElement) {
		if (!experienceElement) return;

		const payload = {
			campaignStats: [
				{
					stat: stat,
					experienceId: experienceElement.getAttribute('data-evg-experience-id'),
					control: experienceElement.getAttribute('data-evg-user-group') === 'Control',
				}
			]
		};

		document.dispatchEvent(new CustomEvent('lwc_onstatsend', { 
			bubbles: true,
			composed: true,
			detail: payload 
		}));
	}
}