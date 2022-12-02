import { factory } from 'offstage';

export interface User {
  email:string;
  firstname:string;
  lastname:string;
  birthdate:string;
}


export const makeUser = factory<User>({
  email: 'user@company.org',
  firstname: 'John',
  lastname: 'Doe',
  birthdate: '1990-01-01',
});

export const makeUntyped = factory({
  email: 'user@company.org',
  firstname: 'John',
  lastname: 'Doe',
  birthdate: '1990-01-01',
});

