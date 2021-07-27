/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, wire } from 'lwc';
import userId from '@salesforce/user/Id'
import { getRecord } from 'lightning/uiRecordApi';

export default class InteractionStudioDataCapture extends LightningElement {
    showPlaceholder = false;

    connectedCallback() {
        /* Show placeholder content if we are in the Builder Context */
        document.addEventListener('interactionstudio_onbuildercontextdetected', (e) => {
            this.showPlaceholder = true;
        });

        document.dispatchEvent(new CustomEvent('lwc_oncomponentready', {
            bubbles: true,
            composed: true			
        }));
    }

    @wire(getRecord, { recordId: userId, layoutTypes: ['Full'], modes: ['View'] })
    wiredRecord({ error, data }) {
        if (!userId) {
            this.initInteractionStudio(null);
        }
        else if (data) {
            this.initInteractionStudio(data);
        }
        else if (error) {
            console.debug('wiredRecord error: ', error);
        }
    }

	initInteractionStudio(userData) {
        const event = new CustomEvent('lwc_onuserdataready', {
            bubbles: true,
            composed: true,
            detail: { userData: userData }
        });
		
		document.dispatchEvent(event);

		document.addEventListener('evergage:onInit', () => {
			setTimeout(() => {
				document.dispatchEvent(event);
			}, 100);
		});
    }
}