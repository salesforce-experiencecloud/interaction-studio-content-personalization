/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

Evergage.init().then(() => {
    var config = {
        global: {
            /**
             * The following Global Action Event listener adds User Data
             * captured by Data Collection LWC to every event sent to 
             * Interaction Studio 
             */
            onActionEvent: (event) => {
                var userData = interactionStudioExperienceCloudHelpers.userData;
                if(userData){
                    event.user = event.user || {};
                    event.user.attributes = event.user.attributes || {};
                    event.user.attributes.userName = ((userData?.fields?.FirstName?.value || '') + ' ' + (userData?.fields?.LastName?.value || '')).trim();
                    event.user.attributes.experienceCloudUserId = userData?.id;
                    event.user.attributes.emailAddress = userData?.fields?.Email?.value;
                    event.user.attributes.companyName = userData?.fields?.CompanyName?.value;
                }

                return event;
            }
        },
        pageTypes: [
            {
                name: "Login Page",
                action: "Login Page View",
                isMatch: () => window.location.pathname.includes("/s/login/")
            },
            {
                name: "Home Page",
                action: "Home Page View",
                isMatch: () => true,
                contentZones: [
                    {
                        name: "home_hero",
                        selector: "#is-home-hero"
                    },
                    {
                        name: "home_recs",
                        selector: '#is-product-recs'
                    }
                ]
            }
        ]
    };


    /**
     * The following listener waits until user data is sent from
     * the Data Capture LWC and then initializes Interaction 
     * Studio sitemap. It also reinitilizes the sitemap in case the
     * URL of the webpage changes, because Experience Cloud works as
     * a Single Page Application
     */
     
    let currentUrl = window.location.href;
    let isSitemapInitialized = false;
    
    document.addEventListener('lwc_onuserdataready', (e) => {
        if(isSitemapInitialized) return;
        
        isSitemapInitialized = true;
        
        interactionStudioExperienceCloudHelpers.catchBuilderContext();

        interactionStudioExperienceCloudHelpers.userData = e && e.detail && e.detail.userData;

        Evergage.initSitemap(config);

        setInterval(() => {
            if(currentUrl !== window.location.href){
                currentUrl = window.location.href;
                Evergage.reinit();
            }
        }, 1000);
    });
});