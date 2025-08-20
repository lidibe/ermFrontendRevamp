export interface Group {
    code: string
    members: Array<User>
    name: string;
}

export interface GroupAndUsers {
    name: string;
    users: Array<string>;
}

export interface User {
    _id: string;
    code: string;
    email: string;
    firstname: string;
    lastname: string;
}
