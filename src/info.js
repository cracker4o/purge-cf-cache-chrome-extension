/* Copyright 2019 Tosho Toshev

   Licensed under the Apache License, Version 2.0 (the 'License');
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an 'AS IS' BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import Utility from './utility.js';

export default class PurgeInfo {
    constructor() {
        this.stats = {
            serverLocation: null,
            ray: null,
            status: null,
            cacheControl: null,
        };

        this.airports = {
            AKL: 'Auckland, NZ',
            AMS: 'Amsterdam, NL',
            ARN: 'Stockholm, SE',
            ATL: 'Atlanta, US',
            BOM: 'Mumbai, IN',
            CAN: 'Guangzhou, CN',
            CDG: 'Paris, FR',
            CPH: 'Copenhagen, DK',
            CTU: 'Chengdu, CN',
            DEL: 'New Delhi, CN',
            DFW: 'Dallas, US',
            DOH: 'Doha, QA',
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
            ICN: 'Seoul, KR',
            JNB: 'Johannesburg, ZA',
            JYG: 'Jiaxing, CN',
            KIX: 'Osaka, JP',
            KUL: 'Kuala Lumpur, MY',
            KWI: 'Kuwait City, KW',
            LAX: 'Los Angeles, US',
            LHR: 'London, GB',
            LIM: 'Lima, PE',
            LYA: 'Luoyang, CN',
            MAA: 'Chennai, IN',
            MAD: 'Madrid, ES',
            MAN: 'Manchester, GB',
            MBA: 'Mombasa, KE',
            MCT: 'Muscat, OM',
            MDE: 'Medellín, CO',
            MIA: 'Miami, US',
            MLE: 'Melbourne, AU',
            MRS: 'Marseille, FR',
            MXP: 'Milan, IT',
            NAY: 'Langfang, CN',
            NRT: 'Tokyo, JP',
            ORD: 'Chicago, US',
            OTP: 'Bucharest, RO',
            PHX: 'Phoenix, US',
            PDX: 'Portland, US',
            PRG: 'Prague, CZ',
            SCL: 'Valparaíso, CL',
            SEA: 'Seattle, US',
            SFO: 'San Francisco, US',
            SHE: 'Shenyang, CN',
            SIN: 'Singapore, SG',
            SJC: 'San Jose, US',
            SYD: 'Sydney, AU',
            SZX: 'Dongguan, CN',
            TAO: 'Qingdao, CN',
            TSN: 'Tianjin, CN',
            TXL: 'Berlin, DE',
            VIE: 'Vienna, IT',
            WAW: 'Warsaw, PL',
            XIY: 'Xi\'an, CN',
            YUL: 'Montreal, CA',
            YVR: 'Vancouver, CA',
            YYZ: 'Toronto, CA',
            ZRH: 'Zurich, CH',
        };

        /* eslint-disable no-undef */
        this.elements = {
            infoBtn: document.querySelector('#infoBtn'),
            details: document.querySelector('#details'),
            purgeButton: document.querySelector('#purgeButton'),
            status: document.querySelector('#status'),
        };
        /* eslint-enable no-undef */
        this.elements.infoBtn.addEventListener('click', this.getUrl.bind(this));
    }

    async getUrl(e) {
        e.preventDefault();
        this.elements.details.className = '';
        this.elements.details.innerHTML = '';
        const utility = new Utility();
        const tab = await utility.getCurrentTab();
        if (tab.url === undefined) {
            return;
        }

        try {
            /* eslint-disable no-undef */
            const response = await fetch(tab.url, {
                method: 'GET',
            });
            /* eslint-enable no-undef */
            const cfRay = response.headers.get('cf-ray');
            const cacheStatus = response.headers.get('cf=cache-status');
            const cacheControl = response.headers.get('cache-control');

            if (cfRay == null && cacheStatus == null) {
                this.elements.purgeButton.className = '';
                this.elements.status.classList.add('error');
                utility.setStatusMessage('#status', 'NO INFO AVAILABLE', 3000);
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
                this.elements.details.innerHTML = `Node location ${this.stats.serverLocation}<br/>`;
                this.elements.details.innerHTML += `Ray: ${this.stats.ray}<br/>`;
                this.elements.details.innerHTML += `Status: ${this.stats.status}<br/>`;
                this.elements.details.innerHTML += `Cache control: ${this.stats.cacheControl}<br/>`;
            }
        } catch (ex) {
            this.elements.purgeButton.className = '';
            this.elements.status.classList.add('error');
            utility.setStatusMessage('#status', 'NO INFO AVAILABLE', 3000);
        }
    }
}
