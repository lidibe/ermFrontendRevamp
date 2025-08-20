
export interface Address {
    line1: string;
    line2: string;
    line3: string;
    city: string;
    locality: string;
    state: string;
    postcode: string;
    country: string;
 }
export interface IdCard {
code: string;
type: string;
firstname: string;
lastname: string;
middlename: string;
nationality: string;
dob: string;
doi: string;
exp: string;
num: string;
coi: string;
authority: string;
documents: { code: string }[];
}

export interface Assistant {
firstname: string;
lastname: string;
email: string;
telephone: string;
mobile: string;
fax: string;
}

export interface Director {
    _id?: string;
    code?: string;
    title: string;
    firstname: string;
    institution: string;
    lastname: string;
    email: string;
    email2: string;
    telephone: string;
    mobile: string;
    fax: string;
    citizenship: string[];
    position: string;
    billing_address: Address;
    shipping_address: Address;
    assistant: Assistant;
    facebook: string;
    twitter: string;
    linkedin: string;
    youtube: string;
    is_deleted?: boolean;
    shareholding_class: string;
    language: string;
    picture?: string;
    terms: DirectorTerm[];
    ids: IdCard[];
    type?: DirectorType;
    linked_director_details?: LinkedDirector;
    hiring_date: string;
    status?: DirectorStatus;
    organization: string;
    bank_details: AccountDetail[];
    reason_for_deletion: string;
   assignments?: {
        organizationCode: string;
        committeeCodes: string[];
    }[];
 }


export interface Country {
    id: string;
    iso: string;
    name: string;
    code: string;
    flagImagePos: string;
}

export interface DirectorClass {
   code: string;
   label: string;
}

export interface DirectorLanguage {
   code: string;
   label: string;
}

export interface DirectorTerm {
   code: string;
   from: string;
   to: string;
}

export type DirectorTitle = 'dr' | 'prof' | 'mr' | 'mrs' | 'ms' | 'hon.' | 'Ph D.';

export type DirectorType = 'alternate' | 'substantive';

export type LinkedDirector =
   Pick<Director, 'code' | 'firstname' | 'lastname' | 'shareholding_class'>;

export type DirectorStatus = 'ACTIVE' | 'INACTIVE';

export interface RouteResolvedDirectorData {
   classes: DirectorClass[];
   languages: string[];
   titles: string[];
   types: string[];
   status: DirectorStatus[];
   countries: Country[];
   director: Director;
   directors: Director[];
 }
 export interface AccountDetail {
   code?: string;
   iban: string;
   account_no: string;
   bic: string;
   bank_name: string;
   bank_address: string;
 }

export enum Role {
  CHAIRMAN = 'chairman',
  MEMBER = 'member'
} 