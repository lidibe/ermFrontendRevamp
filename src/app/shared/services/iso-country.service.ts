import { inject, Injectable } from '@angular/core';
import { Country } from 'app/modules/directors/directors.types';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class ISOCountryService {
    countries: Country[] = [];
    private _httpClient =  inject(HttpClient);

    /**
     * Retrieves a country object based on the provided ISO code(s).
     *
     * @param {string | string[]} iso - The ISO code(s) of the country. It can be a single string or an array of strings.
     *
     * @returns {Country} The country object corresponding to the ISO code. If no valid ISO code is provided,
     * returns the default country object ('eg' for Egypt). If the input is invalid, returns null.
     *
     * - If the input is a string, the country is found by the single ISO code.
     * - If the input is an array of strings, the country is found by the first ISO code in the array.
     * - If no ISO code is provided or if the input is invalid, returns the default country or null respectively.
     */
    getCountryByIso(iso: string | string[]): Country {
        // Return default country if no ISO code is provided
        if (!iso) {
            return this.countries.find((country) => country.iso === 'eg');
        }

        // Determine if ISO is a string or an array and find the country accordingly
        if (typeof iso === 'string') {
            return this.findCountryByIso(iso);
        } else if (Array.isArray(iso) && iso.length > 0) {
            return this.findCountryByIso(iso[0]);
        }

        // Return null for invalid input
        return null;
    }

    /**
     * Finds a country object in the list of countries based on the provided ISO code,
     * ignoring case sensitivity.
     * @param iso The ISO code to search for.
     * @returns The country object matching the ISO code, or undefined if not found.
     */
    private findCountryByIso(iso: string): Country {
        return this.countries.find(
            (country) => country.iso.toLowerCase() === iso.toLowerCase()
        );
    }
    getCities() {
        return this._httpClient.get('assets/cities.json')
    }
}
