/* Copyright 2019 Tosho Toshev

   Licensed under the Apache License, Version 2.0 (the 'License');
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an 'AS IS' BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License. */
/* eslint-disable no-undef */

import Utility from './utility.js';

export default class PurgeInfo {
    constructor() {
        this.stats = {
            serverLocation: null,
            ray: null,
            status: null,
            cacheControl: null,
        };

        this.utility = new Utility();

        /**
         * A hash map with Airport codes and Airport names for the Cloudflare edge nodes.
         */
        this.airports = {
            AKL: 'Auckland, NZ',
            AMS: 'Amsterdam, NL',
            ARN: 'Stockholm, SE',
            ATL: 'Atlanta, US',
            BNA: 'Nashville, US',
            BOM: 'Mumbai, IN',
            BOS: 'Boston, US',
            BUF: 'Buffalo, US',
            CAN: 'Guangzhou, CN',
            CDG: 'Paris, FR',
            CLT: 'Charlotte, US',
            CMH: 'Columbus, US',
            CPH: 'Copenhagen, DK',
            CTU: 'Chengdu, CN',
            DEL: 'New Delhi, CN',
            DEN: 'Denver, US',
            DFW: 'Dallas, US',
            DOH: 'Doha, QA',
            DTW: 'Detroit, US',
            DUB: 'Dublin, IE',
            DUS: 'Dusseldorf, DE',
            DXB: 'Dubai, AE',
            EWR: 'Newark, US',
            EZE: 'Buenos Aires, AR',
            FOC: 'Fuzhou, CN',
            FRA: 'Frankfurt, DE',
            GRU: 'São Paulo, BR',
            HGH: 'Hangzhou, CN',
            HKG: 'Hong Kong, HK',
            HNY: 'Hengyang, CN',
            IAD: 'Ashburn, US',
            IAH: 'Houston, US',
            ICN: 'Seoul, KR',
            IND: 'Indianapolis, US',
            JAX: 'Jacksonville, US',
            JNB: 'Johannesburg, ZA',
            JYG: 'Jiaxing, CN',
            KIX: 'Osaka, JP',
            KUL: 'Kuala Lumpur, MY',
            KWI: 'Kuwait City, KW',
            LAS: 'Las Vegas, US',
            LAX: 'Los Angeles, US',
            LHR: 'London, GB',
            LIM: 'Lima, PE',
            LYA: 'Luoyang, CN',
            MAA: 'Chennai, IN',
            MAD: 'Madrid, ES',
            MAN: 'Manchester, GB',
            MBA: 'Mombasa, KE',
            MCI: 'Kansas City, US',
            MCT: 'Muscat, OM',
            MDE: 'Medellín, CO',
            MEM: 'Memphis, US',
            MFE: 'Mcallen, US',
            MGM: 'Montgomery, US',
            MIA: 'Miami, US',
            MLE: 'Melbourne, AU',
            MRS: 'Marseille, FR',
            MSP: 'Minneapolis, US',
            MXP: 'Milan, IT',
            NAY: 'Langfang, CN',
            NRT: 'Tokyo, JP',
            OMA: 'Omaha, US',
            ORD: 'Chicago, US',
            ORF: 'Norfolk, US',
            OTP: 'Bucharest, RO',
            PHL: 'Philadelphia, US',
            PHX: 'Phoenix, US',
            PIT: 'Pittsburgh, US',
            PDX: 'Portland, US',
            PRG: 'Prague, CZ',
            RIC: 'Richmond, US',
            SAN: 'San Diego, US',
            SCL: 'Valparaíso, CL',
            SEA: 'Seattle, US',
            SFO: 'San Francisco, US',
            SHE: 'Shenyang, CN',
            SIN: 'Singapore, SG',
            SJC: 'San Jose, US',
            SLC: 'Salt Lake City, US',
            SMF: 'Sacramento, US',
            STL: 'St. Louis, US',
            SYD: 'Sydney, AU',
            SZX: 'Dongguan, CN',
            TAO: 'Qingdao, CN',
            TLH: 'Tallahassee, US',
            TPA: 'Tampa, US',
            TSN: 'Tianjin, CN',
            TXL: 'Berlin, DE',
            VIE: 'Vienna, IT',
            WAW: 'Warsaw, PL',
            XIY: 'Xi\'an, CN',
            YOW: 'Ottawa, CA',
            YUL: 'Montreal, CA',
            YVR: 'Vancouver, CA',
            YWG: 'Winnipeg, CA',
            YXE: 'Saskatoon, CA',
            YYC: 'Calgary, CA',
            YYZ: 'Toronto, CA',
            ZRH: 'Zurich, CH',
        };

        this.elements = {
            infoBtn: document.querySelector('#infoBtn'),
            details: document.querySelector('#details'),
            purgeButton: document.querySelector('#purgeButton'),
            status: document.querySelector('#status'),
        };

        this.elements.infoBtn.addEventListener('click', this.getUrl.bind(this));
    }

    /**
     * Gets Cloudflare response INFO headers for the current URL.
     * @param {*} e Event object
     */
    async getUrl(e) {
        e.preventDefault();
        this.elements.details.className = '';
        this.elements.details.innerHTML = '';
        const tab = await this.utility.getCurrentTab();
        if (tab.url === undefined) {
            return;
        }

        try {
            const response = await this.utility.makeRequest(tab.url, 'GET');

            if (response && response.status === 200) {
                const cfRay = response.getResponseHeader('cf-ray');
                const cacheStatus = response.getResponseHeader('cf-cache-status');
                const cacheControl = response.getResponseHeader('cache-control');

                if (cfRay == null && cacheStatus == null) {
                    this.elements.status.classList.add('error');
                    this.utility.setStatusMessage(document.querySelector('#status'), 'NO INFO AVAILABLE', 3000);
                    return;
                }

                const rayParts = cfRay.split('-');
                const ray = rayParts[0];
                this.stats.ray = ray;
                this.stats.serverLocation = this.airports[rayParts[1]];
                this.stats.status = cacheStatus;
                this.stats.cacheControl = cacheControl;

                if (this.stats.ray) {
                    this.elements.details.classList.add('active');
                    this.elements.details.innerHTML = `Node location: ${this.stats.serverLocation}<br/>`;
                    this.elements.details.innerHTML += `Ray: ${this.stats.ray}<br/>`;
                    this.elements.details.innerHTML += `Status: <strong>${this.stats.status}</strong><br/>`;
                    this.elements.details.innerHTML += `Cache control: ${this.stats.cacheControl}<br/>`;
                }
            }
        } catch (ex) {
            // this.elements.purgeButton.className = '';
            this.elements.status.classList.add('error');
            this.utility.setStatusMessage(document.querySelector('#status'), 'NO INFO AVAILABLE', 3000);
        }
    }
}
