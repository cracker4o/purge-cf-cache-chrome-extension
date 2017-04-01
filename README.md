# CloudFlare Purge Plugin
Welcome to the CloudFlare Purge Plugin repository.
CF-Purge is a chrome extension that purges the cache for the current URL on CloudFlare enabled websites.
You can find the Chrome extension [here](https://chrome.google.com/webstore/detail/cloudflare-purge-plugin/nbpecchpcfacahhekolpaofpmogkmmok).

You can find more information about the "CloudFlare Purge Plugin at [www.cf-purge.com](http://www.cf-purge.com).

The CloudFlare purge plugin uses the CloudFlare API to purge any page of a website that serves its contents through the CloudFlare CDN. After you set your CF e-mail and API key in the options, you can purge the cache of any page of your CF enabled website. After version 1.3, you can purge the entire cache for the domain of your current tab.

#Changeset

v1.4.1: Fixed a critical issue when purging domains without a leading sub-domain

v1.4.0: Changed the design to reflect the new CloudFlare design guidelines. Refactored the extension code and optimized the API calls.

v1.3.6: Added the ability to purge multiple URLs from the options page

v1.3.5: Added a way to check the error message that gets returned from CloudFlare by clicking on the "Purge failed" red text

v1.3.4: Fixed an issue when trying to clear an apex domain.

v1.3.3: Changed the logic for the "Info" button to show the info even when some parts of it are missing

v1.3.2: Added a new "Info" button that shows the CloudFlare node, Ray ID and the current Cache-Control header values.

v1.3.1: Pushed a fix for a bug related to anchor links with spaces in the URL. Thanks to "solarroger".

v1.3: Added a new option to purge the whole cache for the domain of the current tab

v1.2.2: A small bug fix for the refresh functionality caused by auto updates.

v1.2.1: Added a new refresh timeout option that delays the page refresh.

v1.1: Includes a refresh function that refreshes the page on a successful purge

v1.0: The extension includes all the basic functionality that you need to purge the URL in your active tab.

#Project suggestions
If you have ideas and suggestions about this project you can post them on the CF-Purge extension [page](https://chrome.google.com/webstore/detail/cloudflare-purge-plugin/nbpecchpcfacahhekolpaofpmogkmmok). You can also make a pull request and introduce code fixes and feature implementations. 
All pull requests will be reviewed and put in the following releases.

#Licensing information
Copyright 2016 Tosho Toshev

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
